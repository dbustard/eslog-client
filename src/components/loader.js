import React from 'react';
import {ClipLoader} from 'react-spinners';

const Loader = ({loading}) => 
    loading? 
    <div className='loader'>
        <div className="loader-spinner" >
        <ClipLoader color="white"/>
        </div>
    </div>
    : null

export default Loader;