import React, { PureComponent } from 'react';
import { Route, Switch } from "react-router-dom";

import { loadModules } from 'esri-loader';

import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import MapSection from '../searchResult/MapSection';
import {dataFactors} from '../../data/factorList';
import AddPntToMap from '../mapRelated/AddPntToMap';

import LinearProgress from '@material-ui/core/LinearProgress';
export default class AddressSearch extends PureComponent {
    constructor() {
        super();
        this.state = {
            searchWidgetReady: false,
            searchTerm: '',
            resultGeometry: null,
            fullAddress:'',
        };
        this.handleSearchFromAddress = this.handleSearchFromAddress.bind(this);
        this.handleNewSearch = this.handleNewSearch.bind(this);
        this.getGeometryAndFullAddress = this.getGeometryAndFullAddress.bind(this);
        
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
        this.getCityFacilityList(dataFactors);
        this.getParcelFieldList(dataFactors);
        this.getServiceZoneList(dataFactors);
    }

    componentDidUpdate = () => {
        if (this.state['city-facility'] && this.state['parcel-data'] && this.state['service-zone']) {
            if (!this.state.searchWidgetReady) {
                this.setState({ searchWidgetReady: true });
            }
        }
    }

    handleSearchFromAddress(address) {
        this.setState({ searchTerm: address });
    }

    handleNewSearch() {
        this.setState({ resultGeometry: null });
        if (this.state.searchTerm) {
            this.setState({ searchTerm: '' });
        }
    }

    getGeometryAndFullAddress(geometry, fullAddress) {
        this.setState({
            resultGeometry: geometry,
            fullAddress:fullAddress,
        });
    }
    
    render() {
        return (
            <div style={{ minHeight: '200px' }}>
                <SearchWidget
                    searchTerm={this.state.searchTerm}
                    newSearch={this.handleNewSearch}                    
                />
                {this.state.searchWidgetReady ?
                    <article>
                        <div className='container-fluid' id='my-garland-result' >
                            <div className='row ' >
                                <Switch>
                                    <Route exact path="/" ><div></div></Route>
                                    <Route exact path="/address-not-valid" >
                                        <div className='alert alert-warning'>The address you entered does not return any information. Please make sure it is a valid address.</div>
                                    </Route>
                                    <Route path="/nomatch/:searchTerm" render={({ match }) => {
                                        return <AddressNotFound
                                            suggestTerm={match.params.searchTerm}
                                            search={this.handleSearchFromAddress}
                                        />
                                    }} />
                                    <Route path="/:addressId" render={({ match }) => {
                                        return <>
                                            <Result
                                                RefID={match.params.addressId.replace(/[ ,.]/g, '')}
                                                factorList={{
                                                    'city-facility': this.state['city-facility'],
                                                    'parcel-data': this.state['parcel-data'],
                                                    'service-zone': this.state['service-zone'],
                                                }}
                                                parcelFields={this.state.parcelFields}
                                                getGeometryAndFullAddress={this.getGeometryAndFullAddress}
                                            />
                                        </>
                                    }} />
                                </Switch>

                                <MapSection isVisible={this.state.resultGeometry?true:false} />

                            </div>
                        </div>

                        <AddPntToMap mapviews={window.mapViewList} geometry={this.state.resultGeometry} fullAddress={this.state.fullAddress}/>
                    </article>
                    :
                    <><LinearProgress className=' p-1 m-4 'style={{width:'100%'}}/></>
                }

            </div>
        );
    }
}

