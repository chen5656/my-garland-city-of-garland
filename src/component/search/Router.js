import React from "react";
import {
    BrowserRouter as Router,
    useLocation
} from "react-router-dom";


export default function QueryParamsExample(props) {
    return (
        <Router>
            <QueryParamsDemo displayResult={props.displayResult} />
        </Router>
    );
}

//http://localhost:3000/?addressId=20606
function QueryParamsDemo(props) {
    let query = new URLSearchParams(useLocation().search);
    let id=null, searchTerm = null;
    for (var pair of query.entries()) {
        var key = pair[0].toLocaleLowerCase();
        if (key === "id" || key === "addressid") {
            id= pair[1];
        }else if (key === "address") {
            searchTerm= pair[1];
        }
    }
    props.displayResult(searchTerm,id);
    return null;
}
