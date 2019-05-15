function displayErrorMessage(msg) {
    alert("Time out to retrieve data. Please refresh the page.");
    console.log("alert", msg);
}

require([
    'dojo/dom',
    "dojo/dom-class",

    'esri/Map',
    'esri/views/MapView',
    "esri/layers/MapImageLayer",

    "esri/widgets/Search",
    "esri/tasks/Locator",

    "dojo/query",
    "dojo/dom-construct",

    "js/MultiSearch.js",
    "js/AddressSuggestion.js",
    "js/NewSearch.js",

    'dojo/domReady!',
], function (dom, domClass,
    Map, MapView, MapImageLayer,
    Search, Locator,
    domQuery, domConstruct,
    MultiSearch, addressSuggestion
) {
    'use strict';
    var view, subMap, subView, search;
    //init: multiSearch
    var multiSearch = new MultiSearch(multilSearch_settings);
    var addressSuggestionService = addressSuggestion();

    //init: map,submap, view, search,appSetting
    (function () {
        dom.byId("offline").innerHTML = "";
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

        subMap = new Map({
            basemap: "topo",
            layers: [new MapImageLayer(appSetting.subMap.baseMap.map)]
        });
        subView = new MapView({
            container: 'subMapView',
            map: subMap,
            zoom: 18,
            center: appSetting.mapInTop.center,
            constraints: {
                rotationEnabled: false
            }
        });
        //search widget
        var searchSources = appSetting.locator.sourceSetting;
        searchSources.locator = new Locator({
            url: appSetting.locator.locatorUrl
        });
        search = new Search({
            view: view,
            container: "search",
            includeDefaultSources: false,
            allPlaceholder: ".",
            locationEnabled: false,
            sources: [searchSources]
        });
    })();

    //update html div format.
    (function () {
        domClass.remove('main-content', 'd-none');

        //autofocus on search tool box when load.
        //   domQuery("input", "search")[0].autofocus = true;

        domQuery(".collapsed", "nodeResult").forEach(function (title) {
            title.onclick = function () {
                var card = dom.byId(this.getAttribute("aria-controls"));
                domClass.toggle(card, "show");
                var icon = this.firstElementChild;
                if (domClass.contains(icon, "esri-icon-minus")) {
                    domClass.add(icon, "esri-icon-plus");
                    domClass.remove(icon, "esri-icon-minus");
                } else {
                    domClass.add(icon, "esri-icon-minus");
                    domClass.remove(icon, "esri-icon-plus");
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

 
    search.on("search-start", function (e) {

        domClass.add('nodeResult', 'd-none');
        domClass.add('suggestedAddresses', 'd-none');
        domClass.add('ews_link', 'd-none');
        
        view.graphics.removeAll()

        //cardBodies
        //  show spinner-grow
        domQuery(".spinner-grow").forEach(function (node) {
            if (domClass.contains(node, "d-none")) {
                domClass.remove(node, 'd-none');
            }
        });

        //remove old data
        domQuery("ul", "nodeResult").forEach(function (val) {
            val.innerHTML = "";
        });
    });

    search.on("search-complete", function (e) {
        if (e.numResults == 0) {
            //no address find from input, display suggestion.
            var addressClick = function () {
                search.search(this.textContent);
            }
            domClass.remove('suggestedAddresses', 'd-none');
            addressSuggestionService.suggestion("address-links", addressClick, e.searchTerm, multiSearch.mapService, appSetting.aliasExtend);
        }
    });

    search.on("select-result", function (e) {
        view.zoom = 12;
        if (e.result) {
            //update url
            if (e.result.name) {
                window.history.pushState("new-address", e.result.name, "?address=" + e.result.name.replace(/ /g, "%20"));
            }
            //show result
            domClass.remove('nodeResult', 'd-none');

            //create new search result
            var newSearch = new locationService.NewSearch(e.result);

            //get information from parcel layer by Ref_ID(addressID)
            newSearch.getParcelInfo(multiSearch.parcelDataList);


            newSearch.projectToStatePlane(multiSearch.spatialReference).then(function (geometries) {

                    newSearch.geometryStatePlane = geometries[0];

                    newSearch.getNearestCityFacilityList(multiSearch.cityFacilityList);

                    newSearch.getLocatedServiceZoneList(multiSearch.serviceZoneSourceList);
                    console.log("newSearch", newSearch);

                })
                .catch(function (e) {
                    console.log("Error on projectToStatePlane/ getDistanceToFacilities/ getLocatedServiceZoneList:", e);
                    displayErrorMessage(e);
                });


            //--add last
            newSearch.showEWSLink();
            newSearch.getCrimeData();
            newSearch.addResultToMap(view);
            newSearch.addResultToMap(subView);
        }

    });


    //get address from previous saved url
    (function () {
        var addr = getURLQueryVariable("address")

        if (addr) {
            search.search(addr.replace(/%20/g, ' '));
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
    })();


});