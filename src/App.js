
import React from 'react';
import Header from './component/home/Header';
import Footer from './component/home/Footer';
import Search from './component/search/Search';
import Container from '@material-ui/core/Container';

import {
  BrowserRouter as Router,
} from "react-router-dom";


function App() {
  return (


    <Container maxWidth={false} >
      <Router>
        <Header />
        <Search />
        <Footer />
      </Router>
    </Container>
  );
}

export default App;
