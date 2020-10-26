import React from "react";
import {
  BrowserRouter as Router,
  Link,
  useLocation
} from "react-router-dom";

// React Router does not have any opinions about
// how you should parse URL query strings.
//
// If you use simple key=value query strings and
// you do not need to support IE 11, you can use
// the browser's built-in URLSearchParams API.
//
// If your query strings contain array or object
// syntax, you'll probably need to bring your own
// query parsing function.

export default function QueryParamsExample() {
  return (
    <Router>
      <QueryParamsDemo />
    </Router>
  );
}

// A custom hook that builds on useLocation to parse
// the query string for you.
function useQuery() {
  return new URLSearchParams(useLocation().search);
}
//http://localhost:3000/?addressId=20606
function QueryParamsDemo() {
    let query = useQuery();
    let addressId11=query.get("addressId");
    debugger;
  
    return (  null
        //   <Child name={query.get("name")} addressId={query.get("addressId")} />
    );
  }
  
  function Child(paras) {
      console.log(paras)
    return (null
    );
  }