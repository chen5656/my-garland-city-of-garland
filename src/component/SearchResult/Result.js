import React, { Component, useState } from 'react';
import { loadModules } from 'esri-loader';
import { makeStyles } from '@material-ui/core/styles';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import Divider from '@material-ui/core/Divider';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import json_sectionList from '../../data/sectionList.json';
import json_categoryList from '../../data/categoryList.json';

import ResultValueDisplay from '../searchResult/ResultValueDisplay';

import { withRouter } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  sectionPadding: { padding: '15px' },
  sectionHead: {
    borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600,
    backgroundImage: 'linear-gradient(to right,rgb(0 122 163 / 90%), rgb(0 122 163 / 54%), rgb(0 122 163 / 24%))',
    margin: 0
  },
  categoryHead: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    paddingBottom: 0,
  },
  nested: {
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(6),
  },
  nestedIcon: {
    minWidth: '40px',
  },
  listHeight:{
    minHeight:'64px',
  },
  circularProgressWrap:{    
    paddingTop:'15px',
    paddingBottom:'18px',
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
      <div className='col-4 pt-3 ' >{props.name}
      </div>
      <div className={'col-8 ' + classes.listHeight} >
        {(props.data.length) ? <ResultValueDisplay data={props.data}/> : <CircularProgress
        className={classes.circularProgress}
        size={25}
      />} 
      </div>
    </li>)
}
const Category = (props) => {
  const [open, setOpen] = useState(true);
  const classes = useStyles();

  const handleClick = () => {
    setOpen(!open);
  };

  return (<>
    <ListItem button onClick={handleClick} className={classes.categoryHead}>
      <ListItemIcon>
        {open ? <RemoveIcon /> : <AddIcon />}
      </ListItemIcon>
      <ListItemText primary={props.name} />
      {open ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    {props.factorList.length>0&&
    <Collapse in={open} timeout="auto" unmountOnExit>
      <List component="ul" disablePadding>
        {
          props.factorList.sort((a,b)=>{return a.outputControl.displayID-b.outputControl.displayID}).map((item) => {
            return <Factor key={item.id} name={item.name}
              data={props.factorDataList.filter(data => {
                return data.id === item.id;
              })}  />
          })
        }
      </List>
    </Collapse>}
  </>
  )

}


const Section = (props) => {
  const classes = useStyles();
  const categoryList = json_categoryList.filter(item => item.category === props.category);

  return (<div  className={classes.sectionPadding + ' col-lg-4 col-md-12 col-sm-12'}>
    <Paper elevation={3} >
      <List component="section"
        subheader={
          <ListSubheader component="h2" className={classes.sectionHead} >
            {props.name}
          </ListSubheader>
        }
      >
        {
          categoryList.map((item, index) => {
            return <div key={item.id}>
              <Category name={item.name} category={item.id} 
                factorList={props.factorList.filter(factor => factor.outputControl.category === item.id)}
                factorDataList={props.factorDataList.filter(data => data.outputControl.category === item.id)}
              />
              {index !== (categoryList.length - 1) ? <Divider variant="middle"/>:''  }

            </div>
          })
        }
      </List>

    </Paper>
  </div>)
}


class Result extends Component {

  constructor(props) {
    super(props);
    this.addressUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4';
    this.parcelUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5';

    this.state = {
      factorDataList: [],
      factorList: [],
      fullAddress: null,
    };

  }

  getFactorDataList() {
    var that = this;
    loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'])
      .then(([Query, QueryTask]) => {
        that.getAddressInfo(Query, QueryTask, that.props.RefID)
      });
  }

  getAddressInfo(Query, QueryTask, addressId) {
    var that = this;
    var query = new Query();
    var queryTask = new QueryTask({
      url: this.addressUrl
    });
    query.where = "ADDRESSID =" + addressId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = true;
    query.outFields = ["*"];

    queryTask.execute(query).then(function (result) {
      if (result.features.length > 0) {
        var attr = result.features[0].attributes;
        that.getInfoFromParcelTable(Query, QueryTask, attr.PARCELID)

        console.log({
          'Parcel Id': attr.PARCELID,
          'Address': ("" + attr.STREETNUM + " " + attr.STREETLABEL + ", " + attr.CITY + ", " + attr.STATE + ", " + attr.ZIPCODE)
        })
        that.fullAddress = ("" + attr.STREETNUM + " " + attr.STREETLABEL + ", " + attr.CITY + ", " + attr.STATE + ", " + attr.ZIPCODE);
        // result.features[0].geometry; //geometry in stateplane
        that.getNearestCityFacilityList(result.features[0].geometry);
        that.getLocatedServiceZoneList(result.features[0].geometry);

      }else{
        //didn't return a result
        that.routingFunction('address-not-valid');
      }
    });
  }
  getInfoFromParcelTable(Query, QueryTask, parcelId, category = 'parcel-data') {
    var that = this;
    var query = new Query();
    var queryTask = new QueryTask({
      url: this.parcelUrl
    });
    query.where = "PARCELID  =" + parcelId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = false;
    query.outFields = ["*"];
    queryTask.execute(query).then(function (results) {
      var attr = results.features[0].attributes;

      //loop through keys of a object.
      var factorDataList = that.props.factorList[category].slice().map((factor) => {
        let attributeData ={};
         factor.inputControl.outputFields.forEach((field) => {
          attributeData[field]=attr[field];
        });
        return {
          id: factor.id,
          outputControl: factor.outputControl,
          outputData: {
            attributeData: attributeData,
            fullAddress: that.fullAddress,
          }
        }
      })
      // factorDataList
      that.setState({ factorDataList: that.state.factorDataList.concat(factorDataList) });

    });
  }



  getNearestCityFacilityList(geometry, category = 'city-facility') {

    var that = this;
    loadModules(['esri/geometry/geometryEngine'])
      .then(([geometryEngine]) => {
        var factorDataList = that.props.factorList[category].slice().map(function (factor) {
          var nearestFeature = factor.inputControl.features.map((feature) => {
            var distance = geometryEngine.distance(geometry, feature.geometry, "miles").toFixed(2);           
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
              fullAddress: that.fullAddress,
            }
          }

        });
        that.setState({ factorDataList: that.state.factorDataList.concat(factorDataList) });

      })

  }

  getLocatedServiceZoneList(geometry, category = 'service-zone') {
    var that = this;
    loadModules(['esri/geometry/geometryEngine'])
      .then(([geometryEngine]) => {

        var factorDataList = that.props.factorList[category].slice().map(function (factor) {

          var containerZone = factor.inputControl.features.find((feature) => {
            return geometryEngine.contains(feature.geometry, geometry);
          });
          if(!containerZone){
            containerZone={attributes:{}};
            factor.inputControl.outputFields.forEach((field)=>{
              containerZone.attributes[field]='';
            })
          }
          return {
            id: factor.id,
            outputControl: factor.outputControl,
            outputData: {
              attributeData: containerZone.attributes,
              fullAddress: that.fullAddress,
            }
          }
        });

        that.setState({ factorDataList: this.state.factorDataList.concat(factorDataList) });
      })
  }

  componentDidMount = () => {
    this.getFactorDataList();
    var array = [];
    for (const [key, value] of Object.entries(this.props.factorList)) {
      array.push(value);
    }
    array = array.flat();
    this.setState({ factorList: array });
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.factorList.length > prevProps.factorList.length) {
      var array = [];
      for (const [key, value] of Object.entries(this.props.factorList)) {
        array.push(value);
      }
      array = array.flat();
      console.log('update', array)
      this.setState({ factorList: array });
    }
  }

  routingFunction = (value) => {
    this.props.history.push({
      pathname: '/' + value
    });
  }

  render() {
    return (<article>
      <div className= 'container-fluid' id='my-garland-result' >
        <div className='row ' >
          {
            json_sectionList.map((item) => {
              return <Section name={item.name} category={item.id} key={item.id}
                factorList={this.state.factorList}
                factorDataList={this.state.factorDataList}
              />
            })
          }
        </div>
      </div>
    </article>
    )
  }
}

export default withRouter(Result);
