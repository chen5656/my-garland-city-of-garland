function getUnique(array) {
    //get unique value
    var unique = {};
    var distinct = [];
    for (var i in array) {
        if (typeof (unique[array[i]]) == "undefined") {
            distinct.push(array[i]);
        }
        unique[array[i]] = 0;
    }
    return distinct;
}

function daysFromNow(milliseconds) {
    return ((Date.now() - milliseconds) / 864e5).toFixed(3);
}

var template = new myGarland.templates();
var saveToIndexDB = new myGarland.clientStorage();

var view, subMap, subView, search;

require([
    'dojo/dom',
    "dojo/dom-class",

    'esri/Map',
    'esri/views/MapView',
    "esri/layers/MapImageLayer",

    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/Graphic",

    "dojo/query",
    "dojo/dom-construct",

    "js/MultiSearch.js",
    "js/AddressSuggestion.js",
    "js/NewSearch.js",

    'dojo/domReady!'
], function (dom, domClass,
    Map, MapView, MapImageLayer,
    Search, Locator, Graphic,
    domQuery, domConstruct,
    MultiSearch, addressSuggestion
) {
    'use strict';

    function searchStart() {
        domClass.add('nodeResult', 'd-none');
        domClass.add('suggestedAddresses', 'd-none');
        domClass.add('ews_link', 'd-none');
        dom.byId("street-condition-checkbox").checked = false;

        //cardBodies        //  show spinner-grow
        domQuery(".spinner-grow").forEach(function (node) {
            if (domClass.contains(node, "d-none")) {
                domClass.remove(node, 'd-none');
            }
        });

        //remove old data
        domQuery("ul", "nodeResult").forEach(function (val) {
            val.innerHTML = "";
        });

        [view, subView].forEach(function (view1) {
            if (view1) {
                view1.graphics.removeAll();
            }
        })
    }

    function displayAndSaveSearchData(data, newSearch) {
        template.appendToPage(data, newSearch.address);
        newSearch.resultList = newSearch.resultList.concat(data);
        var searchResult = {
            address: newSearch.address,
            resultList: newSearch.resultList
        }
        if (newSearch.geometry) {
            searchResult.geometry = {
                latitude: newSearch.geometry.latitude,
                longitude: newSearch.geometry.longitude
            }
        };
        if (newSearch.parcelInfo) {
            searchResult.parcelInfo = "true";
        }
        if (newSearch.serviceZoneList) {
            searchResult.serviceZoneList = "true";
        }
        if (newSearch.nearestCityFacilityList) {
            searchResult.nearestCityFacilityList = "true";
        }
        searchResult.createdOn = Date.now();
        saveToIndexDB.insertInfo("" + newSearch.addressId, searchResult)
    }

    function pushToHistory(addressId) {
        if (!(window.history.state && window.history.state.value == "my-garland-address-search" && window.history.state.id == addressId)) {
            window.history.pushState({
                "value": "my-garland-address-search",
                "id": addressId
            }, "", "?addressId=" + addressId);
        }
    }


    function addToMap(geometry) {

        addPnt(geometry, view);
        addPnt(geometry, subView);
        displayCrimeMap(geometry);

        //--add last EWS Link
        var node = document.getElementById("ews_link");
        if (domClass.contains(node, "d-none") == true) {
            domClass.remove(node, 'd-none');
        }

        function addPnt(geometry, mapView) {
            var pnt = new Graphic({
                geometry: geometry,
                symbol: {
                    type: "simple-marker",
                    color: "#dc2533"
                }
            });
            mapView.graphics.removeAll();
            mapView.graphics.add(pnt);
            mapView.center = [geometry.longitude, geometry.latitude];

        }

        function displayCrimeMap(geometry) {
            //in chrome, need to remove iframe, add it again to refresh the iframe.
            var today = new Date();
            today.setHours(0, 0, 0);
            var severDaysAgo = new Date(today.getTime() - 1 * 1000 - 6 * 24 * 60 * 60 * 1000); //7 days before yesterday 23:59:59
            var TwoWeeksAgo = new Date(today.getTime() - (7 + 6) * 24 * 60 * 60 * 1000); //14 days ago 00:00:00
            var start_date = "".concat(TwoWeeksAgo.getFullYear(), "-", TwoWeeksAgo.getMonth() + 1, "-", TwoWeeksAgo.getDate());
            var end_date = "".concat(severDaysAgo.getFullYear(), "-", severDaysAgo.getMonth() + 1, "-", severDaysAgo.getDate());

            var urlProperty = {
                lat: geometry.latitude,
                long: geometry.longitude,
                start_date: start_date,
                end_date: end_date
            }
            var node = dom.byId("crimeData");
            node.innerHTML = "";
            node.innerHTML = template.generateCrimeMapIframe(urlProperty);
        }
    }

    function searchFinish(addressId, insertToHistory) {

        //get data from local storage first.
        saveToIndexDB.getInfo("" + addressId).then(function (oldSearch) {
            if (oldSearch && oldSearch.nearestCityFacilityList && oldSearch.serviceZoneList && oldSearch.parcelInfo && (daysFromNow(oldSearch.createdOn) < 30 && oldSearch.createdOn > 1558542002479)) {
                //only read data keeped in 0 days.      
                console.log("display oldSearch - find search result in indexDB in 30 days");
                document.title = "My Garland - ".concat(oldSearch.address);
                if (insertToHistory) {
                    pushToHistory(addressId);
                }
                //display data
                domClass.remove('nodeResult', 'd-none');
                template.appendToPage(oldSearch.resultList, oldSearch.address);
                oldSearch.geometry = {
                    type: "point",
                    latitude: oldSearch.geometry.latitude,
                    longitude: oldSearch.geometry.longitude
                }
                addToMap(oldSearch.geometry);
                if (!search.searchTerm) {
                    search.searchTerm = oldSearch.address;
                }
            } else {
                //create new search result
                createNewSearch(addressId, insertToHistory);
            }

        }, function (e) {
            console.log("warning:", e.error);
            createNewSearch(addressId, insertToHistory);
        });
    }

    function createNewSearch(addressId, insertToHistory) {
        var newSearch = new locationService.NewSearch(addressId);
        console.log("create newSearch");
        newSearch.getAddressInfo().then(function () {
                domClass.remove('nodeResult', 'd-none');
                document.title = "My Garland - ".concat(newSearch.address);
                if (insertToHistory) {
                    pushToHistory(addressId);
                }
                if (search.searchTerm.trim().length < 2) {
                    search.searchTerm = newSearch.address;
                }
                if (multiSearch.cityFacilityList) {
                    newSearch.getNearestCityFacilityList(multiSearch.cityFacilityList).then(function (data) { //with newSearch.geometryStatePlane 
                        displayAndSaveSearchData(data, newSearch);
                    });
                }
                newSearch.projectToSpatialReference([newSearch.geometryStatePlane], view.spatialReference).then(function (geometries) {
                        newSearch.geometry = geometries[0];
                        addToMap(newSearch.geometry);
                        if (multiSearch.parcelDataList) {
                            newSearch.getParcelInfo(multiSearch.parcelDataList).then(function (data) {
                                //hardcord to update council district hyperlink
                                newSearch.getFieldValue("https://maps.garlandtx.gov/arcgis/rest/services/WebApps/MyGarland/MapServer/35", "DISTRICT_NUMBER", data[0].feature.COUNCIL_ID, "HYPERLINIK").then(function (result) {
                                    //    "https://www.garlandtx.gov/758/City-Council", result);
                                    data[0].displayControl.hardcode = data[0].displayControl.hardcode.replace("https://www.garlandtx.gov/758/City-Council", result);
                                    displayAndSaveSearchData(data, newSearch);
                                }, function (error) {
                                    console.log("Warning: ", error);
                                    displayAndSaveSearchData(data, newSearch);
                                });
                            });
                        }
                        if (multiSearch.serviceZoneSourceList) {
                            newSearch.getLocatedServiceZoneList(multiSearch.serviceZoneSourceList).then(function (data) {
                                displayAndSaveSearchData(data, newSearch);
                            });
                        }
                        console.log("newSearch", newSearch);
                    })
                    .catch(function (e) {
                        console.log("Error on projectToStatePlane/ getDistanceToFacilities/ getLocatedServiceZoneList:", e);
                    });
            },
            function (error) {
                console.log("getAddressInfo", error);
            }
        );
    }

    //init: map,submap, view
    (function () {
        //dom.byId("offline").innerHTML = "";
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
            searchStart();
        });
        // setup search or get address from previous saved url,  when multiSearch ready.         
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
                if (!multiSearch.cityFacilityList || !multiSearch.serviceZoneSourceList || !multiSearch.parcelDataList) {
                    console.log("multiSearch.cityFacilityList, multiSearch.serviceZoneSourceList, multiSearch.parcelDataList", !!multiSearch.cityFacilityList, !!multiSearch.serviceZoneSourceList, !!multiSearch.parcelDataList);
                    alert("Loading data...")
                }
                searchFinish(e.result.feature.attributes.Ref_ID, true);
            }
        });
    })();

    //init: multiSearch,search widget
    var addressSuggestionService = addressSuggestion();
    var multiSearch = new MultiSearch(multilSearch_settings);
    multiSearch.getCityFacilityList(multilSearch_settings.cityFacilitySourceList).then(function () {
        //get address from previous saved url
        (function () {
            var addrId = "".concat(getURLQueryVariable("addressid"));
            if (!isNaN(addrId) && addrId > 0) {
                searchFinish(addrId, true);
            }

            function getURLQueryVariable(variable) {
                var query = window.location.search.substring(1);
                var vars = query.split("&");
                for (var i = 0; i < vars.length; i++) {
                    var pair = vars[i].split("=");
                    if (pair[0].toLowerCase() == variable) {
                        return pair[1];
                    }
                }
                return ("");
            }
        })();
    }, function (error) {
        console.log(error);
    });

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
            var layers = subMap.layers.items.filter(function (layer) {

                if (cleanUrl(layer.url) == cleanUrl(appSetting.subMap.streetCondition.map.url)) {

                    for (var sublayer of layer.sublayers.items) {
                        if (sublayer.id == appSetting.subMap.streetCondition.map.sublayers[0].id) {
                            return true;
                        }
                    }
                }
            });
            subMap.removeMany(layers);

            function cleanUrl(url) {
                return url.toLowerCase().split("/rest/")[1].split("/mapserver")[0];

            }
        }

    });

    window.addEventListener("popstate", function (e) {
        if (e.state.value == "my-garland-address-search") {
            searchStart();
            search.searchTerm = "";
            searchFinish(e.state.id, false);
        }
    });

    //remove 30 days old data from indexDB.
    (function (days) {
        saveToIndexDB.getAll().then(function (array) {
            array.forEach(function (item) {
                if (!item.value.createdOn && daysFromNow(item.value.createdOn) >= days) {
                    saveToIndexDB.removeItem(item.key);
                }
            })
        });
    })(30)

});