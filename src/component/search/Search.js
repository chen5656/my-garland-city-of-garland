import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import { loadModules } from 'esri-loader';
import json_factorList from '../../data/factorList.json';


export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            isShowResult: false,
            Ref_ID: null,
            searchTerm: null,
        };
        this.handleDisplayResult = this.handleDisplayResult.bind(this);
        this.handleNewSearch = this.handleNewSearch.bind(this);
    }

    getCityFacilityList(factorList, category = 'city-facility') {
        const that = this;
        loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'], { css: true })
            .then(([Query, QueryTask]) => {
                let array = factorList.filter(item => item.inputControl.category === category);
                let queryList = array.map(function (item) {
                    return new QueryTask({
                        url: item.inputControl.url
                    }).execute(new Query({
                        where: item.inputControl.where,
                        returnGeometry: true,
                        outFields: ['*']
                    }));
                });
                Promise.all(queryList).then((values) => {
                    that.setState({
                        [category]: array.map(function (item, i) {
                            item.inputControl.features = values[i].features;
                            return item;
                        })
                    })
                });
            });


    }

    getParcelFieldLit(factorList, category = 'parcel-data') {
        let array = factorList.filter(item => item.inputControl.category === category);
        let newArray = array.map(item => item.inputControl.outputFields).flat();
        this.setState({ [category]: array })
        this.setState({ parcelFields: newArray })
    }

    componentDidMount = () => {
        this.getCityFacilityList(json_factorList);
        this.getParcelFieldLit(json_factorList);
    }

    componentDidUpdate = () => {
        console.log(this.state)
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

    handleNewSearch() {

        this.setState({ isShowResult: false });
        this.setState({ Ref_ID: null });
        this.setState({ searchTerm: null });
    }

    render() {
        return (
            <div>
                <SearchWidget displayResult={this.handleDisplayResult} newSearch={this.handleNewSearch} ></SearchWidget>
                {this.state.isShowResult &&
                    (this.state.Ref_ID ?
                        <Result RefID={this.state.Ref_ID} factorList={{
                            'city-facility': this.state['city-facility'],
                            'parcel-data': this.state['parcel-data'],
                        }}
                            parcelFields={this.state.parcelFields}
                        />
                        :
                        <AddressNotFound searchTerm={this.state.searchTerm} RefID={this.state.Ref_ID} />)}
            </div>
        );
    }
}


