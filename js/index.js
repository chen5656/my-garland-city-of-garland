require([
  'dojo/on',
  'dojo/dom',
  "dojo/dom-class",
  'dojo/_base/array',

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",

  "esri/tasks/GeometryService",
  "esri/geometry/projection",
  "esri/tasks/support/ProjectParameters",

  "dojo/topic",
  "dojo/query",

  'js/multi-search.js',

  'dojo/domReady!'
], function (
  on, dom, domClass, array,
  Map, MapView, MapImageLayer,

  Search, Locator, Query, QueryTask,
  GeometryService, projection, ProjectParameters,

  topic, domQuery,
  nameMultiSearch
) {


  'use strict';




  domClass.remove('main-content', 'd-none');

  var map, view, subMap, subView;
  var nearestFeatureList = [];
  var serviceZone = [];
  var parcelInfo_obj2;

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
      minSuggestCharacters: 6
    }]
  });

  //autofocus on search tool box when load.
  domQuery("input", "search")[0].autofocus = true;

  domQuery(".collapsed", "nodeResult").forEach(function (title) {
    title.onclick = function () {
      var card = dom.byId(this.getAttribute("aria-controls"));
      domClass.toggle(card, "show");
      var icon = this.firstElementChild;
      if (
        domClass.contains(icon, "fa-minus-square")) {
        domClass.add(icon, "fa-plus-square");
        domClass.remove(icon, "fa-minus-square");
      } else {
        domClass.add(icon, "fa-minus-square");
        domClass.remove(icon, "fa-plus-square");

      }


    };
  });

  domQuery(".closeButton", "main-content").forEach(function (btn) {
    btn.onclick = function () {
      var card = dom.byId(this.getAttribute("aria-controls"));
      domClass.add(card, "d-none");
    };
  });

  //create multisearch widget.
  var multiSearch = new GetMultiSearch({
    cityFacilitySourceList: [{
      name: "Nearest Fire Station",
      url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/2",
      where: "NUM>0",
      displayID: "4"
    }],
    serviceZoneSourceList: [{
        name: "Police Sector",
        containerID: 1,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/5"
      },
      {
        name: "Fire Alarm Grid",
        containerID: 1,
        displayID: 5,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Public_Safety/MapServer/1"
      }, {
        name: "EWS Recycling Pickup Day",
        containerID: 1,
        displayID: 7,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/13"
      }, {
        name: "EWS Trash and Brush Pickup Day",
        containerID: 1,
        displayID: 6,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/City_Services/MapServer/14"
      }, {
        name: "Neighborhood Watch",
        containerID: 2,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/8"
      }, {
        name: "Neighborhood Association",
        containerID: 2,
        displayID: 3,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap/Community_Neighborhood/MapServer/9"
      }, {
        name: "GDC Zoining",
        containerID: 3,
        displayID: 2,
        url: "https://maps.garlandtx.gov/arcgis/rest/services/Test/oneAddress/MapServer/2"
      }
    ],
    individualCityFacility: [{
        "title": "City Hall",
        "displayID": "1",
        "nearestFeature": {
          "name": "Garland City Hall",
          "ADDRESS": "200 N Fifth St, Garland, TX 75040",
          "lat": 32.913842,
          "long": -96.636131,
          "x": 2540451.901,
          "y": 7020425.638
        }
      }, {
        "title": "Customer Service",
        "displayID": "5",
        "nearestFeature": {
          "name": "Garland Customer Service",
          "ADDRESS": "217 N Fifth St, Garland, TX 75040",
          "lat": 32.914230,
          "long": -96.636957,
          "x": 2540168.1046,
          "y": 7020612.507
        }
      },
      {
        "title": "Police Station",
        "displayID": "2",
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
        "displayID": "3",
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
      cityLimit: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap_Other/myGarland/MapServer/0",
      address: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap_Other/myGarland/MapServer/1", //used to get parcel id,
      parcel: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap_Other/myGarland/MapServer/2",
      road: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap_Other/myGarland/MapServer/3",
      streetAlias: "https://maps.garlandtx.gov/arcgis/rest/services/CityMap_Other/myGarland/MapServer/4",
      geometry: "https://maps.garlandtx.gov/arcgis/rest/services/Utilities/Geometry/GeometryServer"
    }
  });
  multiSearch.startup();
  multiSearch.prepareCityFacilityList();


  //set geometry service to match spatial reference on different service.
  var geometryService;
  geometryService = new GeometryService(multiSearch.mapService.geometry);


  //display data

  topic.subscribe("multiSearch/parcelInfoUpdated", function () {
    var item = multiSearch.searchResult.parcelInfo;
    var obj = {
      "Zip Code": item.ZIP_CODE,
      //"County":
      "Mapsco Grid": item.MAPSCO,
      "School District": item.SCHOOL_DISTRICT,
      "City Council District": item.COUNCIL_ID,
      //City Council District Member
      "Census Tract": item.CENSUS_TRACT,
      "Health Complaint": item.HEALTH_COMPLAINT
    };
    var obj2 = [{
      title: "Fire District",
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
      title: "Police Beat",
      containerID: 1,
      displayFieldName: "BEAT",
      displayID: 3,
      queryPolygonCount: 1,
      serviceZone: {
        BEAT: item.POLICE_BEAT
      }
    }, {
      title: "Police District",
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

  topic.subscribe("multiSearch/nearestCityFacilityUpdated", function () {
    var arr = multiSearch.searchResult.nearestCityFacilityList.sort(function (a, b) {
      return a.displayID - b.displayID;
    }).map(function (val) {
      var obj = {
        title: val.title,
        name: (val.nearestFeature.name ? val.nearestFeature.name : val.nearestFeature.BLDG_NAME),
        address_title: val.title + " Address",
        address: (val.nearestFeature.ADDRESS ? val.nearestFeature.ADDRESS : val.nearestFeature.LOCATION),
        distance: val.distance
      };
      obj.googleLink = openInGoogleMap({
        destinationAdd: multiSearch.searchResult.address.replace(/\s|\t/g, "+"),
        originAdd: "Garland+" + obj.address.replace(/\s|\t/g, "+")
      });
      // var str = "".concat("<li><span class='location-data-tag'>", obj.title, ":</span> ", "<span class='location-data-value'><a href='", obj.googleLink, "'  target='_blank' title='Open in Google Map'>", obj.name, "</a></span></li>",
      //   "<li><span class='location-data-tag'>", obj.address_title, ":</span> ", "<span class='location-data-value'>", obj.address, "</span>", "<span class='location-data-distance'>", " (", obj.distance, " miles)</span>", "</li>");
      var str = "".concat("<li><span class='location-data-tag'>", obj.title, ":</span> ", "<span class='location-data-value'>", obj.address, "</span>", "<span class='location-data-distance'>", " (", obj.distance, " miles)</span>", "<span class='location-data-value'><a href='", obj.googleLink, "'  target='_blank' title='Open in Google Map'> ", obj.name, "</a></span></li>");

      return str;
    });

    var node = dom.byId("nearestCityFacility");
    node.innerHTML = "<ul>".concat(arr.join(""), "</ul>");
  });


  //query can get a list of features inside a distance.
  search.on("search-start", function (e) {
    domClass.add('nodeResult', 'd-none');
    domClass.add('suggestedAddresses', 'd-none');

    multiSearch.startNewSearch();

    //cardBodies
    domQuery(".card-body>div", "nodeResult").forEach(function (node) {
      if (node.id != "crimeData") {
        node.innerHTML = "<div class='load-wrapp'></div>";
      }
    });

  });
  search.on("search-complete", function (e) {
    if (e.numResults == 0) {
      //no result found. Suggestion the nearest result
      var AddrRoad, AddrNumber;
      var str = e.searchTerm.split(",")[0].trim().toUpperCase();
      var subStr = str.split(" ");
      if (subStr.length > 1) {
        var str1 = subStr[0];
        if (str1 != parseInt(str1, 10)) {
          //not a number, try to use it as street name
          AddrRoad = str;
          AddrNumber = 0;
        } else {
          subStr.shift();
          AddrRoad = subStr.join(" ");
          AddrNumber = str1;
        }
      } else {
        // try to use it as street name
        AddrRoad = str;
        AddrNumber = 0;
      }

      AddrRoad = findArrayInAliasExtend(AddrRoad);

      var query = new Query({
        where: "STREETLABEL LIKE '%".concat(AddrRoad, "%'"),
        returnGeometry: false,
        outFields: ["*"]
      });
      console.log(query.where);
      var queryTask = new QueryTask({
        url: multiSearch.mapService.address
      });
      queryTask.execute(query).then(function (results) {
        var AddList = [];
        if (results.features.length > 0) {
          //street entered correct
          console.log("correct street label, wrong address number");
          AddList = results.features.map(function (val) {
            return {
              streetNumber: val.attributes.STREETNUM,
              streetLabel: val.attributes.STREETLABEL
            };
          }).sort(function (a, b) {
            return a.streetNumber - b.streetNumber;
          });
          //find close nums
          var closestAddressList = closestNums(AddrNumber, AddList).map(function (val) {
            return "".concat("<li><button class = 'btn btn-link'>", val.streetNumber, " ", val.streetLabel, "</button></li>");
          });
          //display data
          domClass.remove('suggestedAddresses', 'd-none');
          dom.byId("address-links").innerHTML = "".concat("<p>Did you mean?</p>", "<ul>", closestAddressList.join(" "), "</ul>");
          domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
            btn.onclick = function () {
              search.search(this.textContent);
            };
          });
        } else {
          //street wrong

          var str = AddrRoad.split(" ");

          var longestStr = str[0];
          for (var i = 1; i < str.length; i++) {
            if (longestStr.length < str[i].length) {
              longestStr = str[i];
            }
          }
          var query = new Query({
            where: "STREETLABEL LIKE '%".concat(longestStr, "%'"),
            returnGeometry: false,
            outFields: ["*"]
          });
          console.log(query.where);
          var queryTask = new QueryTask({
            url: multiSearch.mapService.road
          });
          queryTask.execute(query).then(function (results) {
            if (results.features.length > 0) {
              console.log("wrong street label. find street name in road table");
              displayUniquleStreetList(results.features, AddrNumber);
            } else {
              //check alias table
              var query = new Query({
                where: "STREETNAME LIKE '%".concat(longestStr, "%'"),
                returnGeometry: false,
                outFields: ["*"]
              });
              var queryTask = new QueryTask({
                url: multiSearch.mapService.streetAlias
              });
              queryTask.execute(query).then(function (results) {
                if (results.features.length > 0) {

                  console.log("wrong street label. find street name in alias table");
                  displayUniquleStreetList(results.features, AddrNumber);
                } else {
                  domClass.remove('suggestedAddresses', 'd-none');
                  dom.byId("address-links").innerHTML = "".concat("<p>Couldn't find entered address. </p><p>Please check the address name.</p>");
                }
              });

            }
          });


        }
      });
    }

  });

  function displayUniquleStreetList(features, AddrNumber) {
    //get unique value
    var unique = {};
    var distinct = [];
    for (var i in features) {
      if (typeof (unique[features[i].attributes.STREETLABEL]) == "undefined") {
        distinct.push(features[i].attributes.STREETLABEL);
      }
      unique[features[i].attributes.STREETLABEL] = 0;
    }

    var tempAddrNum;
    if (AddrNumber == 0) {
      tempAddrNum = "";
    } else {
      tempAddrNum = "".concat(AddrNumber, " ");
    }

    distinct = distinct.slice(0, 5).map(function (val) {
      return "".concat("<li><button class = 'btn btn-link'>", tempAddrNum, val, "</button></li>");
    });


    domClass.remove('suggestedAddresses', 'd-none');
    dom.byId("address-links").innerHTML = "".concat("<p>Did you mean?</p>", "<ul>", distinct.join(" "), "</ul>");
    domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
      btn.onclick = function () {
        search.search(this.textContent);
      };
    });
  }

  function closestNums(num, arr) {
    var numsIndex = arr.length - 1;
    if (arr.length > 5) {
      for (var i = 0; i < arr.length; i++) {
        if (num < arr[i].streetNumber) {
          if (arr.length - (i + 3) < 0) {
            numsIndex = arr.length - 1;
          } else {
            numsIndex = i + 2;
          }
          break;
        }
      }
      if (numsIndex < 4) {
        numsIndex = 4;
      }
      return [arr[numsIndex - 4], arr[numsIndex - 3], arr[numsIndex - 2], arr[numsIndex - 1], arr[numsIndex]];

    } else {
      return arr;
    }
  }

  function findArrayInAliasExtend(AddrRoad) {
    var AliasExtend = {
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
    };


    var str = AddrRoad.split(" ");
    str = str.map(function (val) {
      if (AliasExtend[val]) {
        return AliasExtend[val];
      } else {
        return val;
      }

    });
    console.log(str.join(" ").trim());
    return str.join(" ").trim();

  }


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
        console.log("Error on select search result:", error);

        alert("Timeout exceeded. Please refresh the page and try again. If this error keeps happening, please contact helpdesk.");
      });
    }

  });


  //open crime page
  function getCrimeData(val) {
    console.log("crime map:");
    if (dom.byId("crimeData")) {
      console.log('iframe');
      dom.byId("crimeData").innerHTML = "<iframe id='crimeDataIFrame' src='#' height='400' width='100%' sandbox ='allow-scripts allow-same-origin allow-forms'></iframe>";
    }

    var lat = val.latitude;
    var long = val.longitude;
    var numberX = 0.03265857696533;
    var numberY = 0.02179533454397;

    var lat1 = lat + numberY;
    var lat2 = lat - numberY;
    var long1 = long + numberX;
    var long2 = long - numberX;

    var today = new Date();
    today.setHours(0, 0, 0);
    console.log(today);
    var yesterday = new Date(today.getTime() - 1 * 1000); //yesterday 23:59:59
    var severDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000); //7 days ago 00:00:00
    var start_date = "".concat(severDaysAgo.getFullYear(), "-", severDaysAgo.getMonth() + 1, "-", severDaysAgo.getDate());
    var end_date = "".concat(yesterday.getFullYear(), "-", yesterday.getMonth() + 1, "-", yesterday.getDate());

    var url = "https://www.crimereports.com/home/#!/dashboard?zoom=15&searchText=Garland%252C%2520Texas%252075040%252C%2520United%2520States&incident_types=Assault%252CAssault%2520with%2520Deadly%2520Weapon%252CBreaking%2520%2526%2520Entering%252CDisorder%252CDrugs%252CHomicide%252CKidnapping%252CLiquor%252COther%2520Sexual%2520Offense%252CProperty%2520Crime%252CProperty%2520Crime%2520Commercial%252CProperty%2520Crime%2520Residential%252CQuality%2520of%2520Life%252CRobbery%252CSexual%2520Assault%252CSexual%2520Offense%252CTheft%252CTheft%2520from%2520Vehicle%252CTheft%2520of%2520Vehicle&days=sunday%252Cmonday%252Ctuesday%252Cwednesday%252Cthursday%252Cfriday%252Csaturday&start_time=0&end_time=23&include_sex_offenders=false&current_tab=map&start_date=".concat(start_date, "&end_date=", end_date, "&lat=", val.latitude, "&lng=", val.longitude);
    console.log("crime map:", url);
    var node = dom.byId("crimeDataIFrame");
    node.src = url;
    dom.byId("crime-map-title").innerHTML = "".concat("Crime ( <time datetime='", start_date, " 00:00'>", start_date.slice(5), "</time> to <time datetime='", end_date, " 23:59'>", end_date.slice(5), "</time> )");

    dom.byId("open-crime-map").setAttribute("href", url);
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

  function openInGoogleMap(location) {
    var originAdd = location.originAdd; //2020+66+GARLAND+TX+75040
    var destinationAdd = location.destinationAdd; //garland+police+department
    var url = "https://www.google.com/maps/dir/?api=1&origin=".concat(originAdd, "&destination=", destinationAdd);
    return url;
  }


  if (getQueryVariable("address")) {
    var address = getQueryVariable("address").replace(/%20/g, ' ');
    search.search(address);
  }

  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return pair[1];
      }
    }
    return (false);
  }

});