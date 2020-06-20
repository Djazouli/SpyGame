from datetime import datetime

from django.db import models

# Create your models here.
class Game(models.Model):

    class Status(models.TextChoices):
        PENDING = "PENDING"
        STARTED = "STARTED"
        VOTING = "VOTING"
    game_id = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    spy = models.ForeignKey('GameUser', on_delete=models.CASCADE, null=True, blank=True, related_name="game_spy")
    spy_word = models.CharField(max_length=200, null=True, blank=True)
    other_word = models.CharField(max_length=200, null=True, blank=True)

class GameUser(models.Model):
    name = models.CharField(max_length=20)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    vote = models.ForeignKey("GameUser", on_delete=models.CASCADE, null=True, blank=True)
    vote_confirmed = models.BooleanField(default=False)

    class Meta:
        unique_together = ('name', 'game',)

class GameUserWord(models.Model):
    word = models.CharField(max_length=40)
    game_user = models.ForeignKey(GameUser, on_delete=models.CASCADE)
    posted_at = models.DateTimeField(default=datetime.now)

