import React, { Component } from 'react';
import AddressNotFound from './AddressNotFound';
import Result from '../searchResult/Result';
import SearchWidget from './SearchWidget';
import { loadModules } from 'esri-loader';
import json_factorList from '../../data/factorList.json';

import { Route, Redirect, Switch, useHistory } from "react-router-dom";



import LinearProgress from '@material-ui/core/LinearProgress';


const AddresIDRoute = ({ component: Comp, refId, path, ...rest }) => {
    return (
        <Route
            path={path}
            {...rest}
            render={(props) => {
                //check refID
                debugger;
                return refId ? (
                    <Redirect
                        to={{
                            pathname: "/",
                            state: {
                                prevLocation: path,
                                error: "You need to login first!",
                            },
                        }}
                    />
                ) : (<Comp {...props} />)
            }}
        />
    );
};

function DisplaySearch(props) {
    console.log(props.addressId);
    return <div>
    {/* {this.state.isShowResult &&
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
            <AddressNotFound suggestTerm={this.state.suggestTerm} />)} */}</div>
  
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

    handleDisplaySuggestion(suggestTerm) {
        this.setState({ suggestTerm: suggestTerm });
        if (!this.state.isShowResult && suggestTerm) {
            this.setState({ isShowResult: true });
        }
    }
    handleDisplayResult(Ref_ID) {

        if (this.state.Ref_ID !== Ref_ID) {
            this.setState({ Ref_ID: Ref_ID });
        }
        if (!this.state.isShowResult && Ref_ID) {
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
                        <SearchWidget
                            displayResult={this.handleDisplayResult}
                            newSearch={this.handleNewSearch}
                            displaySuggestion={this.handleDisplaySuggestion}
                        />
                        {/* <QueryParamsDemo displayResult={this.handleDisplayResult} /> */}
                        <Switch>
                            <Route exact path="/" >
                                <div>Home</div>
                            </Route>
                            <Route path="/:addressId" component={<DisplaySearch addressId = {this.state.Ref_ID}/>}/>
                            {/* <AddresIDRoute exact path="/" refId={this.state.Ref_ID} component={<div></div>} /> */}
                            {/* <AddresIDRoute path="/id/:addressId" refId={this.state.Ref_ID} component={<div>1</div>} /> */}
                            {/* <Route>
                                <div>No match</div>
                            </Route> */}
                        </Switch>
                    </>
                    :
                    <LinearProgress style={{ top: '20px', background: '#c5c0c0' }} />
                }

            </div>
        );
    }
}


