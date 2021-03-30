var appSetting = {

  "mapInTop": {
    "mapImageLayer": {
      "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer",
      "sublayers": [{
        "id": 1,
        "visible": true
      }]
    },
    "basemap": "gray",
    "zoom": 12,
    "center": [-96.636269, 32.91676]
  },

  "locator": {
    "locatorUrl": "https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ADDRESS_LOCATOR/GeocodeServer",
    "sourceSetting": {
      "outFields": ["Ref_ID"],
      "singleLineFieldName": "Single Line Input",
      "name": "GARLAND_ADDRESS_LOCATOR",
      "placeholder": "Enter a City of Garland Address",
      "suggestionsEnabled": true,
      "maxSuggestions": 6,
      "minSuggestCharacters": 6
    }
  },

  "subMap": {
    "baseMap": {
      "map": {
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer",
        "sublayers": [{
          "id": 5,
          "visible": true
        }, {
          "id": 4,
          "visible": true
        }]
      },
      "legend": ""
    },
    "streetCondition": {
      "map": {
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/ACTIVE_PROJECTS_SRV_10_5/MapServer",
      },
      "sublayerToggle": [2],
      "legend": {
        "title": "Street PCI Legend",
        "renderer": [{
          "color": "rgba(36,116,0,1)",
          "label": "Excellent",
          "type": "polyline",
          "size": 2
        }, {
          "color": "rgba(77,230,0,1)",
          "label": "Good",
          "type": "polyline",
          "size": 2
        }, {
          "color": "rgba(230,230,0,1)",
          "label": "Fair",
          "type": "polyline",
          "size": 2
        }, {
          "color": "rgba(225,167,127,1)",
          "label": "Poor",
          "type": "polyline",
          "size": 2
        }, {
          "color": "rgba(255,0,0,1)",
          "label": "Failed",
          "type": "polyline",
          "size": 2
        }]

      }
    },
    "crimeMap": {
      "featureLayerUrl": "https://maps.garlandtx.gov/arcgis/rest/services/dept_POLICE/Crime/MapServer/0",
      "popUpTemplate": {
        "title": "<b>{OFFENSE}</b>",
        "content": "<b>OCCURRED ON: </b>{OCCURRED_O}<br>" +
          "<b>CASE ID: </b>{CASEID}<br>" +
          "<b>OFFENSE: </b>{OFFENSE}<br>",
        "fieldInfos": [{
          "fieldName": "OCCURRED_O",
          "format": {
            "dateFormat": "short-date"
          }
        }]
      }
    }
  },

  "aliasExtend": {
    "1ST": "FIRST",
    "2ND": "SECOND",
    "3RD": "THIRD",
    "4TH": "FOURTH",
    "5TH": "FIFTH",
    "6TH": "SIXTH",
    "7TH": "SEVENTH",
    "9TH": "NINTH",
    "10TH": "TENTH",
    "11TH": "ELEVENTH",
    "12TH": "TWELFTH",
    "13TH": "THIRTEENTH",
    "15TH": "FIFTEENTH",
    "16TH": "SIXTEENTH",
    "17TH": "SEVENTEENTH",
    "1": "FIRST",
    "2": "SECOND",
    "3": "THIRD",
    "4": "FOURTH",
    "5": "FIFTH",
    "6": "SIXTH",
    "7": "SEVENTH",
    "9": "NINTH",
    "10": "TENTH",
    "11": "ELEVENTH",
    "12": "TWELFTH",
    "13": "THIRTEENTH",
    "15": "FIFTEENTH",
    "16": "SIXTEENTH",
    "17": "SEVENTEENTH"
  },

  "mapserver": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer",
  "geometry": "https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"


};