import React, { useState, useEffect, useRef } from 'react';
import AddressNotFound from './AddressNotFound';
import ShowResult from './ShowResult';
import SearchWidget from './SearchWidget';
import Grid from '@material-ui/core/Grid';

const containerStyle = {
    margin: '2px',
    padding: '50px 5px 50px 5px',
    background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

function SearchResult(props){
    debugger;
    return(<div>{props.isShowResult && (props.isAddressFound ? <ShowResult /> : <AddressNotFound />)}</div>  );
}

export default function AddressSearch() {
    const [isShowResult, setShowResult] = useState(true);

    var isAddressFound = false;

    function handleDisplayResult(Ref_ID) {
        debugger;
        setShowResult (false);
        if (!Ref_ID) {
            //no address return
            isAddressFound = false;
            console.log('No address found')
        } else {
            isAddressFound = true;
            console.log(Ref_ID)
        }
    }

    return (
        <div>
            <Grid container style={containerStyle} direction='row' justify='center'>
                <Grid item lg={4} md={8} alignItems="stretch" direction='column' justify='center'>
                    <Grid item   >Enter a valid City of Garland Address to look up City data.</Grid>
                    <Grid item style={{ marginTop: '10px' }} >
                        <SearchWidget displayResult={handleDisplayResult} ></SearchWidget>
                    </Grid>
                </Grid>
            </Grid>
            <SearchResult isShowResult= {isShowResult}  isAddressFound ={isAddressFound}/>
        </div>
    );
}


