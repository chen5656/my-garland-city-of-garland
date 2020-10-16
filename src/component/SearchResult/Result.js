import React, { Component, useState } from 'react';
import { loadModules } from 'esri-loader';

import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Paper from '@material-ui/core/Paper';

import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';

function iterationCopy(src) {
  var target = {};
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      target[prop] = src[prop];
    }
  }
  return target;
}

const addressUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4';
const parcelUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5';
const geometryServiceUrl = 'https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer';

const useDefaultSeting = (keyWord) => {
  const defaultSetting = {
    sectionList: [{
      id: 'location-data',
      name: 'Location Data',
    }, {
      id: 'reference-data',
      name: 'Reference Data',
    }, {
      id: 'map-data',
      name: 'Map Data',
    }],
    categoryList: [{
      'id': 'nearest-city-facility',
      'name': 'Nearby City Facilities',
      'category': 'location-data'
    }, {
      'id': 'services',
      'name': 'Services',
      'category': 'location-data'
    }, {
      'id': 'reference',
      'name': 'Reference',
      'category': 'reference-data'
    }, {
      'id': 'neighborhoods',
      'name': 'Neighborhoods',
      'category': 'reference-data'
    }, {
      'id': 'planning-development-zoning',
      'name': 'Planning & Development / Zoing',
      'category': 'reference-data'
    }, {
      'id': 'streets-condition',
      'name': 'Streets Condition',
      'category': 'reference-data'
    }, {
      'id': 'street-condition-map',
      'name': 'Street Condition',
      'category': 'map-data'
    }, {
      'id': 'crime-map',
      'name': 'Crime Map',
      'category': 'map-data'
    }],
    infoList: [
      {
      "id": "city-hall",
      "name": "City Hall",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "1",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      },
      "dataControl":{
        "category": "cityFacilitySourceList",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='CITY HALL'",
        "addressValue": "ADDRESS",
      },
      "dataReturn":{},
    },
    {
      "id": "police-station",
      "name": "Police Station",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "BLDG_NAME='POLICE STATION'",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "2",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "municipal-courts",
      "name": "Municipal Courts",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "DEPT='COURTS'",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "3",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "nearest-fire-station",
      "name": "Nearest Fire Station",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "DEPT='FIRE' and BLDG_NAME like 'FIRE STATION%'",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "4",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "customer-service",
      "name": "Customer Service",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "BLDG_NAME='UTILITY SERVICES'",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "5",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "nearest-library",
      "name": "Nearest Library",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "DEPT='LIBRARY'",
      "displayControl": {
        "category": "nearest-city-facility",
        "displayID": "16",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    }, {
      "id": "nearest-park",
      "name": "Nearest Park",
      "category": "cityFacilitySourceList",
      "addressValue": null,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/28",
      "where": "1=1",
      "displayControl": {
        "category": "service",
        "displayID": 2,
        "hyperlinkType": "hardcode",
        "hardcode": "<span class='location-data-value'><a href='{{displayValue2}}' target='_blank' title='Open to see details'>{{displayValue1}}</a></span>",
        "displayDistance": false,
        "displayValue1": "PARK",
        "displayValue2": "PARK_WEBLI"
      }
    }, {
      "id": "nearest-recreation-center",
      "name": "Nearest Recreation Center",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
      "where": "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
      "displayControl": {
        "category": "service",
        "displayID": 3,
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    }, {
      "id": "nearest-city-facility-with-wifi",
      "name": "Nearest Public Wi-Fi",
      "category": "cityFacilitySourceList",
      "addressValue": "ADDRESS",
      "url": "https://services2.arcgis.com/g3rbttPStUJTjAz2/ArcGIS/rest/services/WiFi_Locations/FeatureServer/0",
      "where": "WIFI ='Yes'",
      "displayControl": {
        "category": "service",
        "displayID": 1,
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "ews-recycling",
      "name": "EWS Recycling Pickup Week",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
      "displayControl": {
        "category": "service",
        "displayID": 5,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "COLOR",
        "displayValue2": null
      }
    },
    {
      "id": "ews-recycling-day", //hardcoded function in template.js to convert to next recycling day
      "name": "Your Next Recycling Day is",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
      "displayControl": {
        "category": "service",
        "displayID": 6,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "ANCORE_DAY",
        "displayFunction": {
          functionParameter: ["displayValue1"],
          functionCode: "ews-recycling-day"
        },
        "displayValue2": null
      }
    },
    {
      "id": "ews-trash",
      "name": "EWS Trash and Brush Pickup Day",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/6",
      "displayControl": {
        "category": "service",
        "displayID": 4,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "T_DAY",
        "displayValue2": null
      }
    },
    {
      "id": "code-nuisance-districts",
      "name": "Code Nuisance Inspector",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/30",
      "displayControl": {
        "category": "service",
        "displayID": 8,
        "hyperlinkType": "hardcode",
        "hardcode": "<span class='location-data-value'>{{displayValue1}}<a href='tel:{{displayValue2}}'> <i class='esri-icon-phone blue-icon blue-icon-small' title='{{displayValue2}}'></i> </a><span>, {{displayValue3}}</span><a href='tel:{{displayValue4}}'> <i class='esri-icon-phone blue-icon blue-icon-small' title='{{displayValue4}}'></i> </a></span>",
        "displayDistance": false,
        "displayValue1": "INSPECTOR",
        "displayValue2": "PHONE",
        "displayValue3": "INSPECTOR2",
        "displayValue4": "PHONE2",
        "displayFormat": [{
          "id": "displayValue2",
          "value": "phone-number"
        }, {
          "id": "displayValue4",
          "value": "phone-number"
        }]
      }
    },
    {
      "id": "code-commercial-districts",
      "name": "Code Commercial Inspector",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/31",
      "displayControl": {
        "category": "service",
        "displayID": 7,
        "hyperlinkType": "hardcode",
        "hardcode": "<span class='location-data-value'>{{displayValue1}}<a href='tel:{{displayValue2}}'> <i class='esri-icon-phone blue-icon blue-icon-small'title='{{displayValue2}}'></i> </a></span>",
        "displayDistance": false,
        "displayValue1": "INSPECTOR",
        "displayValue2": "PHONE",
        "displayFormat": [{
          "id": "displayValue2",
          "value": "phone-number"
        }]
      }
    },
    {
      "id": "neighborhood-watch",
      "name": "Neighborhood Watch",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/9",
      "displayControl": {
        "category": "neighborhoods",
        "displayID": 3,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "NAME",
        "displayValue2": null
      }
    },
    {
      "id": "neighborhood-assoc",
      "name": "Neighborhood Association",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/10",
      "displayControl": {
        "category": "neighborhoods",
        "displayID": 4,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "NAME",
        "displayValue2": null
      }
    },
    {
      "id": "gdc-zoning",
      "name": "GDC Zoning",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/11",
      "displayControl": {
        "category": "planning-development-zoning",
        "displayID": 3,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "GDC_ZONING",
        "displayValue2": null
      }
    },
    {
      "id": "npo",
      "name": "Neighborhood Police Officer",
      "category": "serviceZoneSourceList",
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/18",
      "displayControl": {
        "category": "neighborhoods",
        "displayID": 2,
        "hyperlinkType": "hardcode",
        "hardcode": "<span class='location-data-value'>{{displayValue1}}<a href='tel:{{displayValue2}}'> <i class='esri-icon-phone blue-icon blue-icon-small' title='{{displayValue2}}'></i> </a><a target='_blank' href='mailto:{{displayValue3}}'> <i class='esri-icon-contact blue-icon blue-icon-small' title='{{displayValue3}}'></i> </a></span>",
        "displayDistance": false,
        "displayValue1": "OFFICER",
        "displayValue2": "PHONE",
        "displayValue3": "EMAIL",
        "displayFormat": [{
          "id": "displayValue2",
          "value": "phone-number"
        }]
      }
    },

    {
      "id": "council-dist",
      "name": "City Council District",
      "category": "parcelDataList",
      "displayControl": {
        "category": "reference",
        "displayID": 1,
        "hyperlinkType": "hardcode",
        "hardcode": "<span class='location-data-value'><a href='{{hardcodeValue1}}' target='_blank' title='Open to see details' class='blue-icon '> {{displayValue1}}</a></span>",
        "displayDistance": false,
        "displayValue1": "COUNCIL_ID",
        "hardcodeValue1": "this field will be updated during the app."
      }
    },
    {
      "id": "zipcode",
      "name": "Zip Code",
      "category": "parcelDataList",
      "displayControl": {
        "category": "reference",
        "displayID": 2,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "ZIP_CODE",
        "displayValue2": null
      }
    },
    {
      "id": "mapsco",
      "name": "Mapsco Grid",
      "category": "parcelDataList",
      "displayControl": {
        "category": "reference",
        "displayID": 3,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "MAPSCO",
        "displayValue2": null
      }
    },
    {
      "id": "school-district",
      "name": "School District",
      "category": "parcelDataList",
      "displayControl": {
        "category": "reference",
        "displayID": 4,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "SCHOOL_DISTRICT",
        "displayValue2": null
      }
    },
    {
      "id": "landuse",
      "name": "Land Use",
      "category": "parcelDataList",
      "displayControl": {
        "category": "planning-development-zoning",
        "displayID": 1,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "LANDUSE",
        "displayValue2": null
      }
    },
    {
      "id": "zoning",
      "name": "ZONING",
      "category": "parcelDataList",
      "displayControl": {
        "category": "planning-development-zoning",
        "displayID": 2,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "ZONING",
        "displayValue2": null
      }
    },
    {
      "id": "neighborhood-parcel",
      "name": "Neighborhood",
      "category": "parcelDataList",
      "displayControl": {
        "category": "neighborhoods",
        "displayID": 1,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "NEIGHBORHOOD",
        "displayValue2": null
      }
    }],
  }


  // debugger;
  // const cloneItem = {...defaultSetting};
  if (keyWord in defaultSetting) {
    return defaultSetting[keyWord];
  } else {
    return null;
  }
};



const OneInfo = (props) => {
  return (<ListItem button >
    <ListItemIcon>
      <StarBorder />
    </ListItemIcon>
    <ListItemText primary="Starred" />
  </ListItem>)
}
const Category = (props) => {
  const [open, setOpen] = useState(true);

  const handleClick = () => {
    setOpen(!open);
  };

  const infoList = useDefaultSeting('infoList')
        .filter(item => item.displayControl.category  === props.category)
        .sort((a,b)=>{b.displayControl.diplayID-a.displayControl.diplayID});

  return (<>
    <ListItem button onClick={handleClick}>
      <ListItemIcon>
        {open ? <RemoveIcon /> : <AddIcon />}
      </ListItemIcon>
      <ListItemText primary={props.name} />
      {open ? <ExpandLess /> : <ExpandMore />}
    </ListItem>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        {
          infoList.map((item)=>{
            return <OneInfo key={item.id} />
          })
        }       
      </List>
    </Collapse>
  </>
  )

}


const Section = (props) => {
  const categoryList = useDefaultSeting('categoryList')
    .filter(item => item.category === props.category)

  return (<Col lg={4} md={6} xs={12} style={{ padding: '15px' }}>
    <Paper elevation={3} >
      <List component="section"
        subheader={
          <ListSubheader component="h2" style={{
            borderRadius: '5px 5px 0 0', color: 'white', fontWeight: 600, background: 'linear-gradient(0.25turn,rgb(0 122 163 / 90%), rgb(0 122 163 / 64%), rgb(0 122 163 / 24%))',
          }} >
            {props.name}
          </ListSubheader>
        }
      >
        {
          categoryList.map((item) => {
            return <Category name={item.name} category={item.id} key={item.id} />
          })
        }
      </List>

    </Paper>
  </Col>)
}

const ResultContent = () => {
  const sectionList = useDefaultSeting('sectionList');
  return (<Row >
    {
      sectionList.map((item) => {
        return <Section name={item.name} category={item.id} key={item.id} />
      })
    }
  </Row>)
}

export default class Result extends Component {

  constructor(props) {
    super(props);
    this.state = {
      parcelId: null,
      address: null,
      geometryStatePlane: null,//in stateplane
      parcelInfoResult: null,
    };
  }

  reset() {
    // this.setState({ resultControl: useDefaultSeting('infoList') });
  }

  doQuery() {
    const that = this;

    loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'], { css: true })
      .then(([Query, QueryTask]) => {
        that.getAddressInfo(Query, QueryTask, addressUrl, this.props.RefID)
      });
  }

  getAddressInfo(Query, QueryTask, addressUrl, addressId) {
    var that = this;
    var query = new Query();
    var queryTask = new QueryTask({
      url: addressUrl
    });
    query.where = "ADDRESSID =" + addressId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = true;
    query.outFields = ["*"];

    queryTask.execute(query).then(function (result) {
      if (result.features.length > 0) {
        var attributes = result.features[0].attributes;
        that.setState({ parcelId: attributes.PARCELID });
        that.setState({ address: "".concat(attributes.STREETNUM, " ", attributes.STREETLABEL, ", ", attributes.CITY, ", ", attributes.STATE, ", ", attributes.ZIPCODE) });
        that.setState({ geometryStatePlane: result.features[0].geometry });

        // that.getParcelInfo(Query, QueryTask, parcelDataList, parcelUrl, attributes.PARCELID)
      }

    });
  }
  getParcelInfo(Query, QueryTask, parcelDataList, parcelUrl, parcelId) {
    var that = this;
    var query = new Query();
    var queryTask = new QueryTask({
      url: parcelUrl
    });
    query.where = "PARCELID  =" + parcelId;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = false;
    query.outFields = ["*"];
    queryTask.execute(query).then(function (results) {
      var result = results.features[0].attributes;
      var parcelInfo = parcelDataList.map(function (item) {
        var newItem = iterationCopy(item);
        newItem.queryPolygonCount = 1;
        newItem.feature = {};
        ["displayValue1", "displayValue2", "displayValue3", "displayValue4"].forEach(function (val) {
          if (item.displayControl[val]) {
            newItem.feature[item.displayControl[val]] = result[item.displayControl[val]];
          } else {
            newItem.displayControl[val] = "";
          }
        });
        return newItem;
      })
      that.setState({ parcelInfoResult: parcelInfo });
    });
  }
  componentDidMount = () => {
    this.doQuery();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.RefID !== prevProps.RefID) {
      this.doQuery();
    }



  }

  render() {
    // return <div>{this.props.RefID}</div>;

    return (<article>
      <Grid fluid  >
        <ResultContent />
      </Grid>
    </article>
    )
  }
}