const {actions} = require('../actions/ui-actions');

const init = {
    loading: false
}

const uiReducer  = (state=init, action) =>{
    switch (action.type){
        case actions.SHOW_LOADING:
            return {...state, loading: true};
        case actions.HIDE_LOADING:
            return {...state, loading: false};
        default:
            return state;
    }
}
export default uiReducer;