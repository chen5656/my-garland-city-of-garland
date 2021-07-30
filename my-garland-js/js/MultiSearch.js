define([
    "dojo/_base/declare",
    "dojo/promise/all",
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask"
], function (declare, all, Query, QueryTask) {
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
        return new Promise(function (resolve, reject) {
            promises.then(function (results) {
                that.cityFacilityList = cityFacilitySourceList.map(function (item, i) {
                    item.features = results[i].features;
                    return item;
                });
                return resolve();
            }, function (error) {
                error.name = "Error when getting information for GIS Server:";
                return reject(error);

            });
        });
    };

    var getAllCouncilHyperlink = function (mapService) {
        var query = new Query();
        var queryTask = new QueryTask({
            url: mapService
        });
        query.where = " 1=1";
        query.returnGeometry = false;
        query.outFields = ["HYPERLINIK", "DISTRICT_NUMBER"];
        return queryTask.execute(query);
    }

    return declare(null, {
        constructor: function (settings) {
            this.containerList = settings.containerList;
            this.mapService = settings.mapService;
            this.serviceZoneSourceList = settings.serviceZoneSourceList;
            this.parcelDataList = settings.parcelDataList;
        },
        getCityFacilityList: getCityFacilityList,
        getAllCouncilHyperlink: getAllCouncilHyperlink
    });
});