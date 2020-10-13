import ReactDOM from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import { loadModules } from 'esri-loader';
import AddressNotFound from './AddressNotFound';
import SearchResult from './SearchResult';
import SearchWidget from './SearchWidget';
import Grid from '@material-ui/core/Grid';

const containerStyle = {
    margin: '2px',
    padding: '50px 5px 50px 5px',
    background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

export default function Search() {

    const [isShowResult, setIsSHowResult] = useState(null);
    const [isSearchAddressFound, setIsAddressFound] = useState(null);


    function handleSearchResult(Ref_ID) {
        setIsSHowResult(true);
        setIsAddressFound(true);
        alert(Ref_ID);
    }

    function handleAddressNotFound() {
        setIsSHowResult(true);
        setIsAddressFound(false);
    }

    return (
        <div>
            <Grid container style={containerStyle} direction='row' justify='center'>
                <Grid item lg={4} md={8} alignItems="stretch" direction='column' justify='center'>
                    <Grid item   >Enter a valid City of Garland Address to look up City data.</Grid>
                    <Grid item style={{ marginTop: '10px' }} >
                        <SearchWidget displaySearchResult={handleSearchResult} addressNotFound={handleAddressNotFound}></SearchWidget>
                    </Grid>
                </Grid>
            </Grid>
            {isShowResult && (isSearchAddressFound ? <SearchResult /> : <AddressNotFound />)}
        </div>
    );
}


