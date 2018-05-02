require([

  '/js/MultiSearch.js',

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",

  "esri/tasks/GeometryService",
  "esri/geometry/projection",
  "esri/tasks/support/ProjectParameters",

  'dojo/on',
  'dojo/dom',
  'dojo/_base/array',
  "dojo/topic",
  "dojo/dom-class",

  'dojo/domReady!'
], function (
  MultiSearch,
  Map, MapView, MapImageLayer,
  Search, Locator,
  GeometryService, projection, ProjectParameters,

  on, dom, array,topic, domClass
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
  var map, view;
  var nearestFeatureList = [];
  var serviceZone = [];

  //create multisearch widget.
  var multiSearch = new GetMultiSearch({
    cityFacilitySourceList: [{
      name: "Fire Station",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
      where: "NUM>0",
      displayID: "3"
    }],
    serviceZoneSourceList: [{
        name: "Police Districts",
        containerID: 1,
        displayID: "1",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/4"
      }, {
        name: "Police Sectors",
        containerID: 1,
        displayID: "2",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/5"
      }, {
        name: "Police Beats",
        containerID: 1,
        displayID: "3",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/3"
      }, {
        name: "Fire Districts",
        containerID: 1,
        displayID: "4",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/0"
      }, {
        name: "Fire Alarm Grids",
        containerID: 1,
        displayID: "5",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/1"
      },
      {
        name: "EWS Brush Route Days",
        containerID: 1,
        displayID: "6",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/12"
      }, {
        name: "EWS Recycling Route Days",
        containerID: 1,
        displayID: "7",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/13"
      }, {
        name: "EWS Trash Route Days",
        containerID: 1,
        displayID: "8",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/14"
      }, {
        name: "Neighborhood Watches",
        containerID: 2,
        displayID: "1",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/8"
      }, {
        name: "Neighborhood Associations",
        containerID: 2,
        displayID: "2",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/9"
      }, {
        name: "Subdivision",
        containerID: 3,
        displayID: "1",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/0"
      }, {
        name: "GDC Zoining",
        containerID: 3,
        displayID: "3",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/2"
      }, {
        name: "Land Use",
        containerID: 3,
        displayID: "2",
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/1"
      }
    ],
    individualCityFacility: [{
        "title": "Police Station",
        "displayID": "1",
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
        "displayID": "2",
        "nearestFeature": {
          "name": "Garland Municipal Court",
          "location": "1791 W Avenue B, Garland, TX 75042",
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
      minSuggestCharacters: 3
    }]
  });

  search.on("select-result", function (e) {
    var i, result;
    view.zoom = 12;
    if (e.result) {
      console.log("Address valid by address locator");
      //show result
      domClass.remove('nodeResult', 'd-none');
      console.log(multiSearch);
      multiSearch.startNewSearch();
      //get information from parcel layer by Ref_ID(addressID)
      multiSearch.searchResult.addressID = e.result.feature.attributes.Ref_ID;
      multiSearch.searchResult.address = e.result.name;
      multiSearch.getInforByAddressID();

      // projecting using geometry service:
      //"project search result, make it under stateplane. ");
      var params = new ProjectParameters({
        geometries: [e.result.feature.geometry],
        outSpatialReference: multiSearch.spatialReference
      });
      var geometries = geometryService.project(params).then(function (geometries) {
        multiSearch.geometry = geometries[0];
        //console.log("Finding nearest city facilities and get distance");
        multiSearch.getNearestCityFacilityList();
        //add result to page directly. Because no Async involved.


        multiSearch.getServiceZoneList();

      }, function (error) {
        console.log(error);
      });
    }

    //get information from parcel layer

  });

  //Crime data
  // https://www.crimereports.com/api/crimes/details.json?agency_id=41082&days=sunday,monday,tuesday,wednesday,thursday,friday,saturday&end_date=2018-04-26&end_time=23&incident_types=Assault,Assault+with+Deadly+Weapon,Breaking+%26+Entering,Disorder,Drugs,Homicide,Kidnapping,Liquor,Other+Sexual+Offense,Property+Crime,Property+Crime+Commercial,Property+Crime+Residential,Quality+of+Life,Robbery,Sexual+Assault,Sexual+Offense,Theft,Theft+from+Vehicle,Theft+of+Vehicle&include_sex_offenders=false&lat1=32.941195641371934&lat2=32.878505940128846&lng1=-96.59351348876953&lng2=-96.66715621948242&sandbox=false&start_date=2018-04-12&start_time=0&zoom=14

});