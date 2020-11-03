
import React from 'react';
import Header from './component/home/Header';
import Footer from './component/home/Footer';
import Search from './component/search/Search';

import {
  HashRouter as Router,
} from "react-router-dom";

const ie11Polyfill=()=>{
  // Also polyfill Array.isArray:
  if (!Array.isArray) {
    Array.isArray = function(arg) {
      return Object.prototype.toString.call(arg) === '[object Array]';
    };
  }
  
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Polyfill
  if (!Array.prototype.flat) {
    Array.prototype.flat = function(depth) {
      var flattened = [];
      (function flat(array, depth) {
        for (var i = 0; i < array.length; i++) {
          var el = array[i];
          if (Array.isArray(el) && depth > 0) {
            flat(el, depth - 1); 
          } else {
            flattened.push(el);
          }
        }
      })(this, Math.floor(depth) || 1);
      return flattened;
    };
  }
  
  if (!Object.entries)
    Object.entries = function( obj ){
      var ownProps = Object.keys( obj ),
          i = ownProps.length,
          resArray = new Array(i); // preallocate the Array
      while (i--)
        resArray[i] = [ownProps[i], obj[ownProps[i]]];
  
      return resArray;
    };
  
  }
  
  ie11Polyfill();
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
