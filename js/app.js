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

    "js/template.js",
    "js/MultiSearch.js",
    "js/AddressSuggestion.js",
    "js/NewSearch.js",

    'dojo/domReady!',
], function (dom, domClass,
    Map, MapView, MapImageLayer,
    Search, Locator,
    domQuery, domConstruct,
   template,MultiSearch,addressSuggestion
) {
    'use strict';
    var view, subMap, subView, search;
    //init: multiSearch
    var multiSearch = new MultiSearch(multilSearch_settings);
    var addressSuggestionService = addressSuggestion();
   var template = template();

    //init: map,submap, view, search,appSetting
    (function (settings) {
        var mapImageLayerList = new MapImageLayer(settings.mapInTop.mapImageLayer);
        var map = new Map({
            basemap: settings.mapInTop.basemap,
            layers: [mapImageLayerList]
        });
        view = new MapView({
            container: 'viewDiv',
            map: map,
            zoom: settings.mapInTop.zoom,
            center: settings.mapInTop.center
        });

        subMap = new Map({
            basemap: "topo",
            layers: [new MapImageLayer(settings.subMap.baseMap.map)]
        });
        subView = new MapView({
            container: 'subMapView',
            map: subMap,
            zoom: 12,
            center: settings.mapInTop.center,
            constraints: {
                rotationEnabled: false
            }
        });
        //search widget
        var searchSources = settings.locator.sourceSetting;
        searchSources.locator = new Locator({
            url: settings.locator.locatorUrl
        });
        search = new Search({
            view: view,
            container: "search",
            allPlaceholder: ".",
            locationEnabled: false,
            sources: [searchSources]
        });
    })(appSetting);

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

    //generate street pci legend , based on config-data js. 
    (function (json) {
        var node = dom.byId("street-condition-legend");
        domConstruct.create("p", {
            innerHTML: json.title
        }, node);
        var table = domConstruct.create("table", null, node);
        var tbody = domConstruct.create("tbody", null, table);
        json.renderer.map(function (item) {
            var svgValue;
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
            domConstruct.create("td", {
                innerHTML: svgValue,
                width: 35
            }, tr);

            domConstruct.create("td", {
                innerHTML: item.label
            }, tr);
        });
    })(appSetting.subMap.streetCondition.legend);


    search.on("search-start", function (e) {

        domClass.add('nodeResult', 'd-none');
        domClass.add('suggestedAddresses', 'd-none');
        domClass.add('ews_link', 'd-none');
        dom.byId("street-condition-checkbox").checked = false;
        domClass.add('street-condition-legend', 'd-none');

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
            var newSearch = new locationService.NewSearch(e.result, template, multiSearch.containerList);

            //get information from parcel layer by Ref_ID(addressID)
            newSearch.getParcelInfo(multiSearch.mapService.address, multiSearch.mapService.parcel, multiSearch.parcelDataList);

            //--add last
            newSearch.getCrimeData(template.generateCrimeMapIframe);
            newSearch.showSubMap(subView);

            newSearch.projectToStatePlane(multiSearch.spatialReference, multiSearch.mapService.geometry).then(function (geometries) {

                    newSearch.geometryStatePlane = geometries[0];

                    newSearch.getNearestCityFacilityList(multiSearch.cityFacilityList);

                    newSearch.getLocatedServiceZoneList(multiSearch.serviceZoneSourceList);
                    console.log("newSearch", newSearch);

                })
                .catch(function (e) {
                    console.log("Error on projectToStatePlane/ getDistanceToFacilities/ getLocatedServiceZoneList:", e);
                    displayErrorMessage(e);
                });
        }

    });

    //street-condition-toggle
    dom.byId("street-condition-toggle").addEventListener("change", function () {
        var layerOn = dom.byId("street-condition-checkbox").checked;
        var node = dom.byId("street-condition-legend");
        if (layerOn) {

            //  showSubMap(multiSearch.searchResult.addressGeometry, [new MapImageLayer(appSetting.subMap.streetCondition.map), new MapImageLayer(appSetting.subMap.baseMap.map)]);
            if (domClass.contains(node, "d-none")) {
                domClass.remove(node, 'd-none');
            }
            var layer = new MapImageLayer(appSetting.subMap.streetCondition.map);
            subMap.layers.add(layer);
        } else {
            //  showSubMap(multiSearch.searchResult.addressGeometry, [new MapImageLayer(appSetting.subMap.baseMap.map)]);
            if (domClass.contains(node, "d-none") == false) {
                domClass.add(node, 'd-none');
            }
            var layer = subMap.layers.items.filter(function (layer) {
                return layer.url == appSetting.subMap.streetCondition.map.url;
            })[0];
            subMap.remove(layer);
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