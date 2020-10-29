import React from "react";
import {
  BrowserRouter as Router,
  useLocation
} from "react-router-dom";


export default function QueryParamsExample(props) {
  return (
    <Router>
      <QueryParamsDemo displayResult={props.displayResult}/>
    </Router>
  );
}

//http://localhost:3000/?addressId=20606
function QueryParamsDemo(props) {
    let query = new URLSearchParams(useLocation().search);
    let addressId=query.get("id");
    if(!addressId){
        addressId=query.get("addressid");
    }
    props.displayResult('', addressId);
  
    return null;
  }
  