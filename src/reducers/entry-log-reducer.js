const {actions}  = require('../actions/entry-log-actions');
const init = {
    year: 0,
    month: 0,
    template: [],
    logs: {},
    error: ""
}


const entryLogReducer = (state=init, action) =>{
    switch (action.type){
        case actions.RECEIVE_TEMPLATE:
            return {...state, template: action.payload};
        case actions.RECEIVE_LOG:
            return {...state, logs: action.payload};
        case actions.SET_ERROR:
            return {...state, error: action.payload};
        case actions.CLEAR_ERROR:
            return {...state, error: ""};
        default:
            return state;
    }
}

export default entryLogReducer;