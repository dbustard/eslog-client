import {combineReducers} from 'redux';
import entryLogReducer from './entry-log-reducer';
import uiReducer from './ui-reducer';

export default combineReducers({
    entryLog: entryLogReducer,
    ui: uiReducer
})