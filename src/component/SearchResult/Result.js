import React, { Component } from 'react';
import { loadModules } from 'esri-loader';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import { Grid, Row, Col } from 'react-flexbox-grid/lib';
import { makeStyles } from '@material-ui/core/styles';
import ListSubheader from '@material-ui/core/ListSubheader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import StarBorder from '@material-ui/icons/StarBorder';
import Paper from '@material-ui/core/Paper';

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
    containerList: [{
      'id': 'nearest-city-facility',
      'name': 'Nearby City Facilities',
      'catagory': 'location-data'
    }, {
      'id': 'services',
      'name': 'Services',
      'catagory': 'location-data'
    }, {
      'id': 'reference',
      'name': 'Reference',
      'catagory': 'reference-data'
    }, {
      'id': 'neighborhoods',
      'name': 'Neighborhoods',
      'catagory': 'reference-data'
    }, {
      'id': 'planning-development-zoning',
      'name': 'Planning & Development / Zoing',
      'catagory': 'reference-data'
    }, {
      'id': 'streets-condition',
      'name': 'Streets Condition',
      'catagory': 'reference-data'
    }, {
      'id': 'pavement-condition-map',
      'name': 'Pavement Condition',
      'catagory': 'map-data'
    }, {
      'id': 'crime-map',
      'name': 'Crime Map',
      'catagory': 'map-data'
    }]
  };
  if (keyWord in defaultSetting) {
    return defaultSetting[keyWord];
  } else {
    return null;
  }
};


const parcelDataList = [{
  "id": "council-dist",
  "name": "City Council District",
  "displayControl": {
    "containerID": "parcelInfo",
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
  "displayControl": {
    "containerID": "parcelInfo",
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
  "displayControl": {
    "containerID": "parcelInfo",
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
  "displayControl": {
    "containerID": "parcelInfo",
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
  "displayControl": {
    "containerID": "planning_development-zoning",
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
  "displayControl": {
    "containerID": "planning_development-zoning",
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
  "displayControl": {
    "containerID": "neighborhoods",
    "displayID": 1,
    "hyperlinkType": "none",
    "displayDistance": false,
    "displayValue1": "NEIGHBORHOOD",
    "displayValue2": null
  }
}

]

const resultControl = {
  "cityFacilitySourceList": [{
    "id": "city-hall",
    "name": "City Hall",
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "BLDG_NAME='CITY HALL'",
    "displayControl": {
      "containerID": "nearestCityFacility",
      "displayID": "1",
      "hyperlinkType": "googleMap",
      "displayDistance": true,
      "displayValue1": "ADDRESS",
      "displayValue2": "BLDG_NAME"
    }
  },
  {
    "id": "police-station",
    "name": "Police Station",
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "BLDG_NAME='POLICE STATION'",
    "displayControl": {
      "containerID": "nearestCityFacility",
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
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "DEPT='COURTS'",
    "displayControl": {
      "containerID": "nearestCityFacility",
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
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "DEPT='FIRE' and BLDG_NAME like 'FIRE STATION%'",
    "displayControl": {
      "containerID": "nearestCityFacility",
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
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "BLDG_NAME='UTILITY SERVICES'",
    "displayControl": {
      "containerID": "nearestCityFacility",
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
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "DEPT='LIBRARY'",
    "displayControl": {
      "containerID": "nearestCityFacility",
      "displayID": "16",
      "hyperlinkType": "googleMap",
      "displayDistance": true,
      "displayValue1": "ADDRESS",
      "displayValue2": "BLDG_NAME"
    }
  }, {
    "id": "nearest-park",
    "name": "Nearest Park",
    "addressValue": null,
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/28",
    "where": "1=1",
    "displayControl": {
      "containerID": "service",
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
    "addressValue": "ADDRESS",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
    "where": "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
    "displayControl": {
      "containerID": "service",
      "displayID": 3,
      "hyperlinkType": "googleMap",
      "displayDistance": true,
      "displayValue1": "ADDRESS",
      "displayValue2": "BLDG_NAME"
    }
  }, {
    "id": "nearest-city-facility-with-wifi",
    "name": "Nearest Public Wi-Fi",
    "addressValue": "ADDRESS",
    "url": "https://services2.arcgis.com/g3rbttPStUJTjAz2/ArcGIS/rest/services/WiFi_Locations/FeatureServer/0",
    "where": "WIFI ='Yes'",
    "displayControl": {
      "containerID": "service",
      "displayID": 1,
      "hyperlinkType": "googleMap",
      "displayDistance": true,
      "displayValue1": "ADDRESS",
      "displayValue2": "BLDG_NAME"
    }
  }

  ],

  "serviceZoneSourceList": [{
    "id": "ews-recycling",
    "name": "EWS Recycling Pickup Week",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
    "displayControl": {
      "containerID": "service",
      "displayID": 5,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "COLOR",
      "displayValue2": null
    }
  }, {
    "id": "ews-recycling-day", //hardcoded function in template.js to convert to next recycling day
    "name": "Your Next Recycling Day is",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
    "displayControl": {
      "containerID": "service",
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
  }, {
    "id": "ews-trash",
    "name": "EWS Trash and Brush Pickup Day",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/6",
    "displayControl": {
      "containerID": "service",
      "displayID": 4,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "T_DAY",
      "displayValue2": null
    }
  }, {
    "id": "code-nuisance-districts",
    "name": "Code Nuisance Inspector",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/30",
    "displayControl": {
      "containerID": "service",
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
  }, {
    "id": "code-commercial-districts",
    "name": "Code Commercial Inspector",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/31",
    "displayControl": {
      "containerID": "service",
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
  }, {
    "id": "neighborhood-watch",
    "name": "Neighborhood Watch",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/9",
    "displayControl": {
      "containerID": "neighborhoods",
      "displayID": 3,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "NAME",
      "displayValue2": null
    }
  }, {
    "id": "neighborhood-assoc",
    "name": "Neighborhood Association",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/10",
    "displayControl": {
      "containerID": "neighborhoods",
      "displayID": 4,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "NAME",
      "displayValue2": null
    }
  }, {
    "id": "gdc-zoning",
    "name": "GDC Zoning",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/11",
    "displayControl": {
      "containerID": "planning_development-zoning",
      "displayID": 3,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "GDC_ZONING",
      "displayValue2": null
    }
  }, {
    "id": "npo",
    "name": "Neighborhood Police Officer",
    "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/18",
    "displayControl": {
      "containerID": "neighborhoods",
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
  }],

  "parcelDataList": [{
    "id": "council-dist",
    "name": "City Council District",
    "displayControl": {
      "containerID": "parcelInfo",
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
    "displayControl": {
      "containerID": "parcelInfo",
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
    "displayControl": {
      "containerID": "parcelInfo",
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
    "displayControl": {
      "containerID": "parcelInfo",
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
    "displayControl": {
      "containerID": "planning_development-zoning",
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
    "displayControl": {
      "containerID": "planning_development-zoning",
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
    "displayControl": {
      "containerID": "neighborhoods",
      "displayID": 1,
      "hyperlinkType": "none",
      "displayDistance": false,
      "displayValue1": "NEIGHBORHOOD",
      "displayValue2": null
    }
  }

  ],
}
const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

const OneInfo = (props) => {

}
const ChildCard = (props) => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);

  const handleClick = () => {
    setOpen(!open);
  };
  return (<><ListItem button onClick={handleClick}>
    <ListItemIcon>
      <InboxIcon />
    </ListItemIcon>
    <ListItemText primary="Inbox" />
    {open ? <ExpandLess /> : <ExpandMore />}
  </ListItem>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        <ListItem button className={classes.nested}>
          <ListItemIcon>
            <StarBorder />
          </ListItemIcon>
          <ListItemText primary="Starred" />
        </ListItem>
      </List>
    </Collapse></>
  )

}


const Section = (props) => {
  const classes = useStyles();

  const containerList = useDefaultSeting('containerList')
    .filter(item => item.catagory === props.catagory)

  return (<Col lg={4} md={6} xs={12} style={{ padding: '15px' }}>
    <Paper elevation={3}>
      <List component="section"
        subheader={
          <ListSubheader component="h2" >
            {props.name}
          </ListSubheader>
        }
        className={classes.root}
      >
        {
          containerList.map((item) => {
            return <ChildCard name={item.name} catagory={item.id} key={item.id} />
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
        return <Section name={item.name} catagory={item.id} key={item.id} />
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
    this.setState({ resultControl: resultControl });
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

        that.getParcelInfo(Query, QueryTask, parcelDataList, parcelUrl, attributes.PARCELID)
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