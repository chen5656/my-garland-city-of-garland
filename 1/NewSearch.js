define(["dojo/_base/declare",
    'dojo/dom',
    "dojo/promise/all",
    "dojo/dom-class",

    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/geometry/geometryEngineAsync",
    "esri/Graphic"
  ],
  function (declare, dom, all, domClass,
    Query, QueryTask,
    GeometryService, ProjectParameters,
    geometryEngineAsync,
    Graphic

  ) {

    function iterationCopy(src) {
      var target = {};
      for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
          target[prop] = src[prop];
        }
      }
      return target;
    }

    var mapService_address = multilSearch_settings.mapService.address;
    var mapService_parcle = multilSearch_settings.mapService.parcel;
    var mapService_geometryService = multilSearch_settings.mapService.geometry;

    // projecting using geometry service:
    //"project search result, make it under stateplane. ");

    return declare("locationService.NewSearch", null, { //"Anonymous" Class,only available within its given scope. 
      constructor: function (addressId) {
        this.addressId = addressId;
        //this.address = searchAddress.address;
        //this.addressGeometry = searchAddress.addressGeometry;
        //this.nearestCityFacilityList = [];
        //this.serviceZoneList = [];
        //this.parcelInfo = null;

      },

      getAddressInfo: function () {
        var thisObj = this;
        var query = new Query();
        var queryTask = new QueryTask({
          url: mapService_address
        });
        query.where = "ADDRESSID =" + this.addressId;
        //query.outSpatialReference = spatialReference2276;
        query.returnGeometry = true;
        query.outFields = ["*"];

        return new Promise(function (resolve, reject) {
          queryTask.execute(query).then(function (result) {

            var attributes = result.features[0].attributes;
            thisObj.parcelId = attributes.PARCELID;
            thisObj.address = "".concat(attributes.STREETNUM, " ", attributes.STREETLABEL, ", ", attributes.CITY, ", ", attributes.STATE, ", ", attributes.ZIPCODE);
            thisObj.geometryStatePlane = result.features[0].geometry; //in stateplane
            resolve(result.features[0].geometry);
          });
        });
      },

      getParcelInfo: function (parcelDataList) {
        var that = this;
        var query = new Query();
        var queryTask = new QueryTask({
          url: mapService_parcle
        });
        query.where = "PARCELID  =" + this.parcelId;
        //query.outSpatialReference = spatialReference2276;
        query.returnGeometry = false;
        query.outFields = ["*"];
        return new Promise(function (resolve, reject) {
          queryTask.execute(query).then(function (results) {
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
            resolve(that.parcelInfo);
          });
        });
      },

      projectToSpatialReference: function (geometries, spatialReference) {
        var geometryService = new GeometryService(mapService_geometryService);
        var params = new ProjectParameters({
          geometries: geometries,
          outSpatialReference: spatialReference
        });
        return geometryService.project(params);
      },

      getNearestCityFacilityList: function (cityFacilityList) {
        var that = this;
        var allCityFacilities = getFeaturesOfCityFacilityList(cityFacilityList);
        return new Promise(function (resolve, reject) {
          getDistances(allCityFacilities, that.geometryStatePlane).then(function (result) {
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
            resolve(that.nearestCityFacilityList);
          });
        });

        function getDistances(features, geometryStatePlane) {
          var distanceRequestList = features.map(function (item) {
            return geometryEngineAsync.distance(geometryStatePlane, item.geometry, "miles")
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
          returnGeometry: false,
          outFields: ["*"],
          spatialRelationship: "intersects"
        });
        query.geometry = this.geometry;
        var queryRequest = serviceZoneList.map(function (item) {
          var queryTask = new QueryTask({
            url: item.url
          });
          return queryTask.execute(query);
        });
        var promises = new all(queryRequest);

        return new Promise(function (resolve, reject) {
          promises.then(function (results) {
            that.serviceZoneList = serviceZoneList.map(function (item, i) {
              var newItem = iterationCopy(item);
              newItem.queryPolygonCount = results[i].features.length;
              if (newItem.queryPolygonCount > 0) {
                newItem.feature = results[i].features[0].attributes;
              }
              return newItem;
            });
            resolve(that.serviceZoneList);

          });
        });
      },


      getCrimeData: function () {
        //in chrome, need to remove iframe, add it again to refresh the iframe.

        var today = new Date();
        today.setHours(0, 0, 0);
        var severDaysAgo = new Date(today.getTime() - 1 * 1000 - 6 * 24 * 60 * 60 * 1000); //7 days before yesterday 23:59:59
        var TwoWeeksAgo = new Date(today.getTime() - (7 + 6) * 24 * 60 * 60 * 1000); //14 days ago 00:00:00
        var start_date = "".concat(TwoWeeksAgo.getFullYear(), "-", TwoWeeksAgo.getMonth() + 1, "-", TwoWeeksAgo.getDate());
        var end_date = "".concat(severDaysAgo.getFullYear(), "-", severDaysAgo.getMonth() + 1, "-", severDaysAgo.getDate());

        var urlProperty = {
          lat: this.geometry.latitude,
          long: this.geometry.longitude,
          start_date: start_date,
          end_date: end_date
        }
        var node = dom.byId("crimeData");
        node.innerHTML = "";
        node.innerHTML = template.generateCrimeMapIframe(urlProperty);
      },

      addResultToMap: function (subView) {

        var pointGraphic = new Graphic({
          geometry: this.geometry,
          symbol: {
            type: "simple-marker",
            color: "#dc2533"
          },
          popupTemplate: { // autocasts as new PopupTemplate()
            title: "Target",
            content: this.address
          }
        });
        subView.graphics.removeAll()
        subView.graphics.add(pointGraphic);
        subView.center = [this.geometry.longitude, this.geometry.latitude];
      },

      showEWSLink: function () {
        //show ews link
        var node = document.getElementById("ews_link");
        if (domClass.contains(node, "d-none") == true) {
          domClass.remove(node, 'd-none');
        }

      }
    });

  });