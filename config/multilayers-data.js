var layerSetting={
  "layers": {
    "cityFacilitySourceList": [{
        "id": "city-hall",
        "name": "City Hall",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='CITY HALL'",
        "containerID": "nearestCityFacility",
        "displayID": "1"
      }, {
        "id": "customer-service",
        "name": "Customer Service",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='UTILITY SERVICES'",
        "containerID": "nearestCityFacility",
        "displayID": "5"
      },
      {
        "id": "police-station",
        "name": "Police Station",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='POLICE STATION'",
        "containerID": "nearestCityFacility",
        "displayID": "2"
      },
      {
        "id": "municipal-courts",
        "name": "Municipal Courts",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='COURTS'",
        "containerID": "nearestCityFacility",
        "displayID": "3"
      },
      {
        "id": "nearest-fire-station",
        "name": "Nearest Fire Station",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='FIRE' and BLDG_NAME<>'FIRE ADMIN & TRAINING'",
        "containerID": "nearestCityFacility",
        "displayID": "4"
      },
      {
        "id": "nearest-library",
        "name": "Nearest Library",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='LIBRARY'",
        "containerID": "nearestCityFacility",
        "displayID": "6"
      }, {
        "id": "nearest-park",
        "name": "Nearest Park",
        "addressValue":null,
        "displayValue1":null,
        "displayValue2":"PARK",
        "linkValue":"PARK_WEBLI",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/28",
        "where": "Status='M'",
        "containerID": "service",
        "displayID": 2
      }, {
        "id": "nearest-recreation-center",
        "name": "Nearest Recreation Center",
        "addressValue":"ADDRESS",
        "displayValue1":"ADDRESS",
        "displayValue2":"BLDG_NAME",
        "linkValue":null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
        "containerID": "service",
        "displayID": 3
      }
      // , {
      //   "id": "nearest-school",
      //   "name": "Nearest School",
      //   "addressValue":"ADDRESS",
      //   "displayValue1":"ADDRESS",
      //   "displayValue2":"OFFICIALNA",
      //   "linkValue":null,
      //   "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/20",
      //   "where": "1=1",
      //   "containerID": "service",
      //   "displayID": 1
      // }

    ],
    "serviceZoneSourceList": [{
      "id": "ews-recycling",
      "name": "EWS Recycling Pickup Week",
      "containerID": "service",
      "displayID": 5,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8"
    }, {
      "id": "ews-trash",
      "name": "EWS Trash and Brush Pickup Day",
      "containerID": "service",
      "displayID": 4,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/6"
    }, {
      "id": "code-n-districts",
      "name": "Code Nuisance Inspector",
      "containerID": "service",
      "displayID": 6,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/30"
    }, {
      "id": "code-commercial-districts",
      "name": "Code Commercial Inspector",
      "containerID": "service",
      "displayID": 7,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/31"
    }, {
      "id": "neighborhood-watch",
      "name": "Neighborhood Watch",
      "containerID": "neighborhoods",
      "displayID": 3,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/9"
    }, {
      "id": "neighborhood-assoc",
      "name": "Neighborhood Association",
      "containerID": "neighborhoods",
      "displayID": 4,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/10"
    }, {
      "id": "gdc-zoning",
      "name": "GDC Zoning",
      "displayValue1":"ADDRESS",
      "displayValue2":"BLDG_NAME",
      "containerID": "planning_development-zoning",
      "displayID": 2,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/11"
    }, {
      "id": "npo",
      "name": "Neighborhood Police Officer",
      "containerID": "neighborhoods",
      "displayID": 2,
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/18"
    }],
    "individualCityFacility": [],
    "mapService": {
      "cityLimit": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/1",
      "address": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/4",
      "parcel": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/5",
      "road": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/3",
      "streetAlias": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/16",
      "geometry": "https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"
    }
  },

  "parcelData": [{
      "id": "council-dist",
      "fieldName": "COUNCIL_ID",
      "title": "City Council District",
      "containerID": "parcelInfo",
      "displayFieldName": "value",
      "displayID": 1,
      "queryPolygonCount": 1,
      "hyperlink": true,
      "hyperlink_formula": {
        "url": "https://www.garlandtx.gov/gov/cd/council/bio/district%d.asp",
        "replaceList": [{
          "type": "displayValue",
          "replaceWith": "%d"
        }]
      }
    },
    {
      "id": "zipcode",
      "fieldName": "ZIP_CODE",
      "title": "Zip Code",
      "containerID": "parcelInfo",
      "displayFieldName": "value",
      "displayID": 2,
      "queryPolygonCount": 1,
      "hyperlink": false
    },
    {
      "id": "mapsco",
      "fieldName": "MAPSCO",
      "title": "Mapsco Grid",
      "containerID": "parcelInfo",
      "displayFieldName": "value",
      "displayID": 3,
      "queryPolygonCount": 1,
      "hyperlink": false
    },
    {
      "id": "school-district",
      "fieldName": "SCHOOL_DISTRICT",
      "title": "School District",
      "containerID": "parcelInfo",
      "displayFieldName": "value",
      "displayID": 4,
      "queryPolygonCount": 1,
      "hyperlink": false
    },
    {
      "id": "landuse",
      "fieldName": "LANDUSE",
      "title": "Land Use",
      "containerID": "planning_development-zoning",
      "displayFieldName": "value",
      "displayID": 1,
      "queryPolygonCount": 1,
      "hyperlink": false
    },
    {
      "id": "zoning",
      "fieldName": "ZONING",
      "title": "ZONING",
      "containerID": "planning_development-zoning",
      "displayFieldName": "value",
      "displayID": 2,
      "queryPolygonCount": 1,
      "hyperlink": false
    },
    {
      "id": "neighborhood-parcel",
      "field": "NEIGHBORHOOD",
      "title": "Neighborhood",
      "containerID": "neighborhoods",
      "displayID": 1,
      "displayFieldName": "value",
      "queryPolygonCount": 1,
      "hyperlink": false
    }

  ]
};