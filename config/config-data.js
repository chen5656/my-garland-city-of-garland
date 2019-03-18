var  appSetting={

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
      "maxSuggestions": 8,
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
        "url": "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Engineering_Transportaion/MapServer",
        "sublayers": [{
          "id": 11,
          "visible": true
        }]
      },

      "legend": {
        "title": "Street PCI Legend",
        "renderer": [{
          "color": "rgba(16,16,16,1)",
          "label": "-NULL-",
          "type": "polyline",
          "size": 2
        }, {
          "color": "rgba(36,116,0,1)",
          "label": "Excellent",
          "type": "polyline",
          "size": 2
        },{
          "color": "rgba(77,230,0,1)",
          "label": "Good",
          "type": "polyline",
          "size": 2
        },{
          "color": "rgba(230,230,0,1)",
          "label": "Fair",
          "type": "polyline",
          "size": 2
        },{
          "color": "rgba(225,167,127,1)",
          "label": "Poor",
          "type": "polyline",
          "size": 2
        },{
          "color": "rgba(255,0,0,1)",
          "label": "Failed",
          "type": "polyline",
          "size": 2
        }]

      }
    }
  },
  "mapserver": "https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer",
  "geometry": "https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer",

  "cog_park_site": "https://www.garlandtx.gov/gov/lq/parks/facilities/parks/%s/default.asp",
  "google_direction": "https://www.google.com/maps/dir/?api=1&origin=%o&destination=%d,Garland",

  "ews_link": "https://www.garlandtx.gov/gov/eg/ews/default.asp"


};