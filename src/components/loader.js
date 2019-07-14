import React from 'react';
import {connect} from 'react-redux';
import {ClipLoader} from 'react-spinners';

const Loader = ({loading}) => 
    loading? 
    <div className='loader'>
        <div className="loader-spinner" >
        <ClipLoader color="white"/>
        </div>
    </div>
    : null

const mapStateToProps = state => {
    return {
        loading: state.ui.loading
    };
}
export default connect(mapStateToProps)(Loader);