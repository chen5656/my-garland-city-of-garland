import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';


export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            isShowResult: false,
            Ref_ID: 1,
            searchTerm: null,
        };
        this.handleDisplayResult = this.handleDisplayResult.bind(this);

    }

    handleDisplayResult(searchTerm, Ref_ID = null) {
        if (this.state.Ref_ID !== Ref_ID) {
            this.setState({ Ref_ID: Ref_ID });
        }
        if (!this.state.isShowResult) {
            this.setState({ isShowResult: true });
        }
        if (this.state.searchTerm !== searchTerm) {
            this.setState({ searchTerm: searchTerm });
        }
    }

    render() {
        return (
            <div>
                <SearchWidget displayResult={this.handleDisplayResult} ></SearchWidget>
                {this.state.isShowResult &&
                 (this.state.Ref_ID ? 
                 <Result RefID={this.state.Ref_ID} /> 
                 : 
                 <AddressNotFound searchTerm={this.state.searchTerm}  RefID={this.state.Ref_ID} />)}
            </div>
        );
    }
}


