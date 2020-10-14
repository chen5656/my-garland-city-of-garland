import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import ShowResult from '../SearchResult/ShowResult';
import SearchWidget from './SearchWidget';


export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            isShowResult: false,
            Ref_ID: null,
            searchTerm: null,
            searchTermFromUserInput: null,
        };
        this.handleDisplayResult = this.handleDisplayResult.bind(this);

    }

    handleDisplayResult(searchTerm, Ref_ID = null) {
        if (!this.state.isShowResult) {
            this.setState({ isShowResult: true });
        }
        if (this.state.searchTerm !== searchTerm) {
            this.setState({ searchTerm: searchTerm });
        }
        if (this.state.Ref_ID !== Ref_ID) {
            this.setState({ Ref_ID: Ref_ID });
        }
    }

    render() {
        return (
            <div>
                <SearchWidget displayResult={this.handleDisplayResult} ></SearchWidget>
                {this.state.isShowResult &&
                 (this.state.Ref_ID ? 
                 <ShowResult RefID={this.state.Ref_ID} /> 
                 : 
                 <AddressNotFound searchTerm={this.state.searchTerm} />)}
            </div>
        );
    }
}


