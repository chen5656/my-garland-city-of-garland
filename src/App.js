
import React from 'react';
import Header from './component/home/Header';
import Footer from './component/home/Footer';
import Search from './component/search/Search';
import Container from '@material-ui/core/Container';



function App() {
  return (
    <Container maxWidth ={false} >
      <Header />
      <Search />
      <Footer />
    </Container>
  );
}

export default App;
