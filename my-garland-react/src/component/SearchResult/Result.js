import React, {
  useRef,
  useEffect,
  useState
} from 'react';
import Query from '@arcgis/core/tasks/support/Query';
import QueryTask from '@arcgis/core/tasks/QueryTask';
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';

import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';


import { displayCategories, displaySections } from '../../data/categoryList';

import staticButtons from './staticButton';
import ListCollapse from './ListCollapse';

import ResultValueDisplay from './ResultValueDisplay';

import { withRouter } from 'react-router-dom';
import { useHistory } from 'react-router-dom';

const addressUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4';
const parcelUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5';

const useStyles = makeStyles((theme) => ({
  sectionPadding: { padding: '15px' },
  sectionHead: {
    borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
    backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
    margin: 0
  },
  nested: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
  },
  nestedIcon: {
    minWidth: '40px',
  },
  listHeight: {
    minHeight: '64px',
  },
  circularProgressWrap: {
    paddingTop: '15px',
    paddingBottom: '18px',
  },
  circularProgress: {
    color: 'rgb(0 122 163 / 74%)',
    animationDuration: '1550ms',
  },

  itemIcon: {
    fontSize: '12px', color: '#c5d5da'
  }

}));

const Factor = (props) => {
  const classes = useStyles();

  return (
    <li className='row pl-5'>
      <div className='col-sm-4 col-xs-12 pt-3 ' >{props.name}
      </div>
      <div className={'col-sm-8 col-xs-12 ml-sm-0 ml-xs-2' + classes.listHeight} >
        {(props.data.length) ? <ResultValueDisplay data={props.data} /> : <CircularProgress
          className={classes.circularProgress}
          size={25}
        />}
      </div>
    </li>)
}
const Category = (props) => {
  return (
    <ListCollapse name={props.name}>
      {/*factorList*/}
      {props.factorList.length > 0 &&
        <List component='ul' disablePadding>
          {
            props.factorList.sort((a, b) => { return a.outputControl.displayID - b.outputControl.displayID }).map((item) => {
              return <Factor key={item.id} name={item.name}
                data={props.factorDataList.filter(data => {
                  return data.id === item.id;
                })} />
            })
          }
        </List>
      }
      {/* static items */}
      {props.id === 'services' &&
        <div className='row  relative p-4'>
          {staticButtons.sort((a, b) => {
            return a.displayID - b.displayID
          }).map((item) => {
            return <div className='col-sm-5 col-xs-12 m-3' key={item.id} >
              {item.component}
            </div>
          })}
        </div>
      }
      {/*Streets condition label*/}
      {/* {(props.id === 'streets-condition') &&
        <div className='mx-5 my-3'> <StreetConditionToggle /></div>
      } */}
    </ListCollapse>
  )

}

const Section = (props) => {
  const classes = useStyles();
  const categoryList = displayCategories.filter(item => item.category === props.sectionId);


  return (<div className={classes.sectionPadding + ' col-lg-4 col-md-12 col-sm-12'}>
    <Paper elevation={3} >
      <List component='section'
        subheader={
          <ListSubheader component='h2' className={classes.sectionHead} >
            {props.name}
          </ListSubheader>
        }
      >
        {categoryList.map((item, index) => {
          return <div key={item.id}>
            <Category name={item.name} id={item.id}
              factorList={props.factorList.filter(factor => factor.outputControl.category === item.id)}
              factorDataList={props.factorDataList.filter(data => data.outputControl.category === item.id)}
            />
            {index !== (categoryList.length - 1) ? <Divider variant='middle' /> : ''}

          </div>
        })
        }
      </List>

    </Paper>
  </div>)
}

const ServiceZoneList = (props) => {
  useEffect(() => {

    if(props.geometry){
          var factorDataList = props.factorList.slice().map(function (factor) {

      var containerZone = factor.inputControl.features.find((feature) => {
        return geometryEngine.contains(feature.geometry, props.geometry);
      });
      if (!containerZone) {
        containerZone = { attributes: {} };
        factor.inputControl.outputFields.forEach((field) => {
          containerZone.attributes[field] = '';
        })
      }
      return {
        id: factor.id,
        outputControl: factor.outputControl,
        outputData: {
          attributeData: containerZone.attributes,
          fullAddress: props.fullAddress,
        }
      }
    });

    props.setResult(factorDataList);}
  }, [props.fullAddress]);
  return null;

}

const NearestCityFacilities = (props) => {
  useEffect(() => {
    if(props.geometry){
    var factorDataList = props.factorList.slice().map(function (factor) {
      var nearestFeature = factor.inputControl.features.map((feature) => {
        var distance = geometryEngine.distance(props.geometry, feature.geometry, 'miles').toFixed(2);
        return {
          attributes: feature.attributes,
          distance: distance
        };
      }).reduce(function (a, b) {
        if (a.distance < b.distance) {
          return a;
        } else {
          return b;
        }
      });

      return {
        id: factor.id,
        outputControl: factor.outputControl,
        outputData: {
          attributeData: nearestFeature.attributes,
          distance: nearestFeature.distance,
          fullAddress: props.fullAddress,
        }
      }

    });
    props.setResult(factorDataList);}
  }, [props.fullAddress]);
  return null;

}
const ParcelTableInfo = (props) => {
  useEffect(() => {
    if(props.parcelId){
    var query = new Query();
    var queryTask = new QueryTask({
      url: parcelUrl
    });
    query.where = 'PARCELID  =' + props.parcelId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = false;
    query.outFields = ['*'];
    queryTask.execute(query).then(function (results) {
      var attr = results.features[0].attributes;

      //loop through keys of a object.
      var factorDataList = props.factorList.slice().map((factor) => {
        let attributeData = {};
        factor.inputControl.outputFields.forEach((field) => {
          attributeData[field] = attr[field];
        });
        return {
          id: factor.id,
          outputControl: factor.outputControl,
          outputData: {
            attributeData: attributeData,
            fullAddress: props.fullAddress,
          }
        }
      })
      // factorDataList
      props.setResult(factorDataList);
  
    });
  }
  }, [props.parcelId]);
  return null;
}
const AddressInfo = (props) => {
  
  const history = useHistory();
  useEffect(() => {
    var query = new Query();
    var queryTask = new QueryTask({
      url: addressUrl
    });

    query.where = 'ADDRESSID =' + props.addressId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = true;
    query.outFields = ['*'];
    queryTask.execute(query).then(function (result) {
      console.log('address1')
      if (result.features.length > 0) {
        var attr = result.features[0].attributes;
        props.setParcelId(attr.PARCELID);
        props.setGeometry(result.features[0].geometry);
        props.setFullAddress('' + attr.STREETNUM + ' ' + attr.STREETLABEL + ', ' + attr.CITY + ', ' + attr.STATE + ', ' + attr.ZIPCODE);
        // result.features[0].geometry; //geometry in stateplane
      } else {
        //didn't return a result
        history.push('/address-error' );
      }
    });
  }, [props.addressId]);
  return null;
}

const Result = (props) => {
  const [factorList, setFactorList] = useState([]);
  const [fullAddress, setFullAddress] = useState(null);
  const [resultGeometry, setGeometry] = useState(null);
  const [parcelId, setParcelId] = useState(null);
  const [parcelDataResult, setParcelDataResult] = useState([]);
  const [nearestCityFacilityResult, setCityFacilityResult] = useState([]);
  const [serviceZoneResult, setServiceZone] = useState([]);
  
  useEffect(() => {
    var array = [];
    for (const [key, value] of Object.entries(props.factorList)) {
      array.push(value);
    }
    array = array.flat();
    setFactorList(array)  ;
  }, []);

  return (<>  
  <AddressInfo addressId={props.RefID} setFullAddress={setFullAddress} setGeometry={setGeometry} setParcelId={setParcelId} />    
  {fullAddress&&
    <>
      <ParcelTableInfo parcelId ={parcelId} setResult={setParcelDataResult} 
        factorList={props.factorList['parcel-data']} fullAddress={fullAddress} />}
  
      
          <NearestCityFacilities geometry ={resultGeometry} setResult={setCityFacilityResult} factorList={props.factorList['city-facility']} 
            fullAddress={fullAddress} />
          <ServiceZoneList geometry={resultGeometry} factorList={props.factorList['service-zone']} fullAddress={fullAddress} setResult={setServiceZone}/>
      
      
    </>
  }

    {//category = 'city-facility'.factorList[category]
        displaySections.map((item) => {
          return <Section name={item.name} sectionId={item.id} key={item.id}
            factorList={factorList}
            factorDataList={[].concat(parcelDataResult,nearestCityFacilityResult,serviceZoneResult)}
          />
        })
      }
  </>);
}

export default withRouter(Result);
