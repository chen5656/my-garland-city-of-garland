define(["dojo/_base/declare",
    "dojo/promise/all",

    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "esri/tasks/GeometryService",
    "esri/tasks/support/ProjectParameters",
    "esri/geometry/geometryEngineAsync"
  ],
  function (declare, all,
    Query, QueryTask,
    GeometryService, ProjectParameters,
    geometryEngineAsync
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
        this.resultList = [];

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
            if (result.features.length > 0) {
              var attributes = result.features[0].attributes;
              thisObj.parcelId = attributes.PARCELID;
              thisObj.address = "".concat(attributes.STREETNUM, " ", attributes.STREETLABEL, ", ", attributes.CITY, ", ", attributes.STATE, ", ", attributes.ZIPCODE);
              thisObj.geometryStatePlane = result.features[0].geometry; //in stateplane
              resolve();
            } else {
              reject({
                error: "Wrong address Id"
              });
            }

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
              var newItem = iterationCopy(item);
              delete newItem.features;
              var features = cityFacilityDistanceList.filter(function (val) {
                return val.layer == item.id;
              });
              if (features.length > 0) {
                var nearestFeature = features.reduce(function (a, b) {
                  if (a.distance < b.distance) {
                    return a;
                  } else {
                    return b;
                  }
                });
                newItem.distance = nearestFeature.distance.toFixed(2);
                newItem.queryPolygonCount = 1;
                newItem.feature = nearestFeature.attributes;
              } else {
                newItem.queryPolygonCount = 0;
              }
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
      }
    
    });

  });