require([
  'dojo/dom',
  "dojo/dom-class",

  'esri/Map',
  'esri/views/MapView',
  "esri/layers/MapImageLayer",

  "esri/widgets/Search",
  "esri/tasks/Locator",
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",

  "esri/tasks/GeometryService",
  "esri/tasks/support/ProjectParameters",

  "esri/geometry/SpatialReference",
  "esri/geometry/geometryEngineAsync",

  "esri/Graphic",

  "dojo/_base/lang",
  "dojo/promise/all",
  "dojo/topic",
  "dojo/query",
  "dojo/dom-construct",


  'dojo/domReady!'
], function (
  dom, domClass,
  Map, MapView, MapImageLayer,

  Search, Locator, Query, QueryTask,
  GeometryService, ProjectParameters,
  SpatialReference, geometryEngineAsync,
  Graphic,

  lang, all,
  topic, domQuery, domConstruct

) {
  'use strict';
  var view, search, multiSearch, geometryService;
  //init: topMap, search, appSetting, multiSearch
  (function () {
    var mapImageLayerList = new MapImageLayer(appSetting.mapInTop.mapImageLayer);
    var map = new Map({
      basemap: appSetting.mapInTop.basemap,
      layers: [mapImageLayerList]
    });
    view = new MapView({
      container: 'viewDiv',
      map: map,
      zoom: appSetting.mapInTop.zoom,
      center: appSetting.mapInTop.center
    });

    //search widget
    var searchSources = appSetting.locator.sourceSetting;
    searchSources.locator = new Locator({
      url: appSetting.locator.locatorUrl
    });
    search = new Search({
      view: view,
      container: "search",
      allPlaceholder: ".",
      locationEnabled: false,
      sources: [searchSources]
    });

    //create multisearch widget.
    multiSearch = {
      mapService: layerSetting.layers.mapService, //need address map service and parcel map service
      individualCityFacility: layerSetting.layers.individualCityFacility, //Police Station,Court ...
      cityFacilitySourceList: layerSetting.layers.cityFacilitySourceList,
      cityFacilityList: layerSetting.layers.cityFacilityList,
      serviceZoneSourceList: layerSetting.layers.serviceZoneSourceList,
      spatialReference: new SpatialReference({
        wkid: 2276
      }),
      startNewSearch: function () {
        this.searchResult = {
          address: null,
          addressID: null,
          nearestCityFacilityList: [],
          serviceZoneList: [],
          parcelInfo: null
        };
      },
      prepareCityFacilityList: function () {
        var that = this;
        this.cityFacilityList = [];
        this.cityFacilitySourceList.forEach(function (item) {
          runQuery(item);
        });

        function runQuery(queryParameter) {
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
            queryParameter.features = results.features;
            that.cityFacilityList.push(queryParameter);
          });
        }
      },
      getInforByAddressID: function () {
        console.log("getInforByAddressID function");
        var that = this;
        var query = new Query();
        var queryTask = new QueryTask({
          url: this.mapService.address
        });
        query.where = "ADDRESSID =" + this.searchResult.addressID;
        //query.outSpatialReference = spatialReference2276;
        query.returnGeometry = false;
        query.outFields = ["PARCELID"];
        queryTask.execute(query).then(function (results) {
          // Results.graphics contains the graphics returned from query
          if (results.features[0].attributes.PARCELID) {
            var parcelID = results.features[0].attributes.PARCELID;
            var query = new Query();
            var queryTask = new QueryTask({
              url: that.mapService.parcel
            });
            query.where = "PARCELID  =" + parcelID;
            //query.outSpatialReference = spatialReference2276;
            query.returnGeometry = false;
            query.outFields = ["*"];
            queryTask.execute(query).then(function (results) {
              that.searchResult.parcelInfo = results.features[0].attributes;
              topic.publish("multiSearch/parcelInfoUpdated", {
                parcelID: parcelID
              });
            });
          } else {
            console.log("error getInforByAddressID: ", that.searchResult.addressID);
          }
        });
      },
      getNearestCityFacilityList: function () {
        console.log("getNearestCityFacilityList Function");
        var that = this;

        //individualCityFacility distance
        var arr = distanceToIndividualCityFacility(this.geometry);
        this.searchResult.nearestCityFacilityList = this.searchResult.nearestCityFacilityList.concat(arr);
        this.cityFacilityList.forEach(function (item) {
          findNearest(that.geometry, item);
        });

        function findNearest(geometry, featureSet) {
          var distanceRequestList = featureSet.features.map(function (item) {
            return geometryEngineAsync.distance(geometry, item.geometry, "miles")
          });
          var promises = new all(distanceRequestList);
          promises.then(lang.hitch(this, function (response) {
            var minDistance = Math.min.apply(null, response);
            var minIndex = response.indexOf(minDistance);

            var minFeature = featureSet.features[minIndex];
            featureSet.nearestFeature = minFeature.attributes;
            featureSet.distance = minDistance.toFixed(2);
            that.searchResult.nearestCityFacilityList.push(featureSet);
            if (that.searchResult.nearestCityFacilityList.length == that.cityFacilityList.length + that.individualCityFacility.length) {
              //time to display data
              topic.publish("multiSearch/nearestCityFacilityUpdated", {
                count: that.searchResult.nearestCityFacilityList.length
              });
            }
          })).catch(function (e) {
            console.log("Error - findNearest: ", e);
          });
        }

        function distanceToIndividualCityFacility(geometry) {
          var userPnt = {
            x: geometry.x,
            y: geometry.y
          };
          var arr = that.individualCityFacility.map(function (val) {
            var facilityPnt = {
              x: val.nearestFeature.x,
              y: val.nearestFeature.y
            };
            return {
              "title": val.title,
              "displayID": val.displayID,
              "nearestFeature": val.nearestFeature,
              "distance": distanceBetweenTwoPointInStatePlan(userPnt, facilityPnt)
            };
          });
          return arr;
        }

        function distanceBetweenTwoPointInStatePlan(pnt1, pnt2) {
          return (Math.sqrt(Math.pow((pnt1.x - pnt2.x), 2) + Math.pow((pnt1.y - pnt2.y), 2)) / 5280).toFixed(2);
        }
      },
      getServiceZoneList: function () {
        console.log("getServiceZoneList Function");
        var that = this;

        var query = new Query({
          returnGeometry: true,
          outFields: ["*"],
          spatialRelationship: "intersects"
        });
        query.geometry = this.geometry;

        var queryRequest = [];
        this.serviceZoneSourceList.forEach(function (item) {
          var queryTask = new QueryTask({
            url: item.url
          });
          //Assign the esriRequest execute function to a variable
          var request = queryTask.execute(query);
          //add the function variable to a array
          queryRequest.push(request);
        });

        var promises = new all(queryRequest);
        promises.then(function (response) {
          for (var i in response) {
            var featureSet = that.serviceZoneSourceList[i];
            var result = {
              id: featureSet.id,
              title: featureSet.name,
              containerID: featureSet.containerID,
              displayID: featureSet.displayID,
              queryPolygonCount: response[i].features.length
            };
            if (response[i].features.length > 0) {
              result.serviceZone = response[i].features[0].attributes;
              result.displayFieldName = response[i].displayFieldName;
            }
            that.searchResult.serviceZoneList.push(result);
          }

          //time to display data
          topic.publish("multiSearch/serviceZoneListUpdated", {
            count: response.length
          });
        }).catch(function (e) {
          console.log("Error - getServiceZoneList:", e);
        });
      }
    };
    multiSearch.prepareCityFacilityList();

    //set geometry service to match spatial reference on different service.
    geometryService = new GeometryService(multiSearch.mapService.geometry);

  })();

  //update html div format.
  (function () {
    domClass.remove('main-content', 'd-none');

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
  })();

  //display data
  topic.subscribe("multiSearch/parcelInfoUpdated", function () {
    console.log("multiSearch/parcelInfoUpdated");
    var item = multiSearch.searchResult.parcelInfo;
    var obj = layerSetting.parcelData.map(function (val) {
      val.serviceZone = {
        value: item[val.fieldName]
      };
      return val;
    });
    displayReferenceData(obj, "first");
  });

  topic.subscribe("multiSearch/serviceZoneListUpdated", function () {
    console.log("multiSearch/serviceZoneListUpdated");

    displayReferenceData(multiSearch.searchResult.serviceZoneList, "last");

    //show ews_link
    domClass.remove('ews_link', 'd-none');

    //update npo hyperlink
    addHyperlinks("npo");
    //
    addHyperlinks("code-n-districts");
    addHyperlinks("code-commercial-districts");
  });

  topic.subscribe("multiSearch/nearestCityFacilityUpdated", function () {

    console.log("multiSearch/nearestCityFacilityUpdated");
    var dataList = multiSearch.searchResult.nearestCityFacilityList;
    displayLocationData(dataList.filter(function (val) {
      return val.containerID == "nearestCityFacility";
    }), "last");
    displayLocationData(dataList.filter(function (val) {
      return val.containerID == "service";
    }), "first");

  });

  function displayLocationData(dataList, order) {
    var containerID = ["nearestCityFacility", "service"];
    var i;
    //remove load-wrapp
    for (i in containerID) {
      domQuery(".load-wrapp", containerID[i]).forEach(dojo.destroy);
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
        var ulNode = domQuery("ul", containerNode)[0];
        var li = domConstruct.create("li", {
          id: val.id
        }, ulNode, order);

        domConstruct.create("span", {
          className: "location-data-tag",
          innerHTML: val.name + ": "
        }, li);

        if (val.displayValue1) {
          domConstruct.create("span", {
            className: "location-data-value",
            innerHTML: val.nearestFeature[val.displayValue1]
            //id: val.id        
          }, li);
          domConstruct.create("span", {
            className: "location-data-distance",
            innerHTML: " (" + val.distance + " miles)"
          }, li);
        }
        var hyperlink = function (val) {
          if (val.linkValue) {
            return "<a href='" + val.nearestFeature[val.linkValue] + "'  target='_blank' title='Open to see details'> ";
          } else if (val.addressValue) {
            return "".concat("<a href='",
              openInGoogleMap({
                type: "FindDireciton",
                originAdd: multiSearch.searchResult.address.replace(/\s|\t/g, "+"),
                destinationAdd: val.nearestFeature[val.addressValue].replace(/\s|\t/g, "+")
              }),
              "'  target='_blank' title='Open in Google Map'> ");
          } else {
            return "";
          }
        }(val);

        if (val.displayValue2) {
          domConstruct.create("span", {
            className: "location-data-value",
            innerHTML: hyperlink + val.nearestFeature[val.displayValue2] + "</a>"
          }, li);
        }
      });
    }
  }

  function displayReferenceData(dataList, order) {

    var containerID = ["service", "neighborhoods", "planning_development-zoning", "parcelInfo"];
    var i;
    //remove load-wrapp
    for (i in containerID) {
      domQuery(".load-wrapp", containerID[i]).forEach(dojo.destroy);
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
        var innerHTML_value, value_tag_name;

        if (val.displayFieldName) {
          innerHTML_value = (val.serviceZone[val.displayFieldName] ? val.serviceZone[val.displayFieldName] : "NULL");
        } else {
          innerHTML_value = "NULL";
        }
        var ulNode = domQuery("ul", containerNode)[0];

        var li = domConstruct.create("li", {
          id: val.id
        }, ulNode, order);

        domConstruct.create("span", {
          className: "location-data-tag",
          innerHTML: val.title + ": "
        }, li);

        //create <a> as hyperlink, or <span> as text, and add hyperlink to <a>
        var valueNodeProperty = {
          className: "location-data-value",
          innerHTML: innerHTML_value
        };
        if (val.hyperlink) {
          var url = val.hyperlink_formula.url;
          val.hyperlink_formula.replaceList.forEach(function (val) {
            var newValue;
            switch (val.type) {
              case "displayValue":
                newValue = innerHTML_value;
                break;
              case "none":
                break;
            }
            url = url.replace(new RegExp(val.replaceWith, 'g'), newValue);
          });

          valueNodeProperty.href = url;
          valueNodeProperty.target = "_blank";
          valueNodeProperty.title = "Open to see details";
          domConstruct.create("a", valueNodeProperty, li);
        } else {
          domConstruct.create("span", valueNodeProperty, li);
        }
      });
    }
  }

  //open crime page
  function getCrimeData(val) {
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

  function showSubMap(val, layers) {
    var node = dom.byId("subMap");
    node.innerHTML = "".concat("<div id='subMapView' style='width: 100%; height: 350px;'></div>");

    var lat = val.latitude;
    var long = val.longitude;
    var subMap = new Map({
      basemap: "topo",
      layers: layers
    });
    var subView = new MapView({
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
      var originAdd = location.originAdd;
      var destinationAdd = location.destinationAdd;
      return appSetting.google_direction.replace(/%o/, originAdd).replace(/%d/, destinationAdd);
    }
  }

  function addHyperlinks(eventName) {
    if (eventName == "code-commercial-districts") {
      var item = multiSearch.searchResult.serviceZoneList.filter(function (val) {
        return val.id == eventName;
      });
      var nodes = domQuery(".location-data-value", eventName);
      if (item.length > 0 && nodes.length > 0) {
        var evtInfo = item[0].serviceZone;
        var evtNode = nodes[0];
        domConstruct.create("a", {
          href: "tel:" + evtInfo.PHONE.trim() ,
          innerHTML: " <i class='fas fa-phone-square' title='" + evtInfo.PHONE.trim() + "'></i> "
        }, evtNode);
      }


    }
    if (eventName == "code-n-districts") {
      var item = multiSearch.searchResult.serviceZoneList.filter(function (val) {
        return val.id == eventName;
      });
      var nodes = domQuery(".location-data-value", eventName);
      if (item.length > 0 && nodes.length > 0) {
        var evtInfo = item[0].serviceZone;
        var evtNode = nodes[0];
        domConstruct.create("a", {
          href: "tel:" + evtInfo.PHONE.trim() ,
          innerHTML: " <i class='fas fa-phone-square' title='" + evtInfo.PHONE.trim() + "'></i> "
        }, evtNode);
        domConstruct.create("span", {
          innerHTML: ", "+ evtInfo.INSPECTOR2.trim()
        }, evtNode);
        domConstruct.create("a", {
          href: "tel:" + evtInfo.PHONE.trim() ,
          innerHTML: " <i class='fas fa-phone-square' title='" + evtInfo.PHONE2.trim() + "'></i> "
        }, evtNode);


      }
    }
    if (eventName == "npo") {
      //add a phone icon and email icon after police officer name
      var item = multiSearch.searchResult.serviceZoneList.filter(function (val) {
        return val.id == eventName;
      });
      var nodes = domQuery(".location-data-value", eventName);
      if (item.length > 0 && nodes.length > 0) {
        var evtInfo = item[0].serviceZone;
        var evtNode = nodes[0];
        domConstruct.create("a", {
          href: "tel:" + evtInfo.PHONE.trim() ,
          innerHTML: " <i class='fas fa-phone-square' title='" + evtInfo.PHONE.trim() + "'></i> "
        }, evtNode);

        domConstruct.create("a", {
          href: "mailto:" + evtInfo.EMAIL.trim() ,
          innerHTML: " <i class='fas fa-envelope' title='" + evtInfo.EMAIL.trim() + "'></i> "
        }, evtNode);
      }
    }

    if (eventName == "ews_link") {
      var node = dom.byId("ews_link");
      domConstruct.create("a", {
        href: appSetting.ews_link,
        target: "_blank",
        title: "goto Environmental Waste Services",
        innerHTML: "goto Environmental Waste Services<br> <img src='images/Env-Waste-Svcs.png' width='30%'/>"
      }, node);
    }
  }

  search.on("search-start", function (e) {

    domClass.add('nodeResult', 'd-none');
    domClass.add('suggestedAddresses', 'd-none');
    domClass.add('ews_link', 'd-none');
    dom.byId("street-condition-checkbox").checked = false;


    multiSearch.startNewSearch();

    //cardBodies
    // class='add-load-wrapp'
    domQuery(".add-load-wrapp").forEach(function (node) {
      //remove old data
      domQuery("ul", node).forEach(function (val) {
        val.innerHTML = "";
      });
      //add load-wrapp
      domConstruct.create("div", {
        className: "load-wrapp"
      }, node);

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
        where: "STREETLABEL LIKE '%" + AddrRoad + "%'",
        returnGeometry: false,
        outFields: ["*"]
      });
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
          //find close nums display data
          domClass.remove('suggestedAddresses', 'd-none');
          var containerNode = dom.byId("address-links");
          containerNode.innerHTML = "";
          domConstruct.create("p", {
            innerHTML: "Did you mean?"
          }, containerNode);
          var ulNode = domConstruct.create("ul", null, containerNode);
          closestNums(AddrNumber, AddList).forEach(function (val) {
            var li = domConstruct.create("li", null, ulNode);

            domConstruct.create("button", {
              className: "btn btn-link",
              innerHTML: "" + val.streetNumber + " " + val.streetLabel
            }, li);
          });

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
            where: "STREETLABEL LIKE '%" + longestStr + "%'",
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
                where: "STREETNAME LIKE '%" + longestStr + "%'",
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
                  dom.byId("address-links").innerHTML = "<p>Couldn't find entered address. </p><p>Please check the address name.</p>";
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
        tempAddrNum = "" + AddrNumber + " ";
      }

      domClass.remove('suggestedAddresses', 'd-none');
      var containerNode = dom.byId("address-links");
      containerNode.innerHTML = "";
      domConstruct.create("p", {
        innerHTML: "Did you mean?"
      }, containerNode);
      var ulNode = domConstruct.create("ul", null, containerNode);
      distinct.slice(0, 5).forEach(function (val) {
        var li = domConstruct.create("li", null, ulNode);

        domConstruct.create("button", {
          className: "btn btn-link",
          innerHTML: "" + tempAddrNum + val
        }, li);
      });

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
        window.history.pushState("new-address", e.result.name, "?address=" + e.result.name.replace(/ /g, "%20"));
      }

      //show result
      domClass.remove('nodeResult', 'd-none');

      //get information from parcel layer by Ref_ID(addressID)
      multiSearch.searchResult.addressID = e.result.feature.attributes.Ref_ID;
      multiSearch.searchResult.address = e.result.name;
      multiSearch.searchResult.addressGeometry = e.result.feature.geometry;
      multiSearch.getInforByAddressID();


      getCrimeData(multiSearch.searchResult.addressGeometry);
      showSubMap(multiSearch.searchResult.addressGeometry, [new MapImageLayer(appSetting.subMap.baseMap.map)]);

      // projecting using geometry service:
      //"project search result, make it under stateplane. ");
      var params = new ProjectParameters({
        geometries: [multiSearch.searchResult.addressGeometry],
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

  function displayLegend(json, node) {
    domConstruct.create("p", {
      innerHTML: json.title
    }, node);
    var table = domConstruct.create("table", null, node);
    var tbody = domConstruct.create("tbody", null, table);
    var str = json.renderer.map(function (item) {
      var svgValue, label;
      switch (item.type) {
        case "polyline":
          svgValue = "".concat('<line x1="0" y1="10" x2="20" y2="10" style="stroke:', item.color, ';stroke-width:', item.size, '" />');
          break;
        case "polygon":
          svgValue = "".concat('<polygon points="0,0 0,20 20,20 20,0" style="fill:', item.color, ';stroke:black;stroke-width:1" />');
          break;
        default: //point
          svgValue = "".concat('  <circle cx="', item.size, '" cy="', item.size, '" r="', item.size / 2, '" stroke="black" stroke-width="1" fill="', item.color, '" />');
      }
      svgValue = "".concat(' <svg height="20" width="20">', svgValue, '</svg>');

      var tr = domConstruct.create("tr", null, tbody);
      var td = domConstruct.create("td", {
        innerHTML: svgValue,
        width: 35
      }, tr);

      domConstruct.create("td", {
        innerHTML: item.label
      }, tr);
    });
  }

  addHyperlinks("ews_link");

  //street-condition-toggle
  dom.byId("street-condition-toggle").addEventListener("change", function () {
    var layerOn = dom.byId("street-condition-checkbox").checked;
    var divLegend = dom.byId("street-condition-legend");
    if (layerOn) {
      domClass.add(divLegend, "black-border");

      showSubMap(multiSearch.searchResult.addressGeometry, [new MapImageLayer(appSetting.subMap.streetCondition.map), new MapImageLayer(appSetting.subMap.baseMap.map)]);

      divLegend.innerHTML = "";
      displayLegend(appSetting.subMap.streetCondition.legend, divLegend);
    } else {

      domClass.remove(divLegend, "black-border");

      showSubMap(multiSearch.searchResult.addressGeometry, [new MapImageLayer(appSetting.subMap.baseMap.map)]);
      divLegend.innerHTML = "";
    }

  });



});