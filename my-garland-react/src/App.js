
import React from 'react';
import Header from './component/home/Header';
import Footer from './component/home/Footer';
import Search from './component/Search/Search';

import {
  HashRouter as Router,
} from "react-router-dom";

function App() { 

  return (
    <Router>
    <div className='container-fluid'>
        <Header />
        <Search />
        <Footer />
    </div>
    </Router>
  );
}

export default App;
