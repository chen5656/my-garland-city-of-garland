infoList: [{
    "id": "city-hall",
    "name": "City Hall",
    "dataControl": {
        "category": "city-facility",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='CITY HALL'",
        "addressValue": "ADDRESS",
    },
    "dataReturn": {},
    "displayControl": {
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='POLICE STATION'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='COURTS'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='FIRE' and BLDG_NAME like 'FIRE STATION%'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "BLDG_NAME='UTILITY SERVICES'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='LIBRARY'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": null,
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/28",
        "where": "1=1",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/2",
        "where": "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "city-facility",
        "addressValue": "ADDRESS",
        "url": "https://services2.arcgis.com/g3rbttPStUJTjAz2/ArcGIS/rest/services/WiFi_Locations/FeatureServer/0",
        "where": "WIFI ='Yes'",
    },
    "dataReturn": {},
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
    "name": "EWS Recycling Pickup Week", "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/8",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/6",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/30",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/31",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/9",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/10",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/11",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "service-zone",
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/18",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
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
    "dataControl": {
        "category": "parcel-data",
    },
    "dataReturn": {},
    "displayControl": {
        "category": "neighborhoods",
        "displayID": 1,
        "hyperlinkType": "none",
        "displayDistance": false,
        "displayValue1": "NEIGHBORHOOD",
        "displayValue2": null
    }
}
],
