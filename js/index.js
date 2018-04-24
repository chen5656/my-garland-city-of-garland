require([

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",

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
  var cityFacilityList = [];
  var nearestFeatureList = [];
  prepareCityFacilityList();

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
      singleLineFieldName: "Single Line Input",
      name: "GARLAND_ADDRESS_LOCATOR",
      placeholder: "Enter a City of Garland Address",
      locationEnabled: false,
      maxSuggestions: 8,
      minSuggestCharacters: 3
    }]
  });
  search.on("select-result", function (e) {
    view.zoom = 12;
    if (e.result) {
      console.log("Address valid");

      // projecting using geometry service:
      console.log("project search result, make it under stateplane. ");
      var params = new ProjectParameters({
        geometries: [e.result.feature.geometry],
        outSpatialReference: spatialReference2276
      });
      var geometries = geometryService.project(params).then(function (geometries) {
        console.log("Finding nearest");
        for (var i in cityFacilityList) {
          var result = findNearest(geometries[0], cityFacilityList[i]);
          nearestFeatureList.push(result);
        }
        console.log(nearestFeatureList);
      }, function (error) {
        console.log(error);
      });
    }
  });


  function findNearest(geometry, featureSet) {
    var distance;
    var minDistance;
    var minFeature;
    console.log("Finding " + featureSet.name);
    for (var i in featureSet.features) {
      distance = geometryEngine.distance(geometry, featureSet.features[i].geometry, "miles");
      if (distance < minDistance | !minDistance) {
        minDistance = distance;
        minFeature = featureSet.features[i];
      }
    }
    return {
      title: featureSet.name,
      nearestFeature: minFeature.attributes,
      distance: minDistance.toFixed(2)
    };
  }

  function prepareCityFacilityList() {
    //Police Station
    var sourceList = [{
      name: "LIBRARY",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/0",
      where: "DEPT = 'LIBRARY'"
    }, {
      name: "Fire Station",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
      where: "1=1"
    }];

    for (var i in sourceList) {
      runQuery(sourceList[i]);
    }

    function runQuery(queryParameter) {
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
        cityFacilityList.push({
          name: queryParameter.name,
          features: results.features
        });
      });

    }

  }

  function prepareCityServiceList(){
    var sourceList = [{
      name: "LIBRARY",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/0",
      where: "DEPT = 'LIBRARY'"
    }, {
      name: "Fire Station",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
      where: "1=1"
    }];

    for (var i in sourceList) {
      runQuery(sourceList[i]);
    }
  }

});