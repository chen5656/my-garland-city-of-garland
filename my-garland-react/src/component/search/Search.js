import React, {
    useRef,
    useEffect,
    useState
} from 'react';
import {
    Route,
    useLocation,

} from "react-router-dom";

// import { loadModules } from 'esri-loader';

import Query from '@arcgis/core/tasks/support/Query';
import QueryTask from '@arcgis/core/tasks/QueryTask';

import AddressNotFound from './NoResult';
import Result from '../SearchResult/Result';
import SearchWidget from './SearchWidget';
import MapSection from '../SearchResult/MapSection';
import {
    dataFactors
} from '../../data/factorList';
import AddPntToMap from '../MapRelated/AddPntToMap';

import LinearProgress from '@material-ui/core/LinearProgress';

function useQuery() {
  return new URLSearchParams(useLocation().search);
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

const SearchContent=(props)=>{
    console.log(props)
    if(props.status==='nomatch'){
        return (<AddressNotFound suggestTerm={'1111 66'}/>)// search={setSearchTerm}
    }
    if(props.status==='address-not-valid'){
        return  <div className='alert alert-warning'>The address you entered does not return any information. Please make sure it is a valid address.</div>
    }
    return    <div>111 {props.status}</div>

}

const AddressSearch = (props) => {
    let query = useQuery();

    const [searchTerm, setSearchTerm] = useState(null);
    const [resultGeometry, setResultGeometry] = useState(null);
    const [fullAddress, setFullAddress] = useState(null);
    const [cityFacilityParameter, setCityFacilityParameter] = useState(null);
    const [parcelFieldParameter, setParcelFieldParameter] = useState(null);
    const [serviceZoneParameter, setServiceZoneParameter] = useState(null);
    
    const resetSearch=()=>{
        setSearchTerm(null);
        setResultGeometry(null);
    }

    return <div style={{ minHeight: '200px' }}>
        <SearchWidget searchTerm={searchTerm} resetSearch={resetSearch}/>
        <CityFacilityList factorList = {dataFactors} category = 'city-facility'    setPara = {setCityFacilityParameter}/>
        <ParcelFieldList factorList = {dataFactors}    category = 'parcel-data'    setPara = {setParcelFieldParameter}/>
        <ServiceZoneList  factorList = {dataFactors}   category = 'service-zone'  setPara = {setServiceZoneParameter}/>
        {
           serviceZoneParameter&& cityFacilityParameter&&parcelFieldParameter?
           <article>
               <div className='container-fluid' id='my-garland-result' >
                    <div className='row ' >
                        <SearchContent status={query.get("status")} />
                    </div>
                </div>

                <AddPntToMap mapviews={window.mapViewList} geometry={resultGeometry} fullAddress={fullAddress}/>
            </article>
           : 
           <LinearProgress className='p-1 m-4'style={{width:'100%'}}/>
        }
    </div>
}

export default AddressSearch;