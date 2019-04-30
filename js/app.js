function iterationCopy(src) {
    var target = {};
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            target[prop] = src[prop];
        }
    }
    return target;
}

function displayErrorMessage(msg) {
    alert("Time out to retrieve data.");
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
    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",

    "dojo/query",
    "dojo/dom-construct",

    "js/template.js",
    "js/MultiSearch.js",
    "js/NewSearch.js",

    'dojo/domReady!',
], function (dom, domClass,
    Map, MapView, MapImageLayer,
    Search, Locator, Query, QueryTask,
    domQuery, domConstruct,
    Template
) {
    'use strict';
    var view, subMap, subView, search;
    //init: multiSearch
    var multiSearch = new locationService.MultiSearch(multilSearch_settings);

    var template = Template();

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
            //no result found. Suggestion the nearest result
            var AddrRoad, AddrNumber;
            var str = e.searchTerm.split(",")[0].trim().toUpperCase();
            var subStr = str.split(" ");
            if (subStr.length > 1) {
                var str1 = subStr[0];
                if (str1 != parseInt(str1, 10)) {
                    //not a number, try to use it as street name
                    AddrRoad = str;
                    AddrNumber = 0;
                } else {
                    subStr.shift();
                    AddrRoad = subStr.join(" ");
                    AddrNumber = str1;
                }
            } else {
                // try to use it as street name
                AddrRoad = str;
                AddrNumber = 0;
            }

            AddrRoad = findArrayInAliasExtend(AddrRoad);

            var query = new Query({
                where: "STREETLABEL LIKE '%" + AddrRoad + "%'",
                returnGeometry: false,
                outFields: ["*"]
            });
            var queryTask = new QueryTask({
                url: multiSearch.mapService.address
            });
            queryTask.execute(query).then(function (results) {
                var AddList = [];
                if (results.features.length > 0) {
                    //street entered correct
                    console.log("correct street label, wrong address number");
                    AddList = results.features.map(function (val) {
                        return {
                            streetNumber: val.attributes.STREETNUM,
                            streetLabel: val.attributes.STREETLABEL
                        };
                    }).sort(function (a, b) {
                        return a.streetNumber - b.streetNumber;
                    });
                    //find close nums display data
                    domClass.remove('suggestedAddresses', 'd-none');
                    var containerNode = dom.byId("address-links");
                    containerNode.innerHTML = "";
                    domConstruct.create("p", {
                        innerHTML: "Did you mean?"
                    }, containerNode);
                    var ulNode = domConstruct.create("ul", null, containerNode);
                    closestNums(AddrNumber, AddList).forEach(function (val) {
                        var li = domConstruct.create("li", null, ulNode);

                        domConstruct.create("button", {
                            className: "btn btn-link",
                            innerHTML: "" + val.streetNumber + " " + val.streetLabel
                        }, li);
                    });

                    domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
                        btn.onclick = function () {
                            search.search(this.textContent);
                        };
                    });
                } else {
                    //street wrong

                    var str = AddrRoad.split(" ");

                    var longestStr = str[0];
                    for (var i = 1; i < str.length; i++) {
                        if (longestStr.length < str[i].length) {
                            longestStr = str[i];
                        }
                    }
                    var query = new Query({
                        where: "STREETLABEL LIKE '%" + longestStr + "%'",
                        returnGeometry: false,
                        outFields: ["*"]
                    });
                    console.log(query.where);
                    var queryTask = new QueryTask({
                        url: multiSearch.mapService.road
                    });
                    queryTask.execute(query).then(function (results) {
                        if (results.features.length > 0) {
                            console.log("wrong street label. find street name in road table");
                            displayUniquleStreetList(results.features, AddrNumber);
                        } else {
                            //check alias table
                            var query = new Query({
                                where: "STREETNAME LIKE '%" + longestStr + "%'",
                                returnGeometry: false,
                                outFields: ["*"]
                            });
                            var queryTask = new QueryTask({
                                url: multiSearch.mapService.streetAlias
                            });
                            queryTask.execute(query).then(function (results) {
                                if (results.features.length > 0) {

                                    console.log("wrong street label. find street name in alias table");
                                    displayUniquleStreetList(results.features, AddrNumber);
                                } else {
                                    domClass.remove('suggestedAddresses', 'd-none');
                                    dom.byId("address-links").innerHTML = "<p>Couldn't find entered address. </p><p>Please check the address name.</p>";
                                }
                            });
                        }
                    });
                }
            });
        }

        function closestNums(num, arr) {
            var numsIndex = arr.length - 1;
            if (arr.length > 5) {
                for (var i = 0; i < arr.length; i++) {
                    if (num < arr[i].streetNumber) {
                        if (arr.length - (i + 3) < 0) {
                            numsIndex = arr.length - 1;
                        } else {
                            numsIndex = i + 2;
                        }
                        break;
                    }
                }
                if (numsIndex < 4) {
                    numsIndex = 4;
                }
                return [arr[numsIndex - 4], arr[numsIndex - 3], arr[numsIndex - 2], arr[numsIndex - 1], arr[numsIndex]];

            } else {
                return arr;
            }
        }

        function displayUniquleStreetList(features, AddrNumber) {
            //get unique value
            var unique = {};
            var distinct = [];
            for (var i in features) {
                if (typeof (unique[features[i].attributes.STREETLABEL]) == "undefined") {
                    distinct.push(features[i].attributes.STREETLABEL);
                }
                unique[features[i].attributes.STREETLABEL] = 0;
            }

            var tempAddrNum;
            if (AddrNumber == 0) {
                tempAddrNum = "";
            } else {
                tempAddrNum = "" + AddrNumber + " ";
            }

            domClass.remove('suggestedAddresses', 'd-none');
            var containerNode = dom.byId("address-links");
            containerNode.innerHTML = "";
            domConstruct.create("p", {
                innerHTML: "Did you mean?"
            }, containerNode);
            var ulNode = domConstruct.create("ul", null, containerNode);
            distinct.slice(0, 5).forEach(function (val) {
                var li = domConstruct.create("li", null, ulNode);

                domConstruct.create("button", {
                    className: "btn btn-link",
                    innerHTML: "" + tempAddrNum + val
                }, li);
            });

            domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
                btn.onclick = function () {
                    search.search(this.textContent);
                };
            });
        }

        function findArrayInAliasExtend(AddrRoad) {
            var AliasExtend = {
                "1ST": "FIRST",
                "2ND": "SECOND",
                "3RD": "THIRD",
                "4TH": "FOURTH",
                "5TH": "FIFTH",
                "6TH": "SIXTH",
                "7TH": "SEVENTH",
                "9TH": "NINTH",
                "10TH": "TENTH",
                "11TH": "ELEVENTH",
                "12TH": "TWELFTH",
                "13TH": "THIRTEENTH",
                "15TH": "FIFTEENTH",
                "16TH": "SIXTEENTH",
                "17TH": "SEVENTEENTH",
                "1": "FIRST",
                "2": "SECOND",
                "3": "THIRD",
                "4": "FOURTH",
                "5": "FIFTH",
                "6": "SIXTH",
                "7": "SEVENTH",
                "9": "NINTH",
                "10": "TENTH",
                "11": "ELEVENTH",
                "12": "TWELFTH",
                "13": "THIRTEENTH",
                "15": "FIFTEENTH",
                "16": "SIXTEENTH",
                "17": "SEVENTEENTH"
            };

            var str = AddrRoad.split(" ");
            str = str.map(function (val) {
                if (AliasExtend[val]) {
                    return AliasExtend[val];
                } else {
                    return val;
                }

            });
            return str.join(" ").trim();
        }
    });

    search.on("select-result", function (e) {
        view.zoom = 12;
        if (e.result) {
            console.log("Address found");

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