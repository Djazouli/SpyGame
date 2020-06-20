import { combineReducers } from 'redux'
import users from './users';
import votes from './votes';
import game from './game';
import words from './words';


export default combineReducers({
    users,
    votes,
    game,
    words,
})
