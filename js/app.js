var template = new myGarland.templates();
var saveToIndexDB = new myGarland.clientStorage();

//saveToIndexDB.getInfo(that.address);
//test getData from IndexDB

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

    //init: map,submap, view
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

    })();

    //init: multiSearch,search widget
    var multiSearch = new MultiSearch(multilSearch_settings);
    multiSearch.getCityFacilityList(multilSearch_settings.cityFacilitySourceList).then(function () {
        // setup search or get address from previous saved url,  when multiSearch ready.         
        var searchSource = appSetting.locator.sourceSetting;
        searchSource.locator = new Locator({
            url: appSetting.locator.locatorUrl
        });
        search = new Search({
            view: view,
            container: "search",
            includeDefaultSources: false,
            allPlaceholder: ".",
            locationEnabled: false,
            sources: [searchSource]
        });

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
                addressSuggestionService.suggestion("address-links", addressClick, e.searchTerm, multiSearch.mapService);
            }
        });

        search.on("select-result", function (e) {
            view.zoom = 12;

            if (e.result) {
                saveToIndexDB.insertInfo("term-" + this.searchTerm.trim(), {
                    "addressId": e.result.feature.attributes.Ref_ID
                });
                searchFinish(e.result.feature.attributes.Ref_ID);
            }
        });

        //get address from previous saved url
        (function () {
            var addrId = "".concat(getURLQueryVariable("addressId"));
            if (!isNaN(addrId) && addrId > 0) {
                searchFinish(addrId);
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
                return ("");
            }
        })();
    });
    var addressSuggestionService = addressSuggestion();

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

    //street-condition-toggle
    dom.byId("street-condition-toggle").addEventListener("change", function () {
        var layerOn = dom.byId("street-condition-checkbox").checked;
        var node = dom.byId("street-condition-legend");
        if (layerOn) {

            if (domClass.contains(node, "d-none")) {
                domClass.remove(node, 'd-none');
            }
            var layer = new MapImageLayer(appSetting.subMap.streetCondition.map);
            subMap.layers.add(layer);
        } else {
            if (domClass.contains(node, "d-none") == false) {
                domClass.add(node, 'd-none');
            }
            var layer = subMap.layers.items.filter(function (layer) {
                return layer.url == appSetting.subMap.streetCondition.map.url;
            })[0];
            subMap.remove(layer);
        }

    });

    function searchFinish(addressId) {
        domClass.remove('nodeResult', 'd-none');
        window.history.pushState("new-address-id", addressId, "?addressId=" + addressId); //update url

        //create new search result
        var newSearch = new locationService.NewSearch(addressId);
        newSearch.getAddressInfo().then(function () {
           
            if(search.searchTerm.trim().length<2){
                search.searchTerm = newSearch.address;
            }                      

            newSearch.getNearestCityFacilityList(multiSearch.cityFacilityList); //with newSearch.geometryStatePlane 
            

            newSearch.projectToSpatialReference([newSearch.geometryStatePlane], view.spatialReference).then(function (geometries) {
                    newSearch.geometry = geometries[0];

                    newSearch.addResultToMap(view);
                    newSearch.addResultToMap(subView);

                    newSearch.getParcelInfo(multiSearch.parcelDataList).then(function () {
                        saveToIndexDB.insertInfo("adressId-" + newSearch.addressId, {
                            address: newSearch.address,
                            geometry: {
                                latitude: newSearch.geometry.latitude,
                                longitude: newSearch.geometry.longitude
                            },
                            geometryStatePlane: {
                                x: newSearch.geometryStatePlane.x,
                                y: newSearch.geometryStatePlane.y
                            },
                            parcelInfo: newSearch.parcelInfo
                        });
                    });

                    newSearch.getLocatedServiceZoneList(multiSearch.serviceZoneSourceList);
                    console.log("newSearch", newSearch);

                    newSearch.getCrimeData();

                })
                .catch(function (e) {
                    console.log("Error on projectToStatePlane/ getDistanceToFacilities/ getLocatedServiceZoneList:", e);
                    displayErrorMessage(e);
                });


        });


        //--add last
        newSearch.showEWSLink();

    }
});