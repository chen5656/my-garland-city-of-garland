import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import { loadModules } from 'esri-loader';
import json_factorList from '../../data/factorList.json';

import { Route, Switch } from "react-router-dom";



import LinearProgress from '@material-ui/core/LinearProgress';

function NoMatch(props) {
    return <div>{props.searchTerm}</div>;
}

export default class AddressSearch extends Component {
    constructor() {
        super();
        this.state = {
            searchReady: false,
        };
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

    render() {
        return (
            <div style={{ minHeight: '200px' }}>
                {this.state.searchReady ?
                    <>
                        <SearchWidget />
                        <Switch> 
                            <Route exact path="/"  ><div></div></Route>
                            <Route path="/id/:addressId" render={({ match }) => {                                
                                return <Result
                                    RefID={match.params.addressId}
                                    factorList={{
                                        'city-facility': this.state['city-facility'],
                                        'parcel-data': this.state['parcel-data'],
                                        'service-zone': this.state['service-zone'],
                                    }}
                                    parcelFields={this.state.parcelFields}
                                    wrongRefID={this.handleWrongRefID}
                                />
                            }} />
                            <Route path="/nomatch/:searchTerm" render={({ match }) => {
                                debugger;
                                return       <NoMatch
                                searchTerm={match.params.searchTerm}
                                />
                            }} />

                         </Switch> 
                    </>
                    :
                    <LinearProgress style={{ top: '20px', background: '#c5c0c0' }} />
                }

            </div>
        );
    }
}


