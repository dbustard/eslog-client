import {combineReducers} from 'redux';
import entryLogReducer from './entry-log-reducer';

export default combineReducers({
    entryLog: entryLogReducer
})