define(["dojo/_base/declare",
    'dojo/dom',
    "dojo/dom-class",

    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",

    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",

    "esri/geometry/geometryEngineAsync",

    "esri/Graphic",

    "dojo/promise/all",
    "dojo/query",

    "js/template.js",
  ],
  function (declare, dom, domClass,
    Query, QueryTask,
    GeometryService, ProjectParameters,
    geometryEngineAsync,
    Graphic,

    all, domQuery,

    template

  ) {
    'use strict';

    function iterationCopy(src) {
      var target = {};
      for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
          target[prop] = src[prop];
        }
      }
      return target;
    }

    
    function appendToPage(arr,address,containerList) {
      var resultHtmlArray = arr.map(function (item) {

        var newItem = prepareHtmlData(item, address);
        var resultHtml = template().generateResultHtml(newItem);
        return {
          containerID: newItem.displayControl.containerID,
          displayID: newItem.displayControl.displayID,
          resultHtml: resultHtml
        }
      });

      containerList.forEach(function (val) {
        insertHtmlToPage(val, resultHtmlArray);
      });


      function prepareHtmlData(item, searchTerm) {
        var newItem = {};
        newItem.id = item.id;
        newItem.name = item.name;
        newItem.displayControl = item.displayControl;

        if (item.queryPolygonCount == 0) {
          newItem.displayValue1 = "NULL";
          newItem.displayValue2 = "";
          return newItem;
        }

        if (item.displayControl.displayDistance) {
          newItem.distance = item.distance;
        }

        if (item.displayControl.hyperlinkType == "hardcode") {
          newItem.displayControl.hardcode = item.displayControl.hardcode;
        }

        ["displayValue1", "displayValue2", "displayValue3", "displayValue4"].forEach(function (val) {
          if (item.displayControl[val]) {
            newItem[val] = item.feature[item.displayControl[val]];
          } else {
            newItem[val] = "";
          }
        });

        if (item.displayControl.hyperlinkType == 'googleMap') {
          newItem.startAdd = searchTerm.replace(/\s|\t/g, "+");
          newItem.endAdd = item.feature.ADDRESS.replace(/\s|\t/g, "+")
        }
        return newItem;
      }


      function insertHtmlToPage(container, data) {
        var htmlArr = data.filter(function (val) {
          return val.containerID == container.id;
        })
        var ulNode = domQuery("ul", dom.byId(container.id))[0];
        var existingData = domQuery("li", ulNode).map(function (node) {

          return {
            displayID: node.attributes.index.value,
            resultHtml: node.outerHTML
          }
        });
        ulNode.innerHTML = existingData.concat(htmlArr).sort(function (a, b) {
          return a.displayID - b.displayID;
        }).map(function (val) {
          return val.resultHtml;
        }).join("");

        // isContainerFullDisplayed
        if (container.itemCount <= existingData.length + htmlArr.length) {

          domQuery(".spinner-grow", container.id).forEach(function (node) {
            if (domClass.contains(node, "d-none") == false) {
              domClass.add(node, 'd-none');
            }
          });;
        }
        //show ews link
        if (dom.byId("ews-trash") || dom.byId("ews-recycling")) {
          var node = dom.byId("ews_link");
          if (domClass.contains(node, "d-none") == true) {
            domClass.remove(node, 'd-none');
          }
        }
      }
    }


    // projecting using geometry service:
    //"project search result, make it under stateplane. ");

    return declare("locationService.NewSearch", null, { //"Anonymous" Class,only available within its given scope. 
      constructor: function (searchAddress, containerList) {
        this.address = searchAddress.name;
        this.addressID = searchAddress.feature.attributes.Ref_ID;
        this.addressGeometry = searchAddress.feature.geometry;
        //this.nearestCityFacilityList = [];
        //this.serviceZoneList = [];
        //this.parcelInfo = null;
        this.containerList = containerList;
      },

      getParcelInfo: function (AddressMapService, ParcelMapService, parcelDataList) {
        var that = this;
        var query = new Query();
        var queryTask = new QueryTask({
          url: AddressMapService
        });
        query.where = "ADDRESSID =" + this.addressID;
        //query.outSpatialReference = spatialReference2276;
        query.returnGeometry = false;
        query.outFields = ["PARCELID"];
        queryTask.execute(query).then(function (results) {
          // Results.graphics contains the graphics returned from query
          if (results.features[0].attributes.PARCELID) {
            var parcelID = results.features[0].attributes.PARCELID;
            var query = new Query();
            var queryTask = new QueryTask({
              url: ParcelMapService
            });
            query.where = "PARCELID  =" + parcelID;
            //query.outSpatialReference = spatialReference2276;
            query.returnGeometry = false;
            query.outFields = ["*"];
            return queryTask.execute(query);
          }
        }).then(function (results) {
          var result = results.features[0].attributes;
          that.parcelInfo = parcelDataList.map(function (item) {
            var newItem = iterationCopy(item);
            newItem.queryPolygonCount = 1;
            newItem.feature = {};
            ["displayValue1", "displayValue2", "displayValue3", "displayValue4"].forEach(function (val) {
              if (item.displayControl[val]) {
                newItem.feature[item.displayControl[val]] = result[item.displayControl[val]];
              } else {
                newItem.displayControl[val] = "";
              }
            });
            return newItem;
          })
          // console.log("parcelInfo", that.parcelInfo);
          appendToPage(that.parcelInfo,that.address,that.containerList);
        });
      },

      projectToStatePlane: function (spatialReference, geometryService) {
        var geometryService = new GeometryService(geometryService);
        var params = new ProjectParameters({
          geometries: [this.addressGeometry],
          outSpatialReference: spatialReference
        });
        return geometryService.project(params);
      },

      getNearestCityFacilityList: function (cityFacilityList) {
        var that = this;
        var allCityFacilities = getFeaturesOfCityFacilityList(cityFacilityList);
        getDistances(allCityFacilities).then(function (result) {
          var cityFacilityDistanceList = allCityFacilities.map(function (val, i) {
            val.distance = result[i];
            return val;
          });
          that.nearestCityFacilityList = cityFacilityList.map(function (item) {
            var nearestFeature = cityFacilityDistanceList.filter(function (val) {
              return val.layer == item.id;
            }).reduce(function (a, b) {
              if (a.distance < b.distance) {
                return a;
              } else {
                return b;
              }
            });
            var newItem = iterationCopy(item);
            delete newItem.features;
            newItem.distance = nearestFeature.distance.toFixed(2);
            newItem.queryPolygonCount = 1;
            newItem.feature = nearestFeature.attributes;
            return newItem;
          });
          //  console.log("nearestCityFacilityList", that.nearestCityFacilityList);
          appendToPage(that.nearestCityFacilityList,that.address,that.containerList);

        });

        function getDistances(features) {
          var location = that.geometryStatePlane;
          var distanceRequestList = features.map(function (item) {
            return geometryEngineAsync.distance(location, item.geometry, "miles")
          });
          var promises = new all(distanceRequestList);
          return promises;
        }

        function getFeaturesOfCityFacilityList(cityFacilityList) {
          var allPnts = cityFacilityList.map(function (val) {
            return val.features.map(function (item) {
              item.layer = val.id;
              return item;
            });
          });

          return allPnts.reduce(function (a, b) {
            return a.concat(b);
          });
        }
      },

      getLocatedServiceZoneList: function (serviceZoneList) {
        var that = this;
        var query = new Query({
          returnGeometry: true,
          outFields: ["*"],
          spatialRelationship: "intersects"
        });
        query.geometry = this.addressGeometry;
        var queryRequest = serviceZoneList.map(function (item) {
          var queryTask = new QueryTask({
            url: item.url
          });
          return queryTask.execute(query);
        });
        var promises = new all(queryRequest);
        promises.then(function (results) {
          that.serviceZoneList = serviceZoneList.map(function (item, i) {
            var newItem = iterationCopy(item);
            newItem.queryPolygonCount = results[i].features.length;
            if (newItem.queryPolygonCount > 0) {
              newItem.feature = results[i].features[0].attributes;
            }
            return newItem;
          });
          //    console.log("serviceZoneList", that.serviceZoneList);
          appendToPage(that.serviceZoneList,that.address,that.containerList);
        });
      },

      
      getCrimeData: function (generateCrimeMapIframe) {
        //in chrome, need to remove iframe, add it again to refresh the iframe.

        var today = new Date();
        today.setHours(0, 0, 0);
        var severDaysAgo = new Date(today.getTime() - 1 * 1000 - 6 * 24 * 60 * 60 * 1000); //7 days before yesterday 23:59:59
        var TwoWeeksAgo = new Date(today.getTime() - (7 + 6) * 24 * 60 * 60 * 1000); //14 days ago 00:00:00
        var start_date = "".concat(TwoWeeksAgo.getFullYear(), "-", TwoWeeksAgo.getMonth() + 1, "-", TwoWeeksAgo.getDate());
        var end_date = "".concat(severDaysAgo.getFullYear(), "-", severDaysAgo.getMonth() + 1, "-", severDaysAgo.getDate());

        var urlProperty = {
          lat: this.addressGeometry.latitude,
          long: this.addressGeometry.longitude,
          start_date: start_date,
          end_date: end_date
        }
        var node = dom.byId("crimeData");
        node.innerHTML = "";
        node.innerHTML = template().generateCrimeMapIframe(urlProperty);
        var url = node.children[0].src;
        dom.byId("crime-map-title").innerHTML = "".concat("Crime ( <time datetime='", start_date, " 00:00'>", start_date.slice(5), "</time> to <time datetime='", end_date, " 23:59'>", end_date.slice(5), "</time> )");
        dom.byId("open-crime-map").setAttribute("href", url);
      },

      showSubMap: function (subView) {
        var pointGraphic = new Graphic({
          geometry: this.addressGeometry,
          symbol: {
            type: "simple-marker",
            color: "#dc2533"
          }
        });
        subView.graphics.removeAll()
        subView.graphics.add(pointGraphic);
        subView.center = [this.addressGeometry.longitude, this.addressGeometry.latitude];
        subView.zoom = 18;
      },
    });

  });