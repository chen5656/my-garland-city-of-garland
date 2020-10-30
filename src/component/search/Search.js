import React, { Component } from 'react';
import { Route, Switch } from "react-router-dom";

import { loadModules } from 'esri-loader';
import LinearProgress from '@material-ui/core/LinearProgress';

import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import json_factorList from '../../data/factorList.json';

export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            searchReady: false,
            searchTerm: '',
        };
        this.handleSearchFromAddress = this.handleSearchFromAddress.bind(this);
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

    handleSearchFromAddress(address) {
        this.setState({ searchTerm: address });
    }

    handleNewSearch() {
        if (this.state.searchTerm) {
            this.setState({ searchTerm: '' });
        }
    }

    render() {
        return (
            <div style={{ minHeight: '200px' }}>
                <SearchWidget
                    searchTerm={this.state.searchTerm}
                    newSearch={this.handleNewSearch}
                />
                {this.state.searchReady ?
                    <Switch>
                        <Route exact path="/" ><div></div></Route>
                        <Route path="/id/:addressId" render={({ match }) => {
                            return <Result
                                RefID={match.params.addressId.replace(/[ ,.]/g, '')}
                                factorList={{
                                    'city-facility': this.state['city-facility'],
                                    'parcel-data': this.state['parcel-data'],
                                    'service-zone': this.state['service-zone'],
                                }}
                                parcelFields={this.state.parcelFields}
                            />
                        }} />
                        <Route exact path="/address-not-valid" >
                            <div className='alert alert-warning'>The address you entered does not return any information. Please make sure it is a valid address.</div>
                        </Route>

                        <Route path="/nomatch/:searchTerm" render={({ match }) => {
                            return <AddressNotFound
                                suggestTerm={match.params.searchTerm}
                                search={this.handleSearchFromAddress}
                            />
                        }} />
                    </Switch>
                    :
                    <LinearProgress style={{ margin: '20px', background: '#c5c0c0' }} />
                }

            </div>
        );
    }
}


