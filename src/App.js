import React from 'react';
import UploadData from './components/upload-data';
import ListData from './components/list-data';
import Loader from './components/loader';
import { Provider } from 'react-redux';
import store from './stores';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <Loader  />
      <div className="App container">

      <div className='jumbotron'>
          <h1>Employee Shift Log</h1>
        </div>
        <div>
          <UploadData />
          <ListData />
        </div>
      </div>
    </Provider>
  );
}

export default App;
