
const actions = {
    RECEIVE_TEMPLATE: "RECEIVE_TEMPLATE",
    RECEIVE_LOG: "RECEIVE_LOG",
    SET_ERROR: "ERROR_SET",
    CLEAR_ERROR: "ERROR_CLEAR"
}

const receiveTemplate = template =>{
    return {type: actions.RECEIVE_TEMPLATE, payload: template};
}

const receiveLog = log =>{
    return {type: actions.RECEIVE_LOG, payload: log};
}

const setError = error =>{
    return {type: actions.SET_ERROR, payload: error};
}

const clearError = () =>{
    return {type: actions.CLEAR_ERROR};
}

module.exports = {
    actions: actions,
    receiveTemplate: receiveTemplate,
    receiveLog: receiveLog,
    setError: setError,
    clearError: clearError 
}