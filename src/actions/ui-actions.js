const actions = {
    SHOW_LOADING: "SHOW_LOADING",
    HIDE_LOADING: "HIDE_LOADING"
}

const showLoading = () =>{
    return {type: actions.SHOW_LOADING};
}

const hideLoading = () =>{
    return {type: actions.HIDE_LOADING};
}

module.exports = {
    actions: actions,
    showLoading: showLoading,
    hideLoading: hideLoading
}