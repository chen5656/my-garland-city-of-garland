var multiSearch_displayFunctions = {
  "ews-recycling-day": function (vals) {
    var ancore = vals[0];
    if (isNaN(ancore)) {
      return "NULL".concat("*");
    }
    var ancoreDate = new Date(ancore);
    var today = new Date();
    var dayDiff = Math.floor((today - ancoreDate) / (1000 * 60 * 60 * 24));
    var dayMod = dayDiff % 14;
    var newRecyclingDay;
    if (dayDiff >= 0) {
      newRecyclingDay = addDays(today, (14 - dayMod));

    } else if (dayDiff >= -14) {
      newRecyclingDay = ancoreDate;
    } else {
      newRecyclingDay = addDays(today, (-dayMod));

    }
    //format the new day
    return newRecyclingDay.toDateString().concat("*");

    function addDays(date, days) {
      const copy = new Date(Number(date))
      copy.setDate(date.getDate() + days)
      return copy
    }
  }

}
var multilSearch_settings = {

  "containerList": [{
    "id": "nearestCityFacility",
    "itemCount": 6
  }, {
    "id": "service",
    "itemCount": 6
  }, {
    "id": "parcelInfo",
    "itemCount": 4
  }, {
    "id": "neighborhoods",
    "itemCount": 4
  }, {
    "id": "planning_development-zoning",
    "itemCount": 3
  }],

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
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/GarlandPublicWiFi/GarlandPublicWiFi/MapServer/0",
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

  "mapService": {
    "cityLimit": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/1",
    "address": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4",
    "parcel": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5",
    "road": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/3",
    "streetAlias": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/16",
    "councilDistricts": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/35",
    "geometry": "https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"
  }
};