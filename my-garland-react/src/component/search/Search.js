import React, {
    useRef,
    useEffect,
    useState
} from 'react';
import {
    Route,
    useLocation,
    Switch,
} from 'react-router-dom';

import Query from '@arcgis/core/tasks/support/Query';
import QueryTask from '@arcgis/core/tasks/QueryTask';

import LinearProgress from '@material-ui/core/LinearProgress';
import { useRouteMatch } from "react-router-dom";


import SuggestAddresses from '../SearchResult/NoResult/SuggestAddresses';
import Result from '../SearchResult/Result';
import SearchWidget from './SearchWidget';
import {factorList} from '../../config/data.json';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const DocumentTitle=()=>{
    const query = useQuery();
    let match = useRouteMatch("/match");
    let addressId=null;
    if(match){
        addressId=query.get('addressid')&& query.get('addressid').replace(/[ ,.]/g, '');
    }

    useEffect(()=>{    
        if(addressId)    {
            document.title=`My Garland - ${addressId}`
        }else{
            document.title=`My Garland - error`
        }
    },[addressId])

    return null
    
}

const CityFacilityList = (props) => {
    useEffect(() => {
        let factors = props.factorList.filter(item => item.inputControl.category === props.category)
        let queryList = factors.map(function (item) {
            return new QueryTask({
                url: item.inputControl.url
            }).execute(new Query({
                where: item.inputControl.where,
                returnGeometry: true,
                outFields: item.inputControl.outputFields
            }));
        });
        Promise.all(queryList).then((values) => {
            let result = factors.map(function (item, i) {
                item.inputControl.features = values[i].features;
                return item;
            });
            props.setPara(result);
        });

    }, [])
    return null;
};
const ParcelFieldList = (props) => {
    useEffect(() => {
        let array = props.factorList.filter(item => item.inputControl.category === props.category);
        let newArray = array.map(item => item.inputControl.outputFields).flat();
        props.setPara({
            fields: newArray,
            parameters: array
        });
    }, [])
    return null;
};
const ServiceZoneList = (props) => {
    useEffect(() => {
        let factors = props.factorList.filter(item => item.inputControl.category === props.category);
        let queryList = factors.map(function (item) {
            return new QueryTask({
                url: item.inputControl.url
            }).execute(new Query({
                returnGeometry: true,
                outFields: item.inputControl.outputFields,
                where: '1=1',
            }));
        });
        Promise.all(queryList).then((values) => {
            let result = factors.map(function (item, i) {
                item.inputControl.features = values[i].features;
                return item;
            });
            props.setPara(result);
        });
    }, []);
    return null;

};
const SearchWithInput=(props)=>{
    useEffect(()=>{        
        props.setInputAddress(props.address);
    },[props.address])
    return null
}

const SearchContent=(props)=>{
    const query = useQuery();

    return    ( <Switch>
        <Route path='/match'>
            <Result
                RefID={
                    query.get('addressid')&& query.get('addressid').replace(/[ ,.]/g, '')
                }
                factorList={{
                    'city-facility': props.cityFacilityParameter,
                    'parcel-data': props.parcelFieldParameter.parameters,
                    'service-zone': props.serviceZoneParameter,
                }}
                parcelFields={props.parcelFieldParameter.fields}
            />
        </Route>
        <Route path='/unmatch'>
            <SuggestAddresses searchTerm={query.get('searchTerm')} setInputAddress={props.setInputAddress}/>
        </Route>
        <Route path='/search'>            
        {/* // history.push(`/search?address=${props.address}`) */}
            <SearchWithInput address={query.get('address')} setInputAddress={props.setInputAddress}/>
        </Route>
        <Route path='/address-error'>
            <div className='alert alert-warning'>The address you entered does not return any information. Please make sure it is a valid address.</div>
        </Route>
        <Route path='/'>
            <div style={{minHeight:'55px'}}></div>
        </Route>
    </Switch>
    );
}

const AddressSearch = (props) => {
    const [inputAddress,setInputAddress]=useState(null);
    const [cityFacilityParameter, setCityFacilityParameter] = useState(null);
    const [parcelFieldParameter, setParcelFieldParameter] = useState(null);
    const [serviceZoneParameter, setServiceZoneParameter] = useState(null);
    
    return (<div style={{ minHeight: '200px' }}>
        <DocumentTitle />
        <SearchWidget     inputAddress={inputAddress} setInputAddress={setInputAddress}/>
        <CityFacilityList factorList = {factorList} category = 'city-facility'    setPara = {setCityFacilityParameter}/>
        <ParcelFieldList factorList = {factorList}    category = 'parcel-data'    setPara = {setParcelFieldParameter}/>
        <ServiceZoneList  factorList = {factorList}   category = 'service-zone'  setPara = {setServiceZoneParameter}/>
        {
           serviceZoneParameter&& cityFacilityParameter&&parcelFieldParameter?              
            <SearchContent
                cityFacilityParameter={cityFacilityParameter}
                parcelFieldParameter={parcelFieldParameter}
                serviceZoneParameter={serviceZoneParameter}
                    
                setInputAddress={setInputAddress}
            />     
            : 
            <LinearProgress className='p-1 m-4'style={{width:'100%'}}/>
        }
        
    </div>)
}

export default AddressSearch;