import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import AddressIDRouter from './Router';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import { loadModules } from 'esri-loader';
import json_factorList from '../../data/factorList.json';

import {
    BrowserRouter as Router,
    useLocation
} from "react-router-dom";



import LinearProgress from '@material-ui/core/LinearProgress';

function QueryParamsDemo(props) {
    let query = new URLSearchParams(useLocation().search);
    let id = null, searchTerm = null;
    for (var pair of query.entries()) {
        var key = pair[0].toLocaleLowerCase();
        if (key === "id" || key === "addressid") {
            id = pair[1];
            break;
        } 
    }
    if(id){
        props.displayResult(searchTerm, id);

    }
    return null;
}

export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            isShowResult: false,
            Ref_ID: null,
            suggestTerm: '',
            searchReady: false,
        };
        this.handleDisplayResult = this.handleDisplayResult.bind(this);
        this.handleDisplaySuggestion = this.handleDisplaySuggestion.bind(this);
        this.handleNewSearch = this.handleNewSearch.bind(this);
    }

    getCityFacilityList(factorList, category = 'city-facility') {
        const that = this;
        loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'])
            .then(([Query, QueryTask]) => {
                let array = factorList.filter(item => item.inputControl.category === category);
                let queryList = array.map(function (item) {
                    return new QueryTask({
                        url: item.inputControl.url
                    }).execute(new Query({
                        where: item.inputControl.where,
                        returnGeometry: true,
                        outFields: item.inputControl.outputFields
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

    getParcelFieldList(factorList, category = 'parcel-data') {
        let array = factorList.filter(item => item.inputControl.category === category);
        let newArray = array.map(item => item.inputControl.outputFields).flat();
        this.setState({ [category]: array })
        this.setState({ parcelFields: newArray })
    }

    getServiceZoneList(factorList, category = 'service-zone') {
        const that = this;
        loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'])
            .then(([Query, QueryTask]) => {
                let array = factorList.filter(item => item.inputControl.category === category);
                let queryList = array.map(function (item) {
                    return new QueryTask({
                        url: item.inputControl.url
                    }).execute(new Query({
                        returnGeometry: true,
                        outFields: item.inputControl.outputFields,
                        where: '1=1',
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

    componentDidMount = () => {
        this.getCityFacilityList(json_factorList);
        this.getParcelFieldList(json_factorList);
        this.getServiceZoneList(json_factorList);
    }

    componentDidUpdate = () => {
        if (this.state['city-facility'] && this.state['parcel-data'] && this.state['service-zone']) {
            if (!this.state.searchReady) {
                this.setState({ searchReady: true });
            }
        }
    }

    handleDisplaySuggestion(suggestTerm){
        this.setState({ suggestTerm: suggestTerm });
        if (!this.state.isShowResult&&suggestTerm) {
            this.setState({ isShowResult: true });
        }
    }
    handleDisplayResult(Ref_ID) {

        // loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'])
        // .then(([Query, QueryTask]) => {
        //   that.getAddressInfo(Query, QueryTask, that.props.RefID)
        // });
        if (this.state.Ref_ID !== Ref_ID) {
            this.setState({ Ref_ID: Ref_ID });
        }
        if (!this.state.isShowResult&&Ref_ID) {
            this.setState({ isShowResult: true });
        }
    }

    handleNewSearch() {

        this.setState({
            isShowResult: false,
            Ref_ID: null,
            searchTerm: null,
        });
    }

    render() {
        return (


            <div style={{ minHeight: '200px' }}>
                {this.state.searchReady ?
                    <>

                        <Router>
                            <QueryParamsDemo displayResult={this.handleDisplayResult} />
                        </Router>
                        <SearchWidget
                            displayResult={this.handleDisplayResult}
                            newSearch={this.handleNewSearch}
                            displaySuggestion={this.handleDisplaySuggestion}
                        />
                    </>

                    :
                    <LinearProgress style={{ top: '20px', background: '#c5c0c0' }} />
                }
                {this.state.isShowResult &&
                    (this.state.Ref_ID ?
                        <Result
                            RefID={this.state.Ref_ID}
                            factorList={{
                                'city-facility': this.state['city-facility'],
                                'parcel-data': this.state['parcel-data'],
                                'service-zone': this.state['service-zone'],
                            }}
                            parcelFields={this.state.parcelFields}
                            wrongRefID={this.handleWrongRefID}
                        />
                        :
                        <AddressNotFound suggestTerm={this.state.suggestTerm} />)}
            </div>
        );
    }
}


