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
    infoList: [{
      "id": "city-hall",
      "name": "City Hall",
      "inputControl": {
        "category": "city-facility",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='CITY HALL'",
        "addressValue": "ADDRESS",
      },
      "outputData": [],
      "outputControl": {
        "category": "nearest-city-facility",
        "displayID": "1",
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      },
    },
    {
      "id": "police-station",
      "name": "Police Station",
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='POLICE STATION'",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='COURTS'",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='FIRE' and BLDG_NAME like 'FIRE STATION%'",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='UTILITY SERVICES'",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='LIBRARY'",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/28",
        "where": "1=1",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
        "displayID": 3,
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    }, {
      "id": "nearest-city-facility-with-wifi",
      "name": "Nearest Public Wi-Fi",
      "inputControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://services2.arcgis.com/g3rbttPStUJTjAz2/ArcGIS/rest/services/WiFi_Locations/FeatureServer/0",
        "where": "WIFI ='Yes'",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
        "displayID": 1,
        "hyperlinkType": "googleMap",
        "displayDistance": true,
        "displayValue1": "ADDRESS",
        "displayValue2": "BLDG_NAME"
      }
    },
    {
      "id": "ews-recycling",
      "name": "EWS Recycling Pickup Week", "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/6",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/30",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/31",
      },
      "outputData": [],
      "outputControl": {
        "category": "services",
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/9",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/10",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/11",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/18",
      },
      "outputData": [],
      "outputControl": {
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
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "reference",
        "displayID": 1,
        "displayValues": ["COUNCIL_ID"],
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
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "reference",
        "displayID": 2,
        "displayValues": ["ZIP_CODE"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "ZIP_CODE",
        "displayValue2": null
      }
    },
    {
      "id": "mapsco",
      "name": "Mapsco Grid",
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "reference",
        "displayID": 3,
        "displayValues": ["MAPSCO"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "MAPSCO",
        "displayValue2": null
      }
    },
    {
      "id": "school-district",
      "name": "School District",
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "reference",
        "displayID": 4,
        "displayValues": ["SCHOOL_DISTRICT"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "SCHOOL_DISTRICT",
        "displayValue2": null
      }
    },
    {
      "id": "landuse",
      "name": "Land Use",
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "planning-development-zoning",
        "displayID": 1,
        "displayValues": ["LANDUSE"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "LANDUSE",
        "displayValue2": null
      }
    },
    {
      "id": "zoning",
      "name": "ZONING",
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "planning-development-zoning",
        "displayID": 2,
        "displayValues": ["ZONING"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "ZONING",
        "displayValue2": null
      }
    },
    {
      "id": "neighborhood-parcel",
      "name": "Neighborhood",
      "inputControl": {
        "category": "parcel-data",
      },
      "outputData": [],
      "outputControl": {
        "category": "neighborhoods",
        "displayID": 1,
        "displayValues": ["NEIGHBORHOOD"],
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "NEIGHBORHOOD",
        "displayValue2": null
      }
    }
    ],

  }


  // debugger;
  // const cloneItem = {...defaultSetting};
  if (keyWord in defaultSetting) {
    return defaultSetting[keyWord];
  } else {
    return null;
  }
};

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


const MyGarlandItemValue = (props) => {
  const classes = useStyles();
  return <CircularProgress
    className={classes.top}
    size={25}
  />
}

const MyGarlandItem = (props) => {
  const classes = useStyles();
  //props.name
  //props.data
  console.log(props.data)
  return (<ListItem className={classes.nested}>
    <ListItemIcon className={classes.nestedIcon}>
      <PlayArrowIcon style={{ fontSize: '15px' }} />
    </ListItemIcon>
    <ListItemText primary={props.name} />
    {(props.data&&props.data.length)?props.data.length:<MyGarlandItemValue />}
  </ListItem>)
}
const Category = (props) => {
  const [open, setOpen] = useState(true);
  const classes = useStyles();

  const handleClick = () => {
    setOpen(!open);
  };
  const infoList = props.myGarlandItemList.filter(item => item.outputControl.category === props.category)

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
          infoList.map((item) => {
            return <MyGarlandItem key={item.id} name={item.name} data={item.outputData} />
          }) 
        }
      </List>
    </Collapse>
  </>
  )

}


const Section = (props) => {
  const classes = useStyles();
  const categoryList = useDefaultSeting('categoryList')
    .filter(item => item.category === props.category)

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
            return <Category name={item.name} category={item.id} key={item.id} myGarlandItemList={props.myGarlandItemList} />
          })
        }
      </List>

    </Paper>
  </Col>)
}

const ResultContent = (props) => {
  const sectionList = useDefaultSeting('sectionList');
  return (<Row >
    {
      sectionList.map((item) => {
        return <Section name={item.name} category={item.id} key={item.id} myGarlandItemList={props.myGarlandItemList} />
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
      myGarlandItemList: [],
    };
  }

  init() {
    this.setState({
      parcelId: null, address: null,
      geometryStatePlane: null,//in stateplane
      myGarlandItemList: useDefaultSeting('infoList').sort((a, b) => { return a.outputControl.displayID - b.outputControl.displayID })
    });
  }

  doQuery() {
    const that = this;
    loadModules(['esri/tasks/support/Query', 'esri/tasks/QueryTask'], { css: true })
      .then(([Query, QueryTask]) => {
        this.getAddressInfo(Query, QueryTask, addressUrl, this.props.RefID)
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
        var attr = result.features[0].attributes;
        that.setState({
          parcelId: attr.PARCELID,
          address: ("" + attr.STREETNUM, " ", attr.STREETLABEL, ", ", attr.CITY, ", ", attr.STATE, ", ", attr.ZIPCODE),
          geometryStatePlane: result.features[0].geometry
        });

        that.getInfoFromParcelTable(Query, QueryTask, parcelUrl, attr.PARCELID)
      }

    });
  }
  getInfoFromParcelTable(Query, QueryTask, parcelUrl, parcelId, keyword = 'parcel-data') {
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
      var attr = results.features[0].attributes;
      var newArray = that.state.myGarlandItemList.slice().map((item) => {
        if (item.inputControl.category === keyword) {
          item.outputData = item.outputControl.displayValues.map((item) => {
            var data = {};
            data[item] = attr[item]
            return data;
          });
        }
        return item;
      });

      that.setState({myGarlandItemList:newArray});


    });
  }
  componentDidMount = () => {
    this.init();
    this.doQuery();
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.RefID !== prevProps.RefID) {
      this.init();
      this.doQuery();
    }



  }

  render() {
    // return <div>{this.props.RefID}</div>;

    return (<article>
      <Grid fluid  >
        <ResultContent myGarlandItemList={this.state.myGarlandItemList} />
      </Grid>
    </article>
    )
  }
}