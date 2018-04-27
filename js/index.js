require([

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",

  "esri/geometry/Point",

  "esri/geometry/SpatialReference",
  "esri/tasks/GeometryService",
  "esri/geometry/geometryEngine",
  "esri/geometry/projection",
  "esri/tasks/support/ProjectParameters",
  "esri/tasks/support/Query", "esri/tasks/QueryTask",

  'dojo/on',
  'dojo/dom',
  'dojo/_base/array',

  'dojo/domReady!'
], function (
  Map, MapView, MapImageLayer,
  Search, Locator,
  Point,
  SpatialReference, GeometryService, geometryEngine, projection, ProjectParameters,
  Query, QueryTask,

  on, dom, array
) {

  'use strict';
  /*
  About projection.
  In this file, search, locator, and query are used, and in different spatial reference(SR).
  The original SR for locator and query is 2276. //EPSG:2276: NAD83 / Texas North Central (ftUS)
  The original SR for search widget is 4326 (WGS 84).
  I can easily set the outSpatialReference for query to 4326. (I can also set the out SR for locator, but it won't change the result SR when uses the search widget. When uses locator directly, the result will be the out SR.)
  When calculate distance, it requires the inputs under the same Spatial Reference. 
  So I can either setup the out SR for query as 4326, or re-projection the search result to 2276.
  Because 4326 is radian degree, and I also need to show the distance as mileage. So in this code, I kept query output as 2276, and re-projection the search result.
  */
  var nearestFeatureList = [];
  var serviceZone = [];

  var cityFacilityList = [];
  prepareCityFacilityList();
  var cityServiceList = [];
  prepareCityServiceList();

  var spatialReference2276 = new SpatialReference({
    wkid: 2276
  });
  var geometryServiceUrl = "https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer";
  var geometryService;
  geometryService = new GeometryService(geometryServiceUrl);

  //draw map
  var mapImageLayerList = new MapImageLayer({
    url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer",
    sublayers: [{
      id: 0,
      visible: true
    }]
  });
  var map = new Map({
    basemap: 'gray',
    layers: [mapImageLayerList]
  });
  var view = new MapView({
    container: 'viewDiv',
    map: map,
    zoom: 12,
    center: [-96.636269, 32.91676]
  });

  //query can get a list of features inside a distance.

  var search = new Search({
    view: view,
    container: "search",
    allPlaceholder: ".",
    sources: [{
      locator: new Locator({
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ADDRESS_LOCATOR/GeocodeServer"
      }),
      outFields: ["Ref_ID"], // Ref_ID is addressID
      singleLineFieldName: "Single Line Input",
      name: "GARLAND_ADDRESS_LOCATOR",
      placeholder: "Enter a City of Garland Address",
      locationEnabled: false,
      maxSuggestions: 8,
      minSuggestCharacters: 3
    }]
  });

  search.on("select-result", function (e) {
    var i, result;
    view.zoom = 12;
    if (e.result) {
      console.log("Address valid by address locator");

      // projecting using geometry service:
      //"project search result, make it under stateplane. ");
      var params = new ProjectParameters({
        geometries: [e.result.feature.geometry],
        outSpatialReference: spatialReference2276
      });
      var geometries = geometryService.project(params).then(function (geometries) {
        //console.log("Finding nearest city facilities and get distance");
        //police station and court
        var arr=distanceToPoliceStationAndCourt(geometries[0]);
        nearestFeatureList = nearestFeatureList.concat(arr);

        for (i in cityFacilityList) {
          findNearest(geometries[0], cityFacilityList[i]);
        }

        for (i in cityServiceList) {
          findContainerPolygon(geometries[0], cityServiceList[i]);
        }

      }, function (error) {
        console.log(error);
      });
    }

    //get information from parcel layer

  });

  function distanceToPoliceStationAndCourt(geometry) {
    var userPnt = {
      x: geometry.x,
      y: geometry.y
    };
    var featureList = [{
        "title": "Police Station",
        "nearestFeature": {
          "name": "Garland Police Department",
          "location": "1891 Forest Ln, Garland, TX 75042",
          "lat": 32.910855,
          "long": -96.654807,
          "x": 2534713.03125,
          "y": 7019288.16197917
        }
      },
      {
        "title": "Municipal Court",
        "nearestFeature": {
          "name": "Garland Municipal Court",
          "location": "1791 W Avenue B, Garland, TX 75042",
          "lat": 32.910286,
          "long": -96.655733,
          "x": 2534432.5390625,
          "y": 7019076.21458334
        }
      }
    ];
    return featureList.map(function (val) {
      var facilityPnt = {
        x: val.nearestFeature.x,
        y: val.nearestFeature.y
      };
      return {
        "title": val.title,
        "nearestFeature": val.nearestFeature,
        "distance": distanceBetweenTwoPointInStatePlan(userPnt, facilityPnt)
      };
    });
  }

  function findContainerPolygon(geometry, featureSet) {
    var query = new Query();
    query.returnGeometry = true;
    query.outFields = ["*"];
    query.geometry = geometry;
    query.spatialRelationship = "intersects";
    var queryTask = new QueryTask({
      url: featureSet.url
    });
    queryTask.execute(query).then(function (e) {
      var result = {
        title: featureSet.name,
        serviceZone: e.features[0].attributes,
        displayFieldName: e.displayFieldName
      };
      serviceZone.push(result);
    });
  }

  function findNearest(geometry, featureSet) {
    var distance;
    var minDistance;
    var minFeature;
    for (var i in featureSet.features) {
      distance = geometryEngine.distance(geometry, featureSet.features[i].geometry, "miles");
      if (distance < minDistance | !minDistance) {
        minDistance = distance;
        minFeature = featureSet.features[i];
      }
    }
    var result = {
      title: featureSet.name,
      nearestFeature: minFeature.attributes,
      distance: minDistance.toFixed(2)
    };
    nearestFeatureList.push(result);
  }

  function distanceBetweenTwoPointInStatePlan(pnt1, pnt2) {
    var result = (Math.sqrt(Math.pow((pnt1.x - pnt2.x), 2) + Math.pow((pnt1.y - pnt2.y), 2)) / 5280).toFixed(2);
    return result;
  }

  function prepareCityFacilityList() {
    //Police Station
    var sourceList = [
      //   {
      //   name: "LIBRARY",
      //   url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/0",
      //   where: "DEPT = 'LIBRARY'"
      // },
      {
        name: "Fire Station",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
        where: "NUM>0"
      }
    ];

    for (var i in sourceList) {
      runQuery(sourceList[i], cityFacilityList);
    }

  }

  function prepareCityServiceList() {
    var sourceList = [{
        name: "Police Districts",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/4"
      }, {
        name: "Police Sectors",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/5"
      }, {
        name: "Police Beats",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/3"
      }, {
        name: "Fire Districts",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/0"
      }, {
        name: "Fire Alarm Grids",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/1"
      },
      {
        name: "EWS Brush Route Days",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/12"
      }, {
        name: "EWS Recycling Route Days",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/13"
      }, {
        name: "EWS Trash Route Days",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/14"
      }
    ];
    cityServiceList = sourceList;
    // for (var i in sourceList) {
    //   runQuery(sourceList[i], cityServiceList);
    // }
  }


  function runQuery(queryParameter, targetList) {
    var query = new Query();
    var queryTask = new QueryTask({
      url: queryParameter.url
    });
    query.where = queryParameter.where;
    //query.outSpatialReference = spatialReference2276;
    query.returnGeometry = true;
    query.outFields = ["*"];
    queryTask.execute(query).then(function (results) {
      // Results.graphics contains the graphics returned from query
      targetList.push({
        name: queryParameter.name,
        features: results.features
      });
    });

  }

  //Crime data
  // https://www.crimereports.com/api/crimes/details.json?agency_id=41082&days=sunday,monday,tuesday,wednesday,thursday,friday,saturday&end_date=2018-04-26&end_time=23&incident_types=Assault,Assault+with+Deadly+Weapon,Breaking+%26+Entering,Disorder,Drugs,Homicide,Kidnapping,Liquor,Other+Sexual+Offense,Property+Crime,Property+Crime+Commercial,Property+Crime+Residential,Quality+of+Life,Robbery,Sexual+Assault,Sexual+Offense,Theft,Theft+from+Vehicle,Theft+of+Vehicle&include_sex_offenders=false&lat1=32.941195641371934&lat2=32.878505940128846&lng1=-96.59351348876953&lng2=-96.66715621948242&sandbox=false&start_date=2018-04-12&start_time=0&zoom=14

});