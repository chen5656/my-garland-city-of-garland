require([

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",
  "esri/geometry/SpatialReference",

  "esri/geometry/geometryEngine",
  "esri/tasks/support/Query", "esri/tasks/QueryTask",

  'dojo/on',
  'dojo/dom',
  'dojo/_base/array',

  'dojo/domReady!'
], function (
  Map, MapView,MapImageLayer,
  Search, Locator, SpatialReference,
  
  geometryEngine, Query, QueryTask,

  on, dom, array
) {

  'use strict';
  var featureSetList = [];
  var searchResultList = [];
  prepareFeatureSetList();
  var srStatePlane = new SpatialReference(2276); 
  //EPSG:2276: NAD83 / Texas North Central (ftUS)
  //ESRI:102738: NAD 1983 StatePlane Texas North Central FIPS 4202 Feet

  //draw map
  var mapImageLayerList = new MapImageLayer({
    url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/BaseLayers/MapServer",
    sublayers: [
      {
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
    container: "search",
    allPlaceholder: "District or Senator",
    sources: [{
      locator: new Locator({
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Locator/GARLAND_ROAD_LOCATOR/GeocodeServer"
      }),
      outSpatialReference: srStatePlane,
      singleLineFieldName: "Single Line Input",
      name: "GARLAND_ROAD_LOCATOR",
      placeholder: "Enter a City of Garland Address",
      locationEnabled: false,
      maxSuggestions: 8,
      minSuggestCharacters: 3
    }]
  });
  search.on("select-result", function (e) {
    if (e.result) {
      console.log("Address valid");
      var extent = e.result.extent;
      var feature = e.result.feature;
      for (var i in featureSetList) {
        var ss = findNearest(feature, featureSetList[i]);
        console.log(ss);
      }

    }
  });

  function findNearest(feature, featureSet) {
    var distance;
    var minDistance;
    var minFeature;
      console.log("Finding "+ featureSet.name);
    for (var i in featureSet.features) {
      console.log(feature.geometry.spatialReference);
      console.log(featureSet.features[i].geometry.spatialReference);
      distance =  geometryEngine.distance(feature.geometry, featureSet.features[i].geometry,	9101);
      if (distance < minDistance | !minDistance) {
        minDistance = distance;
        minFeature = featureSet.features[i];
      }
    }
    return {
      title: featureSet.name,
      address: "address",
      nearestFeature: minFeature,
      distance: minDistance
    };
  }

  function prepareFeatureSetList() {

    runQuery({
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/0",
      where: "DEPT = 'LIBRARY'"
    });



    function runQuery(queryParameter) {
      var query = new Query();
      var queryTask = new QueryTask({
        url: queryParameter.url
      });
      query.where = queryParameter.where;
      query.outSpatialReference = srStatePlane;
      query.returnGeometry = true;
      query.outFields = ["*"];
      queryTask.execute(query).then(function (results) {
        // Results.graphics contains the graphics returned from query
        featureSetList.push({
          name: "LIBRARY",
          features: results.features
        });
        console.log(featureSetList);
      });

    }

  }


});