import React, {  Component } from 'react';
import AddressNotFound from './AddressNotFound';
import ShowResult from './ShowResult';
import SearchWidget from './SearchWidget';
import Grid from '@material-ui/core/Grid';

const containerStyle = {
    margin: '2px',
    padding: '50px 5px 50px 5px',
    background: 'linear-gradient(rgb(190, 188, 188), #e4e4e4, #fcfbfa)',
}

function SearchResult(props) {
    return (<div>{props.isShowResult && (props.RefID ? <ShowResult RefID ={props.RefID} /> : <AddressNotFound searchTerm = {props.searchTerm}/>)}</div>);
}

export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            isShowResult: false,
            Ref_ID: null,
            searchTerm:null,
        };
        this.handleDisplayResult = this.handleDisplayResult.bind(this);

    }

    handleDisplayResult(searchTerm,Ref_ID = null) {
        this.setState({ isShowResult: true });
        this.setState({ searchTerm: searchTerm });
        this.setState({ Ref_ID: Ref_ID });    }



    render() {
        return (
            <div>
                <Grid container style={containerStyle} direction='row' justify='center'>
                    <Grid item lg={4} md={8} alignItems="stretch" direction='column' justify='center'>
                        <Grid item   >Enter a valid City of Garland Address to look up City data.</Grid>
                        <Grid item style={{ marginTop: '10px' }} >
                            <SearchWidget displayResult={this.handleDisplayResult} ></SearchWidget>
                        </Grid>
                    </Grid>
                </Grid>
                <SearchResult isShowResult={this.state.isShowResult} searchTerm={this.state.searchTerm} RefID={this.state.Ref_ID} />
            </div>
        );
    }
}


