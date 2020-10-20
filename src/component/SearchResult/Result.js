import React, { Component, useState } from 'react';
import { loadModules } from 'esri-loader';
import { makeStyles } from '@material-ui/core/styles';

import { Grid, Row, Col } from 'react-flexbox-grid/lib';

import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

import Collapse from '@material-ui/core/Collapse';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

import json_factorList from '../../data/factorList.json';
import json_sectionList from '../../data/sectionList.json';
import json_categoryList from '../../data/categoryList.json';

const geometryServiceUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer';


const useStyles = makeStyles((theme) => ({
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
  top: {
    color: 'rgb(0 122 163 / 74%)',
    animationDuration: '1550ms',

  },

}));


const FactorValue_Address_Distant_GoogleMapLink = (props) => {
  return (<>
    <span></span>
    <span></span>
    <span></span>
  </>)
}


const MyGarlandFactorValue = (props) => {
  const classes = useStyles();
  console.log(props.data, props.outputControl);
  // if(props.outputControl.hardcode){
  //   var str =props.outputControl.hardcode.split('{{displayValue}}');
  //   var newStr =[];
  //   for(let i=0;i<str.length;i++){
  //     newStr.push(str[i]);
  //     if(i<props.data.length){
  //       newStr.push(props.data[i])
  //     }
  //   }
  //   return <div>{newStr}</div>

  // }
  return <div>{props.data.length}</div>
}

const MyGarlandFactor = (props) => {
  const classes = useStyles();
  return (<ListItem className={classes.nested}>
    <ListItemIcon className={classes.nestedIcon}>
      <PlayArrowIcon style={{ fontSize: '15px' }} />
    </ListItemIcon>
    <ListItemText primary={props.name} />
    {(props.data && props.data.length) ? <MyGarlandFactorValue data={props.data} outputControl={props.outputControl} /> : <CircularProgress
      className={classes.top}
      size={25}
    />}
  </ListItem>)
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
    <Collapse in={open} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        {
          props.MyGarlandFactorList.map((item) => {
            return <MyGarlandFactor key={item.id} name={item.name} data={item.outputData}

              outputControl={item.outputControl} />
          })
        }
      </List>
    </Collapse>
  </>
  )

}


const Section = (props) => {
  const classes = useStyles();
  const categoryList = json_categoryList.filter(item => item.category === props.category)

  return (<Col lg={4} md={6} xs={12} style={{ padding: '15px' }}>
    <Paper elevation={3} >
      <List component="section"
        subheader={
          <ListSubheader component="h2" className={classes.sectionHead} >
            {props.name}
          </ListSubheader>
        }
      >
        {
          categoryList.map((item) => {
            return <Category name={item.name} category={item.id} key={item.id}
              MyGarlandFactorList={json_factorList.filter(factor => factor.outputControl.category === item.id)} />
          })
        }
      </List>

    </Paper>
  </Col>)
}


export default class Result extends Component {

  constructor(props) {
    super(props);
    this.addressUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4';
    this.parcelUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5';
  }

  doQuery() {
    loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'], { css: true })
      .then(([Query, QueryTask]) => {
        this.getAddressInfo(Query, QueryTask, this.props.RefID)
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
          'Parcel Id:': attr.PARCELID,
          'Address:': ("" + attr.STREETNUM + " " + attr.STREETLABEL + ", " + attr.CITY + ", " + attr.STATE + ", " + attr.ZIPCODE)
        })
        // result.features[0].geometry; //geometry in stateplane
        that.getNearestCityFacilityList(result.features[0].geometry);
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
      that.props.parcelFieldList.forEach(fieldname => {
        that.setState({ [fieldname]: attr[fieldname] });
      });

    });
  }

  getNearestCityFacilityList(geometry) {

    var that = this;
    loadModules(['esri/geometry/geometryEngine'], { css: true })
      .then(([geometryEngine]) => {

        that.props.cityFacilityList.slice().forEach(function (factor) {
          var nearestFeature = factor.inputControl.features.map((feature) => {
            var distance = geometryEngine.distance(geometry, feature.geometry, "miles");
            var outputAttributes = factor.inputControl.outputFields.map(field => {
              return feature.attributes[field];
            });
            return {
              attributes: outputAttributes,
              distance: distance
            };
          }).reduce(function (a, b) {
            if (a.distance < b.distance) {
              return a;
            } else {
              return b;
            }
          });

          that.setState({ [factor.id]: nearestFeature })
        });

      })

  }

  componentDidMount = () => {
    this.doQuery();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.RefID !== prevProps.RefID) {
      this.doQuery();
    } else {
      // console.log(this.state)
    }
  }

  render() {
    // return <div>{this.props.RefID}</div>;

    return (<article>
      <Grid fluid  >
        <Row >
          {
            json_sectionList.map((item) => {
              return <Section name={item.name} category={item.id} key={item.id} data={this.state}/>
            })
          }
        </Row>
      </Grid>
    </article>
    )
  }
}