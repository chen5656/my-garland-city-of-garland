define([
  'dojo/dom',
  'dojo/_base/array',
  "esri/tasks/support/Query",
  "esri/tasks/QueryTask",
  "esri/geometry/SpatialReference",
  "esri/geometry/geometryEngineAsync",
  // "esri/geometry/geometryEngine",
  "dojo/_base/lang",
  "dojo/promise/all", "dojo/topic",
  "dojo/_base/declare", "dojo/dom-construct", "dojo/parser", "dojo/ready", "dijit/_WidgetBase", "dijit/_TemplatedMixin"
], function (
  dom, array,
  Query, QueryTask, SpatialReference, geometryEngineAsync,
  //geometryEngine, 
  lang, all, topic,
  declare, domConstruct, parser, ready, _WidgetBase, _TemplatedMixin) {
  return declare("GetMultiSearch", [_WidgetBase, _TemplatedMixin], {

    mapService: null, //need address map service and parcel map service

    individualCityFacility: null, //Police Station,Court ...
    cityFacilitySourceList: null,
    cityFacilityList: null,
    serviceZoneSourceList: null,
    spatialReference: null,
    inputLocation:null,

    buildRendering: function () {
      //create the DOM for this widget --- must keep
      var html =
        '<div class="GetMultiSearch"></div>';
      this.domNode = domConstruct.toDom(html);
    },
    startup: function () {
      this.inherited(arguments);
      this.spatialReference = new SpatialReference({
        wkid: 2276
      });
    },

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

      that.cityFacilityList = [];

      for (var i in this.cityFacilitySourceList) {
        runQuery(this.cityFacilitySourceList[i]);
      }

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
          that.cityFacilityList.push({
            name: queryParameter.name,
            displayID: queryParameter.displayID,
            features: results.features
          });
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

      //police station and court
      var arr = distanceToPoliceStationAndCourt(this.geometry);
      this.searchResult.nearestCityFacilityList = this.searchResult.nearestCityFacilityList.concat(arr);
      for (var i in this.cityFacilityList) {
        findNearest(this.geometry, this.cityFacilityList[i]);
      }

      function findNearest(geometry, featureSet) {
        var distanceRequestList = [];
        for (var i in featureSet.features) {
          var request = geometryEngineAsync.distance(geometry, featureSet.features[i].geometry, "miles");
          distanceRequestList.push(request);
        }
        var promises = new all(distanceRequestList);
        promises.then(lang.hitch(this, function (response) {
          var minDistance = Math.min.apply(null, response);
          var minIndex = response.indexOf(minDistance);
          var minFeature = featureSet.features[minIndex];

          var result = {
            title: featureSet.name,
            displayID: featureSet.displayID,
            nearestFeature: minFeature.attributes,
            distance: minDistance.toFixed(2)
          };
          that.searchResult.nearestCityFacilityList.push(result);
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

      function distanceToPoliceStationAndCourt(geometry) {
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
        var result = (Math.sqrt(Math.pow((pnt1.x - pnt2.x), 2) + Math.pow((pnt1.y - pnt2.y), 2)) / 5280).toFixed(2);
        return result;
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

      for (var i in this.serviceZoneSourceList) {
        // findServiceZone(this.geometry, this.serviceZoneSourceList[i]);
        var queryTask = new QueryTask({
          url: this.serviceZoneSourceList[i].url
        });
        //Assign the esriRequest execute function to a variable
        var request = queryTask.execute(query);
        //add the function variable to a array
        queryRequest.push(request);
      }

      var promises = new all(queryRequest);
      promises.then(function (response) {
        for (var i in response) {
          var featureSet = that.serviceZoneSourceList[i];
          var result;
          if (response[i].features.length > 0) {
            result = {
              title: featureSet.name,
              serviceZone: response[i].features[0].attributes,
              displayFieldName: response[i].displayFieldName,
              containerID: featureSet.containerID, //"1_2",
              displayID: featureSet.displayID, //"1",
              queryPolygonCount: response[i].features.length
            };
          } else {
            //no polygon returns.
            result = {
              title: featureSet.name,
              containerID: featureSet.containerID, //"1_2",
              displayID: featureSet.displayID, //"1",
              queryPolygonCount: response[i].features.length
            };
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

      function findServiceZone(geometry, featureSet) {


        queryTask.execute(query).then(function (e) {
          var result;
          if (e.features.length > 0) {
            result = {
              title: featureSet.name,
              serviceZone: e.features[0].attributes,
              displayFieldName: e.displayFieldName,
              containerID: featureSet.containerID, //"1_2",
              displayID: featureSet.displayID, //"1",
              queryPolygonCount: e.features.length
            };
          } else {
            //no polygon returns.
            result = {
              title: featureSet.name,
              queryPolygonCount: e.features.length
            };

          }
          that.searchResult.serviceZoneList.push(result);

        });
      }
    }

  });
});