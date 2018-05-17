require([

  'js/MultiSearch.js',

  "esri/Basemap",
  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",

  "esri/tasks/GeometryService",
  "esri/geometry/projection",
  "esri/tasks/support/ProjectParameters",
  "esri/config",

  'dojo/on',
  'dojo/dom',
  'dojo/_base/array',
  "dojo/topic",
  "dojo/dom-class",
  "dojo/query",
  "dojo/dom-attr",

  'dojo/domReady!'
], function (
  nameMultiSearch,
  Basemap, Map, MapView, MapImageLayer,
  Search, Locator,
  GeometryService, projection, ProjectParameters, esriConfig,

  on, dom, array, topic,
  domClass, domQuery, domAttr
) {

  'use strict';

  var map, view, subMap, subView;
  var nearestFeatureList = [];
  var serviceZone = [];
  var parcelInfo_obj2;

  var collapsedButtons = domQuery(".collapsed", "nodeResult");
  collapsedButtons.forEach(function (btn) {
    btn.onclick = function () {
      var card = dom.byId(domAttr.get(this, "aria-controls"));
      domClass.toggle(card, "show");
    };
  });

  //create multisearch widget.
  var multiSearch = new GetMultiSearch({
    cityFacilitySourceList: [{
      name: "Fire Station",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
      where: "NUM>0",
      displayID: "3"
    }],
    serviceZoneSourceList: [{
        name: "Police Sectors",
        containerID: 1,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/5"
      },
      // {
      //   name: "Police Districts",
      //   containerID: 1,
      //   displayID: 1,
      //   url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/4"
      // }, {
      // //   name: "Police Beats",
      //   containerID: 1,
      //   displayID: 3,
      //   url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/3"
      // }, {
      //   name: "Fire Districts",
      //   containerID: 1,
      //   displayID: 4,
      //   url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/0"
      // },
      {
        name: "Fire Alarm Grids",
        containerID: 1,
        displayID: 5,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/1"
      },
      {
        name: "EWS Brush Route Days",
        containerID: 1,
        displayID: 6,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/12"
      }, {
        name: "EWS Recycling Route Days",
        containerID: 1,
        displayID: 7,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/13"
      }, {
        name: "EWS Trash Route Days",
        containerID: 1,
        displayID: 8,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/14"
      }, {
        name: "Neighborhood Watches",
        containerID: 2,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/8"
      }, {
        name: "Neighborhood Associations",
        containerID: 2,
        displayID: 3,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/9"
      }, {
        name: "GDC Zoining",
        containerID: 3,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/2"
      }
      // , {
      //   name: "Land Use",
      //   containerID: 3,
      //   displayID: 1,
      //   url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/1"
      // }
    ],
    individualCityFacility: [{
        "title": "Police Station",
        "displayID": "1",
        "nearestFeature": {
          "name": "Garland Police Department",
          "ADDRESS": "1891 Forest Ln, Garland, TX 75042",
          "lat": 32.910855,
          "long": -96.654807,
          "x": 2534713.03125,
          "y": 7019288.16197917
        }
      },
      {
        "title": "Municipal Court",
        "displayID": "2",
        "nearestFeature": {
          "name": "Garland Municipal Court",
          "ADDRESS": "1791 W Avenue B, Garland, TX 75042",
          "lat": 32.910286,
          "long": -96.655733,
          "x": 2534432.5390625,
          "y": 7019076.21458334
        }
      }
    ],
    mapService: {
      address: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer/1", //used to get parcel id,
      parcel: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer/2"
    }
  });
  multiSearch.startup();
  multiSearch.prepareCityFacilityList();


  //set geometry service to match spatial reference on different service.
  var geometryServiceUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";
  var geometryService;
  geometryService = new GeometryService(geometryServiceUrl);

  //draw map
  (function () {
    var mapImageLayerList = new MapImageLayer({
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer",
      sublayers: [{
        id: 0,
        visible: true
      }]
    });
    map = new Map({
      basemap: 'gray',
      layers: [mapImageLayerList]
    });
    view = new MapView({
      container: 'viewDiv',
      map: map,
      zoom: 12,
      center: [-96.636269, 32.91676]
    });
  })();

  //query can get a list of features inside a distance.

  var search = new Search({
    view: view,
    container: "search",
    allPlaceholder: ".",
    locationEnabled: false,
    sources: [{
      locator: new Locator({
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ADDRESS_LOCATOR/GeocodeServer"
      }),
      outFields: ["Ref_ID"], // Ref_ID is addressID
      singleLineFieldName: "Single Line Input",
      name: "GARLAND_ADDRESS_LOCATOR",
      placeholder: "Enter a City of Garland Address",
      suggestionsEnabled: true,
      maxSuggestions: 8,
      minSuggestCharacters: 5
    }]
  });

  search.on("search-start", function (e) {
    domClass.add('nodeResult', 'd-none');
    multiSearch.startNewSearch();

    var cardBodies = domQuery(".card-body>div", "nodeResult");
    cardBodies.forEach(function (node) {
      node.innerHTML = "<div class='load-wrapp'></div>";
    });

  });
  search.on("search-complete", function (e) {
    if (e.numResults == 0) {
      //no result found. Suggestion the nearest result
      var str = e.searchTerm.split(" ");
      if(str.length>1){
        var AddrNumber = str[0];
        var AddrRoad = str[1];

        var query = new Query({
          where: queryParameter.where,
          returnGeometry: true,
          outFields: ["*"]
        });
        var queryTask = new QueryTask({
          url: queryParameter.url
        });
        queryTask.execute(query).then(function (results) {
          // Results.graphics contains the graphics returned from query
          that.cityFacilityList.push({
            name: queryParameter.name,
            displayID: queryParameter.displayID,
            features: results.features
          });
        });

      }
    }

  });


  search.on("select-result", function (e) {
    var i, result;
    view.zoom = 12;
    if (e.result) {
      console.log("Address valid by address locator");
      //show result
      domClass.remove('nodeResult', 'd-none');


      //get information from parcel layer by Ref_ID(addressID)
      multiSearch.searchResult.addressID = e.result.feature.attributes.Ref_ID;
      multiSearch.searchResult.address = e.result.name;
      multiSearch.getInforByAddressID();


      getCrimeData(e.result.feature.geometry);
      showSubMap(e.result.feature.geometry);

      // projecting using geometry service:
      //"project search result, make it under stateplane. ");
      var params = new ProjectParameters({
        geometries: [e.result.feature.geometry],
        outSpatialReference: multiSearch.spatialReference
      });
      var geometries = geometryService.project(params).then(function (geometries) {
        console.log('get geometry');
        multiSearch.geometry = geometries[0];
        //console.log("Finding nearest city facilities and get distance");
        multiSearch.getNearestCityFacilityList();
        multiSearch.getServiceZoneList();
      }, function (error) {
        console.log(error);
        
        alert("Timeout exceeded. Please refresh the page and try again. If this error keeps happening, please contact helpdesk.");
      });
    }

  });

  //display data
  topic.subscribe("multiSearch/serviceZoneListUpdated", function () {
    var arr = multiSearch.searchResult.serviceZoneList;
    if (parcelInfo_obj2.length > 0) {
      arr = arr.concat(parcelInfo_obj2);
    }
    var containerID = [1, 2, 3];
    for (var i in containerID) {
      var subArr = arr.filter(function (val) {
        return val.containerID == containerID[i];
      }).sort(function (a, b) {
        return a.displayID - b.displayID;
      });
      subArr = subArr.map(function (val) {
        var title = val.title;
        var value;
        if (val.displayFieldName) {
          value = (val.serviceZone[val.displayFieldName] ? val.serviceZone[val.displayFieldName] : "NULL");
        } else {
          value = "NULL";
        }
        var str = "".concat("<li><span class='location-data-tag'>", title, ":</span> ", "<span class='location-data-value'>", value, "</span></li>");
        return str;
      });
      var node = dom.byId("serviceZone".concat(containerID[i]));
      node.innerHTML = "<ul>".concat(subArr.join(""), "</ul>");
    }



  });
  topic.subscribe("multiSearch/parcelInfoUpdated", function () {
    var item = multiSearch.searchResult.parcelInfo;
    var obj = {
      "Zip Code": item.ZIP_CODE,
      //"County":
      "Mapsco Grid": item.MAPSCO,
      "SCHOOL_DISTRICT": item.SCHOOL_DISTRICT,
      "City Council District": item.COUNCIL_ID,
      //City Council District Member
      "Census Tract": item.CENSUS_TRACT,
      "Health Complaint": item.HEALTH_COMPLAINT
    };
    var obj2 = [{
      title: "Fire Districts",
      containerID: 1,
      displayFieldName: "FIRE_DISTRICT",
      displayID: 4,
      queryPolygonCount: 1,
      serviceZone: {
        FIRE_DISTRICT: item.FIRE_DIST
      }
    }, {
      title: "Land Use",
      containerID: 3,
      displayFieldName: "value",
      displayID: 1,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.LANDUSE
      }
    }, {
      title: "ZONING",
      containerID: 3,
      displayFieldName: "value",
      displayID: 2,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.ZONING
      }
    }, {
      title: "Neighborhood",
      containerID: 2,
      displayID: 1,
      displayFieldName: "value",
      queryPolygonCount: 1,
      serviceZone: {
        value: item.NEIGHBORHOOD
      }
    }, {
      title: "Police Beats",
      containerID: 1,
      displayFieldName: "BEAT",
      displayID: 3,
      queryPolygonCount: 1,
      serviceZone: {
        BEAT: item.POLICE_BEAT
      }
    }, {
      title: "Police Districts",
      containerID: 1,
      displayFieldName: "DISTRICTS",
      displayID: 1,
      queryPolygonCount: 1,
      serviceZone: {
        DISTRICTS: item.POLICE_DIST
      }
    }];
    parcelInfo_obj2 = obj2;

    var arr = [];
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        arr.push({
          title: key,
          value: obj[key]
        });
      }
    }
    arr = arr.map(function (obj) {
      var str = "".concat("<li><span class='location-data-tag'>", obj.title, ":</span> ", "<span class='location-data-value'>", obj.value, "</span></li>");
      return str;
    });
    var node = dom.byId("parcelInfo");
    node.innerHTML = "<ul>".concat(arr.join(""), "</ul>");

  });

  topic.subscribe("multiSearch/nearestCityFacilityUpdated", function () {

    var arr = multiSearch.searchResult.nearestCityFacilityList.sort(function (a, b) {
      return a.displayID - b.displayID;
    }).map(function (val) {
      var obj = {
        title: "Nearest " + val.title,
        name: (val.nearestFeature.name ? val.nearestFeature.name : val.nearestFeature.BLDG_NAME),
        address_title: "Nearest " + val.title + " Address",
        address: (val.nearestFeature.ADDRESS ? val.nearestFeature.ADDRESS : val.nearestFeature.LOCATION),
        distance: val.distance
      };
      var str = "".concat("<li><span class='location-data-tag'>", obj.title, ":</span> ", "<span class='location-data-value'>", obj.name, "</span></li>",
        "<li><span class='location-data-tag'>", obj.address_title, ":</span> ", "<span class='location-data-value'>", obj.address, "</span>", "<span class='location-data-distance'>", " (", obj.distance, " mi.)</span>", "</li>");
      return str;
    });

    var node = dom.byId("nearestCityFacility");
    node.innerHTML = "<ul>".concat(arr.join(""), "</ul>");
  });


  //open crime page
  function getCrimeData(val) {
    console.log("crime map:");
    var lat = val.latitude;
    var long = val.longitude;
    var numberX = 0.03265857696533;
    var numberY = 0.02179533454397;

    var lat1 = lat + numberY;
    var lat2 = lat - numberY;
    var long1 = long + numberX;
    var long2 = long - numberX;

    var today = new Date();
    today.setHours(0,0,0);
    console.log(today);
    var yesterday=new Date(today.getTime() - 1 * 1000); //yesterday 24:59:59
    var severDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);//7 days ago 00:00:00
    var start_date = "".concat(severDaysAgo.getFullYear(), "-", severDaysAgo.getMonth() + 1, "-", severDaysAgo.getDate());
    var end_date = "".concat(yesterday.getFullYear(), "-", yesterday.getMonth() + 1, "-", yesterday.getDate());

    var url = "https://www.crimereports.com/home/#!/dashboard?zoom=15&searchText=Garland%252C%2520Texas%252075040%252C%2520United%2520States&incident_types=Assault%252CAssault%2520with%2520Deadly%2520Weapon%252CBreaking%2520%2526%2520Entering%252CDisorder%252CDrugs%252CHomicide%252CKidnapping%252CLiquor%252COther%2520Sexual%2520Offense%252CProperty%2520Crime%252CProperty%2520Crime%2520Commercial%252CProperty%2520Crime%2520Residential%252CQuality%2520of%2520Life%252CRobbery%252CSexual%2520Assault%252CSexual%2520Offense%252CTheft%252CTheft%2520from%2520Vehicle%252CTheft%2520of%2520Vehicle&days=sunday%252Cmonday%252Ctuesday%252Cwednesday%252Cthursday%252Cfriday%252Csaturday&start_time=0&end_time=23&include_sex_offenders=false&current_tab=map&start_date=".concat(start_date, "&end_date=", end_date, "&lat=", val.latitude, "&lng=", val.longitude);
    console.log("crime map:", url);
    var node = dom.byId("crimeData");
    node.innerHTML = "".concat("<iframe id='crimeDataIFrame' src='", url, "' height='400' width='100%'></iframe>");
    var nodeTitle = dom.byId("crime-map-title");
    nodeTitle.innerHTML = "".concat(" <i class='fas fa-plus-square'></i> Crime ( ", start_date, " to ", end_date, " )");

    var nodeBtn = dom.byId("open-crime-map");
    nodeBtn.onclick = function () {
      window.open(url, '_blank');
    };
  }

  function showSubMap(val) {
    var node = dom.byId("subMap");
    node.innerHTML = "".concat("<div id='subMapView' style='width: 100%; height: 350px;'></div>");

    var lat = val.latitude;
    var long = val.longitude;
    var mapImageLayerList = new MapImageLayer({
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer",
      sublayers: [{
        id: 3,
        visible: true
      }, {
        id: 2,
        visible: true
      }, {
        id: 1,
        visible: true
      }]
    });
    var map = new Map({
      basemap: "topo",
      layers: [mapImageLayerList]
    });
    var view = new MapView({
      container: 'subMapView',
      map: map,
      zoom: 18,
      center: [long, lat],
      constraints: {
        rotationEnabled: false
      }
    });
  }
});