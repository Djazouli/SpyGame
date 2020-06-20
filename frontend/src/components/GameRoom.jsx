import React, {useState, useEffect} from "react";
import {useParams} from 'react-router-dom';
import PendingRoom from "./Rooms/PendingRoom";
import VotingRoom from "./Rooms/VotingRoom";
import StartedRoom from "./Rooms/StartedRoom";
import SelectUsername from "./Rooms/SelectUsername";
import ResultsRoom from "./Rooms/ResultsRoom";

const API_URL = 'localhost:8000';

const STATUS = {
    PENDING: "PENDING",
    VOTING: "VOTING",
    STARTED: "STARTED",
    RESULTS: "RESULTS",
};

const GameRoom = () => {
    const [username, setUsername] = useState();
    const [userList, setUserList] = useState([]);
    const [status, setStatus] = useState(STATUS.PENDING);
    const [word, setWord] = useState();
    const [gameSocket, setGameSocket] = useState();
    const [userWords, setUserWords] = useState({});
    const [error, setError] = useState();
    const [votes, setVotes] = useState({votesCountMap: {}, hasVotedMap: {}});
    const [results, setResults] = useState({has_won: null, spy: null, spy_word: null, other_word: null});

    const {id} = useParams();

    useEffect(
        () => {
            const gameSocket = new WebSocket(
                'ws://'
                + window.location.host
                + '/ws/game/'
                + id
                + '/'
            );
            setGameSocket(gameSocket);
            gameSocket.onmessage = function (e) {
                const data = JSON.parse(e.data);
                switch (data['type']) {
                    case "started":
                        setStatus(STATUS.STARTED);
                        setWord(data["word"]);
                        break;
                    case "users_list":
                        //setUserList([{name: "a"}, {"name": "b"}, {name: "c"}]);
                        setUserList(data["users_list"]);
                        break;
                    case "words":
                        //setUserWords({a: ["hello", "hello2"], b: ["salut"]});
                        setUserWords(data["words"]);
                        break;
                    case "vote_phase":
                        setStatus(STATUS.VOTING);
                        break;
                    case "votes":
                        setVotes(data["votes"]);
                        break;
                    case "results":
                        setStatus(STATUS.RESULTS);
                        setResults(data);
                        break;
                    case "username":
                        //setUsername(data["username"]);
                        break;
                    default:
                        console.log(data);
                }
            };

            gameSocket.onclose = function (e) {
                console.error('Game socket closed unexpectedly');
                setError('Failed to connect. This may be a server internal error, or the game is already running...');
            };

            gameSocket.onerror = function (e) {
                console.error('Game socket closed unexpectedly');
                setError('Failed to connect. This may be a server internal error, or the game is already running...');
            };
        }, [id]
    );

    useEffect(
        () => {
            if (gameSocket && username) {
                if (gameSocket.readyState === WebSocket.OPEN) {
                    gameSocket.send(JSON.stringify({type: "userArrival", username}))
                } else {
                    gameSocket.onopen = () => {
                        gameSocket.send(JSON.stringify({type: "userArrival", username}))
                    }
                }
            }
        }, [username, gameSocket]
    );

    if (!gameSocket) {
        return <div>Loading...</div>
    }



    if (error) {
        return <div>{error}</div>;
    }

    if (!username) {
        return <SelectUsername setUsername={setUsername}/>;
    }


    const startGame = () => {
        gameSocket.send(JSON.stringify({
            'type': 'gameStarted',
            'started': true,
        }))
    };

    const sendWord = (word) => {
        if (word === "") {
            return
        }
        gameSocket.send(JSON.stringify({
            'type': 'word',
            'word': word,
        }))
    };

    const votePhase = () => {
        gameSocket.send(JSON.stringify({
            'type': 'vote_phase',
        }))
    };

    const sendVote = (user) => {
        gameSocket.send(JSON.stringify({
            'type': 'temp_vote',
            'user': user,
        }))
    };

    const confirmVote = (user) => {
        gameSocket.send(JSON.stringify({
            'type': 'confirm_vote',
            'user': user,
        }))
    };


    // TODO: Refactor everything to redux https://medium.com/@rossbulat/react-managing-websockets-with-redux-and-context-61f9a06c125b
    if (status === STATUS.PENDING) {
        return <PendingRoom startGame={startGame} userList={userList}/>
    }
    if (status === STATUS.STARTED) {
        return <StartedRoom
            {...{word, userList, userWords, sendWord, votePhase}}
        />;
    }
    if (status === STATUS.VOTING) {
        return <VotingRoom {...{userList, ...votes, sendVote, confirmVote, currentUser: username}}/>;
    }
    if (status === STATUS.RESULTS) {
        return <ResultsRoom {...results}/>;
    }

    return <div/>;
};

export default GameRoom;
