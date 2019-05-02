define([
    "dojo/_base/declare",
    "dojo/promise/all",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",
    "esri/geometry/SpatialReference"
], function (declare, all, Query, QueryTask, SpatialReference) {
    var getCityFacilityList = function (cityFacilitySourceList) {
        var that = this;
        var queryList = cityFacilitySourceList.map(function (item) {
            return new QueryTask({
                url: item.url
            }).execute(new Query({
                where: item.where,
                returnGeometry: true,
                outFields: ["*"]
            }));
        })
        var promises = new all(queryList);
        promises.then(function (results) {
            that.cityFacilityList = cityFacilitySourceList.map(function (item, i) {
                item.features = results[i].features;
                return item;
            });
        });
    }
    return declare(null, {
        constructor: function (settings) {
            this.containerList = settings.containerList;
            this.mapService = settings.mapService;
            this.serviceZoneSourceList = settings.serviceZoneSourceList;
            this.parcelDataList = settings.parcelDataList;
            this.spatialReference = new SpatialReference({
                wkid: 2276
            });
            this.getCityFacilityList(settings.cityFacilitySourceList);
        },
        getCityFacilityList:getCityFacilityList
    });
});