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

  "esri/Graphic",

  "dojo/topic",
  "dojo/query",
  "dojo/dom-attr",
  "dojo/dom-construct",

  'js/multi-search.js',
  "dojo/text!/maps/mygarland/setting/mapService.json",

  'dojo/domReady!'
], function (
  on, dom, domClass, array,
  Map, MapView, MapImageLayer,

  Search, Locator, Query, QueryTask,
  GeometryService, projection, ProjectParameters,
  Graphic,

  topic, domQuery, domAttr, domConstruct,

  nameMultiSearch, mapService_json

) {

  'use strict';

  //reading setting file
  var serviceUrl = JSON.parse(mapService_json);

  domClass.remove('main-content', 'd-none');

  var map, view, subMap, subView;
  var nearestFeatureList = [];
  var serviceZone = [];
  var parcelInfo_obj2;

  //draw map
  (function () {
    var mapImageLayerList = new MapImageLayer({
      url: serviceUrl.otherurl.mapserver.url,
      sublayers: [{
        id: serviceUrl.mapservice.citylimit.id,
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
        url: serviceUrl.otherurl.locator.url
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

  // //get last add from localstorage
  // var lastAddr= '';
  // if (typeof (Storage) !== "undefined"&& localStorage.getItem("mygl-lastaddr")) {
  //   lastAddr= localStorage.getItem("mygl-lastaddr");
  // }

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
        name: "City Hall",
        url: getMapServiceUrl("cityfacility"),
        where: "BLDG_NAME='CITY HALL'",
        containerID: "nearestCityFacility",
        displayID: "1"
      }, {
        name: "Customer Service",
        url: getMapServiceUrl("cityfacility"),
        where: "BLDG_NAME='UTILITY SERVICES'",
        containerID: "nearestCityFacility",
        displayID: "5"
      },
      {
        name: "Police Station",
        url: getMapServiceUrl("cityfacility"),
        where: "BLDG_NAME='POLICE STATION'",
        containerID: "nearestCityFacility",
        displayID: "2"
      },
      {
        name: "Municipal Courts",
        url: getMapServiceUrl("cityfacility"),
        where: "DEPT='COURTS'",
        containerID: "nearestCityFacility",
        displayID: "3",
      },
      {
        name: "Nearest Fire Station",
        url: getMapServiceUrl("cityfacility"),
        where: "DEPT='FIRE' and BLDG_NAME<>'FIRE ADMIN & TRAINING'",
        containerID: "nearestCityFacility",
        displayID: "4"
      },
      {
        name: "Nearest Library",
        url: getMapServiceUrl("cityfacility"),
        where: "DEPT='LIBRARY'",
        containerID: "nearestCityFacility",
        displayID: "6"
      }, {
        name: "Nearest Park",
        url: getMapServiceUrl("parks"),
        where: "1=1",
        containerID: "nearestPark",
        displayID: 1
      }, {
        name: "Nearest Recreation Center",
        url: getMapServiceUrl("cityfacility"),
        where: "DEPT='PARKS' and CAMPUS like '%RECREATION%'",
        containerID: "nearestPark",
        displayID: 7
      }

    ],
    serviceZoneSourceList: [{
      id: "ews-recycling",
      name: "EWS Recycling Pickup Week",
      containerID: "service",
      displayID: 3,
      url: getMapServiceUrl("ewsrecycling")
    }, {
      id: "ews-trash",
      name: "EWS Trash and Brush Pickup Day",
      containerID: "service",
      displayID: 2,
      url: getMapServiceUrl("ewstrash")
    }, {
      id: "neighborhood-watch",
      name: "Neighborhood Watch",
      containerID: "neighborhoods",
      displayID: 3,
      url: getMapServiceUrl("neighwatch")
    }, {
      id: "neighborhood-assoc",
      name: "Neighborhood Association",
      containerID: "neighborhoods",
      displayID: 4,
      url: getMapServiceUrl("neighasso")
    }, {
      id: "gdc-zoning",
      name: "GDC Zoning",
      containerID: "planning_development-zoning",
      displayID: 2,
      url: getMapServiceUrl("gdczoning")
    }, {
      id: "npo",
      name: "Neighborhood Police Officer",
      containerID: "neighborhoods",
      displayID: 2,
      url: getMapServiceUrl("npo")
    }],
    individualCityFacility: [],
    mapService: {
      cityLimit: getMapServiceUrl("citylimit"),
      address: getMapServiceUrl("address"), //used to get parcel id,
      parcel: getMapServiceUrl("parcel"),
      road: getMapServiceUrl("road"),
      streetAlias: getMapServiceUrl("streetalias"),
      geometry: serviceUrl.otherurl.geometry.url
    }
  });
  multiSearch.startup();
  multiSearch.prepareCityFacilityList();


  //set geometry service to match spatial reference on different service.
  var geometryService;
  geometryService = new GeometryService(multiSearch.mapService.geometry);


  //display data

  topic.subscribe("multiSearch/parcelInfoUpdated", function () {
    console.log("multiSearch/parcelInfoUpdated");
    var item = multiSearch.searchResult.parcelInfo;
    var obj = [{
      title: "City Council District",
      containerID: "parcelInfo",
      displayFieldName: "value",
      displayID: 1,
      queryPolygonCount: 1,
      serviceZone: {
        value: "<a id='council-dist' >".concat(item.COUNCIL_ID, "</a>"),
      }
    }, {
      title: "Zip Code",
      containerID: "parcelInfo",
      displayFieldName: "value",
      displayID: 2,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.ZIP_CODE
      }
    }, {
      title: "Mapsco Grid",
      containerID: "parcelInfo",
      displayFieldName: "value",
      displayID: 3,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.MAPSCO
      }
    }, {
      title: "School District",
      containerID: "parcelInfo",
      displayFieldName: "value",
      displayID: 4,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.SCHOOL_DISTRICT
      }
    }, {
      title: "Land Use",
      containerID: "planning_development-zoning",
      displayFieldName: "value",
      displayID: 1,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.LANDUSE
      }
    }, {
      title: "ZONING",
      containerID: "planning_development-zoning",
      displayFieldName: "value",
      displayID: 2,
      queryPolygonCount: 1,
      serviceZone: {
        value: item.ZONING
      }
    }, {
      title: "Neighborhood",
      containerID: "neighborhoods",
      displayID: 1,
      displayFieldName: "value",
      queryPolygonCount: 1,
      serviceZone: {
        value: item.NEIGHBORHOOD
      }
    }];

    displayServiceInfo(obj, "first");

    addHyperlinks("council");
  });

  topic.subscribe("multiSearch/serviceZoneListUpdated", function () {
    console.log("multiSearch/serviceZoneListUpdated");
    displayServiceInfo(multiSearch.searchResult.serviceZoneList, "last");

    //show EWS-link
    domClass.remove('EWS-link', 'd-none');

    //update npo hyperlink
    addHyperlinks("npo");
  });

  topic.subscribe("multiSearch/nearestCityFacilityUpdated", function () {
    function getHtlmForNearestFacilitiesWithAddress(val) {
      var obj = {
        title: val.title,
        name: (val.nearestFeature.BLDG_NAME ? val.nearestFeature.BLDG_NAME : ""),
        address_title: val.title + " Address",
        address: (val.nearestFeature.ADDRESS ? val.nearestFeature.ADDRESS : ""),
        distance: val.distance
      };
      obj.googleLink = openInGoogleMap({
        type: "FindDireciton",
        originAdd: multiSearch.searchResult.address.replace(/\s|\t/g, "+"),
        destinationAdd: "Garland+" + obj.address.replace(/\s|\t/g, "+")
      });
      var str = "".concat("<li><span class='location-data-tag'>", obj.title, ":</span> ", "<span class='location-data-value'>", obj.address, "</span>", "<span class='location-data-distance'>", " (", obj.distance, " miles)</span>", "<span class='location-data-value'><a href='", obj.googleLink, "'  target='_blank' title='Open in Google Map'> ", obj.name, "</a></span></li>");
      return str;
    }
    console.log("multiSearch/nearestCityFacilityUpdated");
    var arr = multiSearch.searchResult.nearestCityFacilityList.filter(function (val) {
      return val.containerID == "nearestCityFacility";
    }).sort(function (a, b) {
      return a.displayID - b.displayID;
    }).map(function (val) {
      return getHtlmForNearestFacilitiesWithAddress(val);
    });

    var node = dom.byId("nearestCityFacility");
    node.innerHTML = "<ul>".concat(arr.join(""), "</ul>");

    arr = multiSearch.searchResult.nearestCityFacilityList.filter(function (val) {
      return val.containerID == "nearestPark";
    }).sort(function (a, b) {
      return a.displayID - b.displayID;
    }).map(function (val) {
      if (val.nearestFeature.PARKS) { //parks
        var link = getParkLink(val.nearestFeature.PARKS);

        var str = "".concat("<li><span class='location-data-tag'>", val.title, ":</span> ", "<span class='location-data-value'>", "<a href='", link, "'  target='_blank' title='Open to see details'> ", val.nearestFeature.PARKS, "</a></span></li>");
        return str;
      } else { //not parks
        return getHtlmForNearestFacilitiesWithAddress(val);
      }

    });
    node = dom.byId("nearestPark");
    domClass.remove('nearestPark', 'd-none');
    node.innerHTML = "<ul>".concat(arr.join(""), "</ul>");
  });

  //query can get a list of features inside a distance.
  search.on("search-start", function (e) {

    domClass.add('nodeResult', 'd-none');
    domClass.add('suggestedAddresses', 'd-none');
    domClass.add('nearestPark', 'd-none');
    domClass.add('EWS-link', 'd-none');


    multiSearch.startNewSearch();

    //cardBodies
    // class='add-load-wrap'
    domQuery(".card-body>div", "nodeResult").forEach(function (node) {
      if (node.classList.contains("add-load-wrap")) {
        //remove old data
        var children = node.childNodes;
        var arr = Array.from(children);
        arr.forEach(function (val) {
          node.removeChild(val);
        });
        //add load-wrap
        domConstruct.create("div", {
          className: "load-wrap"
        }, node);
        domConstruct.create("ul", null, node);
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
  });

  search.on("select-result", function (e) {
    var i, result;
    view.zoom = 12;
    if (e.result) {
      console.log("Address valid by address locator");

      //update url
      if (e.result.name) {
        window.history.pushState("new-address", e.result.name, "?address=".concat(e.result.name.replace(/ /g, "%20")));
      }

      //show result
      domClass.remove('nodeResult', 'd-none');


      //get information from parcel layer by Ref_ID(addressID)
      multiSearch.searchResult.addressID = e.result.feature.attributes.Ref_ID;
      multiSearch.searchResult.address = e.result.name;
      multiSearch.searchResult.addressGeometry = e.result.feature.geometry;
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
        console.log('get input geometry');
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

  function displayServiceInfo(dataList, order) {
    var containerID = ["service", "neighborhoods", "planning_development-zoning", "parcelInfo"];
    var i;
    //remove load-wrap
    for (i in containerID) {
      var node = dom.byId(containerID[i]);
      domQuery(".load-wrap", node).forEach(function (child) {
        node.removeChild(child);
      });
    }

    for (i in containerID) {
      var containerNode = dom.byId(containerID[i]);
      var subArr = dataList.filter(function (val) {
        return val.containerID == containerID[i];
      }).sort(function (a, b) {
        if (order == "first") {
          return b.displayID - a.displayID;
        } else if (order == "last") {
          return a.displayID - b.displayID;
        }

      });
      subArr.forEach(function (val) {
        var value;
        if (val.displayFieldName) {
          value = (val.serviceZone[val.displayFieldName] ? val.serviceZone[val.displayFieldName] : "NULL");
        } else {
          value = "NULL";
        }
        var ulNode = domQuery("ul", containerNode)[0];

        var li = domConstruct.create("li", null, ulNode, order);

        domConstruct.create("span", {
          className: "location-data-tag",
          innerHTML: val.title.concat(": ")
        }, li);

        domConstruct.create("span", {
          className: "location-data-value",
          innerHTML: value,
          id: val.id
        }, li);

      });
    }
  }

  //open crime page
  function getCrimeData(val) {
    console.log("crime map:");
    if (dom.byId("crimeData")) {
      dom.byId("crimeData").innerHTML = "<iframe id='crimeDataIFrame' src='https://www.crimereports.com/' height='400' width='100%' sandbox ='allow-scripts allow-same-origin allow-forms'></iframe>";
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
    var yesterday = new Date(today.getTime() - 1 * 1000 - 6 * 24 * 60 * 60 * 1000); //7 days before yesterday 23:59:59
    var severDaysAgo = new Date(today.getTime() - (7 + 6) * 24 * 60 * 60 * 1000); //14 days ago 00:00:00
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
      url: serviceUrl.otherurl.mapserver.url,
      sublayers: [{
        id: serviceUrl.mapservice.parcel.id,
        visible: true
      }, {
        id: serviceUrl.mapservice.address.id,
        visible: true
      }]
    });
    subMap = new Map({
      basemap: "topo",
      layers: [mapImageLayerList]
    });
    subView = new MapView({
      container: 'subMapView',
      map: subMap,
      zoom: 18,
      center: [long, lat],
      constraints: {
        rotationEnabled: false
      }
    });

    //add a graphic point of the address
    // // Create a symbol for drawing the point

    var markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [226, 119, 40]
    };
    var pntAtt = {
      Title: "Geolocator result",
      Info: multiSearch.searchResult.address,
      AddressID: multiSearch.searchResult.addressID
    };

    // Create a graphic and add the geometry and symbol to it
    var pointGraphic = new Graphic({
      geometry: multiSearch.searchResult.addressGeometry,
      symbol: markerSymbol,
      attributes: pntAtt
    });
    subView.graphics.add(pointGraphic);
  }

  function openInGoogleMap(location) {
    if (location.type == "FindDireciton") {
      var originAdd = location.originAdd; //2020+66+GARLAND+TX+75040
      var destinationAdd = location.destinationAdd; //garland+police+department
      var url = "https://www.google.com/maps/dir/?api=1&origin=".concat(originAdd, "&destination=", destinationAdd);
      return url;
    } else if (location.type == "FindLocation") {
      return "https://www.google.com/maps/search/".concat(location.destinationAdd);
    }
  }

  function getParkLink(parkName) {
    var url = serviceUrl.otherurl.parks.url;
    var parkList = ["ab", "cd", "efg", "hij", "klmnopq", "rst", "wxy"];
    var firstLetter = parkName.toLowerCase().charAt(0);
    var str = parkList.filter(function (value) {
      return value.indexOf(firstLetter) != -1;
    })[0];
    return url.replace("ab", str.charAt(0).concat(str.slice(-1)));
  }

  function addHyperlinks(eventName) {
    if (eventName == "council") {
      var councilDist = dom.byId("council-dist");
      councilDist.setAttribute("href", serviceUrl.otherurl.councildistrict.url.replace("2", councilDist.innerHTML));
    }

    if (eventName == "npo") {
      //add a phone icon and email icon after police officer name
      console.log(multiSearch.searchResult);
      var npoInfo = multiSearch.searchResult.serviceZoneList.filter(function (val) {
        return val.id == "npo";
      })[0].serviceZone;
      var npoParent = dom.byId("npo").parentNode;
      npoParent.innerHTML = npoParent.innerHTML.concat(" <a href='tel:", npoInfo.PHONE, "'><i class='fas fa-phone-square' title='", npoInfo.PHONE, "'></i></a> <a href='mailto:", npoInfo.EMAIL, "'><i class='fas fa-envelope' title= '", npoInfo.EMAIL, "'></i></a>");
    }
  }

  if (getURLQueryVariable("address")) {
    var address = getURLQueryVariable("address").replace(/%20/g, ' ');
    search.search(address);
  }

  function getURLQueryVariable(variable) {
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

  function getMapServiceUrl(itemName) {
    var val = serviceUrl.mapservice[itemName];
    return val.url.concat("/", val.id);
  }
});