import random
from collections import defaultdict
import json
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from .models import GameUser, Game, GameUserWord
from .words import words_list

class ChatConsumer(WebsocketConsumer):
    def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = 'chat_%s' % self.room_name
        self.game = self.get_or_create_game()
        if self.game.status != Game.Status.PENDING:
            # Deny connection
            # TODO: spec mode ? / Send connection denied
            self.denied = True
            self.close()
            return
        self.denied = False
        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )
        self.user = None
        self.accept()

    def get_or_create_game(self):
        return Game.objects.get_or_create(game_id=self.room_name)[0]

    def get_users_list(self):
        return GameUser.objects.filter(game=self.game)

    def get_words_dict(self):
        users = self.get_users_list()
        words = GameUserWord.objects.filter(game_user__in=users)
        words_dict = defaultdict(list)
        for word in words:
            words_dict[word.game_user.name].append(word.word)
        return words_dict

    def get_votes_count(self):
        users = self.get_users_list()
        votes = defaultdict(int)
        for user in users:
            name = user.name
            if name not in votes:
                votes[name] = 0
            if user.vote is not None:
                votes[user.vote.name] += 1
        return votes

    def get_results(self):
        users = self.get_users_list()
        assert all(user.vote_confirmed for user in users)
        votes_count = self.get_votes_count()
        self.game = Game.objects.get(id=self.game.id)
        spy = self.game.spy
        spy_won = votes_count[spy.name] <= sum(
            votes_count[user.name] for user in users if user != spy
        )
        results = {
            user.name: (spy_won and user == spy) or (not spy_won and user != spy) for user in users
        }
        return results


    def disconnect(self, close_code):
        if self.denied:
            return

        if self.user is not None:
            self.user.delete()
        users_list = list(self.get_users_list().values('name'))
        if not users_list:
            self.game.delete()

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'users_list',
                'users_list': users_list,
            }
        )
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name,
        )

    # Receive message from WebSocket
    def receive(self, text_data):
        data = json.loads(text_data)
        data_type = data.get("type")
        if data_type == "userArrival":
            self.manage_user_arrival(data)
        elif data_type == "gameStarted":
            self.manage_game_starting()
        elif data_type == "word":
            self.manage_new_word(data)
        elif data_type == "vote_phase":
            self.manage_vote_phase()
        elif data_type == "temp_vote":
            self.manage_vote(data["user"], False)
        elif data_type == "confirm_vote":
            self.manage_vote(data["user"], True)

    def manage_vote(self, username, confirm=False):
        if self.user.vote_confirmed:
            return
        self.user.vote = GameUser.objects.get(game=self.game, name=username)
        self.user.vote_confirmed = confirm
        self.user.save()
        users = self.get_users_list()
        hasVoted = {user.name: user.vote_confirmed for user in users}
        if all(user.vote_confirmed for user in users):
            results = self.get_results()
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'results',
                    'results': results,
                    'spy': self.game.spy.name,
                    'spy_word': self.game.spy_word,
                    'other_word': self.game.other_word,
                }
            )
            self.game.delete()
            return
        votes = self.get_votes_count()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'votes',
                'votesCount': votes,
                'hasVoted': hasVoted,
            }
        )



    def manage_vote_phase(self):
        self.game.status = Game.Status.VOTING
        self.game.save()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'vote_phase',
            }
        )
        return

    def manage_new_word(self, data):
        new_word = GameUserWord(game_user=self.user, word=data['word'])
        new_word.save()

        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'words',
                'words': self.get_words_dict(),
            }
        )
        return

    def manage_game_starting(self):
        self.game.status = Game.Status.STARTED
        words = random.choice(words_list)
        assert len(words) == 2
        users = [user[0] for user in self.game.gameuser_set.all().values_list('name')]
        spy = random.choice(users)
        word_attribution = {user: words[0 if user == spy else 1] for user in users}
        self.game.spy = GameUser.objects.get(name=spy, game=self.game)
        self.game.spy_word, self.game.other_word = words
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_start',
                'words': word_attribution,
            }
        )
        self.game.save()
        return

    def manage_user_arrival(self, data):
        username = data["username"]
        try:
            self.user = GameUser.objects.create(game=self.game, name=username)
            self.user.save()
        except Exception:
            self.send(text_data=json.dumps({
                "error": "User already exists",
            }))
            return
        self.send(text_data=json.dumps({
            "type": "username",
            "username": self.user.name,
        }))
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'users_list',
                'users_list': list(self.get_users_list().values('name'))
            }
        )
        return

    # Receive message from room group
    def users_list(self, event):
        users_list = event['users_list']
        # Send message to WebSocket
        self.send(text_data=json.dumps({
            'type': 'users_list',
            'users_list': users_list,
        }))

    def game_start(self, event):
        words = event["words"]

        self.send(text_data=json.dumps({
            'type': 'started',
            'word': words[self.user.name],
        }))

    def words(self, event):
        self.send(text_data=json.dumps({
            'type': 'words',
            'words': event['words'],
        }))

    def vote_phase(self, event):
        self.send(text_data=json.dumps({
            'type': 'vote_phase',
        }))

    def votes(self, event):
        self.send(text_data=json.dumps({
            'type': 'votes',
            'votes': {
                'hasVotedMap': event["hasVoted"],
                'votesCountMap': event["votesCount"],
            }
        }))

    def results(self, event):
        results = event["results"]
        self.send(text_data=json.dumps({
            "has_won": results[self.user.name],
            **{key: value for key, value in event.items() if key != "results"}
        }))
