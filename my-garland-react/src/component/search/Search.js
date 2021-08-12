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

import SuggestAddresses from '../SearchResult/NoResult/SuggestAddresses';
import Result from '../SearchResult/Result';
import SearchWidget from './SearchWidget';
import {factorList} from '../../config/data.json';

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
    let query = useQuery();
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
                setMapPoint={props.setMapPoint}
            />
        </Route>
        <Route path='/unmatch'>
            <SuggestAddresses suggestTerm={query.get('searchTerm')}/>
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
    const [cityFacilityParameter, setCityFacilityParameter] = useState(null);
    const [parcelFieldParameter, setParcelFieldParameter] = useState(null);
    const [serviceZoneParameter, setServiceZoneParameter] = useState(null);
    
    return (<div style={{ minHeight: '200px' }}>
        <SearchWidget   setMapPoint={props.setMapPoint}/>
        <CityFacilityList factorList = {factorList} category = 'city-facility'    setPara = {setCityFacilityParameter}/>
        <ParcelFieldList factorList = {factorList}    category = 'parcel-data'    setPara = {setParcelFieldParameter}/>
        <ServiceZoneList  factorList = {factorList}   category = 'service-zone'  setPara = {setServiceZoneParameter}/>
        {
           serviceZoneParameter&& cityFacilityParameter&&parcelFieldParameter?
           <article>
               <div className='container-fluid' id='my-garland-result' >
                    <div className='row ' >
                        <SearchContent
                            cityFacilityParameter={cityFacilityParameter}
                            parcelFieldParameter={parcelFieldParameter}
                            serviceZoneParameter={serviceZoneParameter}
                            setMapPoint={props.setMapPoint}
                        />
                    </div>
                </div>
    
            </article>
           : 
           <LinearProgress className='p-1 m-4'style={{width:'100%'}}/>
        }
        
    </div>)
}

export default AddressSearch;