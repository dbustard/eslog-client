import React from 'react';
import UploadData from './components/upload-data';
import './App.css';

function App() {
  return (
    <div className="App container">

    <div className='jumbotron'>
        <h1>Employee Shift Log</h1>
      </div>
      <div>
        <UploadData />
      </div>
    </div>
  );
}

export default App;
