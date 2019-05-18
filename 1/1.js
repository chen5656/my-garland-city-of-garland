function displayErrorMessage(e) {
    alert("Time out to retrieve data. Please refresh the page."),
        console.log("alert", e)
}

function getUnique(e) {
    var t = {},
        n = [];
    for (var o in e)
        void 0 === t[e[o]] && n.push(e[o]),
        t[e[o]] = 0;
    return n
}
var template = new myGarland.templates,
    saveToIndexDB = new myGarland.clientStorage;
require(["dojo/dom", "dojo/dom-class", "esri/Map", "esri/views/MapView", "esri/layers/MapImageLayer", "esri/widgets/Search", "esri/tasks/Locator", "esri/Graphic", "dojo/query", "dojo/dom-construct", "js/MultiSearch.js", "js/AddressSuggestion.js", "js/NewSearch.js", "dojo/domReady!"], function (e, t, n, o, a, r, i, s, c, d, l, u) {
    "use strict";

    function g() {//searchStart
        t.add("nodeResult", "d-none"),
            t.add("suggestedAddresses", "d-none"),
            t.add("ews_link", "d-none"),
            e.byId("street-condition-checkbox").checked = !1,
            t.add("street-condition-legend", "d-none"),
            c(".spinner-grow").forEach(function (e) {
                t.contains(e, "d-none") && t.remove(e, "d-none")
            }),
            c("ul", "nodeResult").forEach(function (e) {
                e.innerHTML = ""
            })
    }

    function p(e, t) {//displayAndSaveSearchData
        template.appendToPage(e, t.address),
            t.resultList = t.resultList.concat(e);
        var n = {
            address: t.address,
            resultList: t.resultList
        };
        t.geometry && (n.geometry = {
                latitude: t.geometry.latitude,
                longitude: t.geometry.longitude
            }),
            t.parcelInfo && (n.parcelInfo = "true"),
            t.serviceZoneList && (n.serviceZoneList = "true"),
            t.nearestCityFacilityList && (n.nearestCityFacilityList = "true"),
            n.createdOn = Date.now(),
            saveToIndexDB.insertInfo(t.addressId, n)
    }

    function pushToHistory(e) {//pushToHistory
        window.history.state ? "my-garland-address-search" == window.history.state.value && window.history.state.id != e ? window.history.pushState({
            value: "my-garland-address-search",
            id: e
        }, "", "?addressId=" + e) : window.history.replaceState({
            value: "my-garland-address-search",
            id: e
        }, "", "?addressId=" + e) : window.history.pushState({
            value: "my-garland-address-search",
            id: e
        }, "", "?addressId=" + e)
    }

    function y(e, t) {//addToMap
        var n = new s({
            geometry: e,
            symbol: {
                type: "simple-marker",
                color: "#dc2533"
            }
        });
        t.graphics.removeAll(),
            t.graphics.add(n),
            t.center = [e.longitude, e.latitude]
    }

    function h(t) {//displayCrimeMap
        var n = new Date;
        n.setHours(0, 0, 0);
        var o = new Date(n.getTime() - 1e3 - 5184e5),
            a = new Date(n.getTime() - 11232e5),
            r = "".concat(a.getFullYear(), "-", a.getMonth() + 1, "-", a.getDate()),
            i = "".concat(o.getFullYear(), "-", o.getMonth() + 1, "-", o.getDate()),
            s = {
                lat: t.latitude,
                long: t.longitude,
                start_date: r,
                end_date: i
            },
            c = e.byId("crimeData");
        c.innerHTML = "",
            c.innerHTML = template.generateCrimeMapIframe(s)
    }

    function f(e, n) {//searchFinish
        var a = new locationService.NewSearch(e);
        saveToIndexDB.getInfo(e).then(function (o) {
                if (o && o.parcelInfo && o.serviceZoneList && o.parcelInfo) {
                    var r = ((Date.now() - o.createdOn) / 864e5).toFixed(3);
                    if (r < 30)
                        return console.log("display oldSearch - find search result in indexDB of ".concat(r, " days ago.")),
                            document.title = "My Garland - ".concat(o.address),
                            n && pushToHistory(e),
                            t.remove("nodeResult", "d-none"),
                            template.appendToPage(o.resultList, o.address),
                            o.geometry = {
                                type: "point",
                                latitude: o.geometry.latitude,
                                longitude: o.geometry.longitude
                            },
                            y(o.geometry, v),
                            y(o.geometry, I),
                            h(o.geometry),
                            void(S.searchTerm = o.address)
                }
                console.log("create newSearch"),
                    a.getAddressInfo().then(function () {
                        t.remove("nodeResult", "d-none"),
                            document.title = "My Garland - ".concat(a.address),
                            n && pushToHistory(e),
                            S.searchTerm.trim().length < 2 && (S.searchTerm = a.address),
                            a.getNearestCityFacilityList(L.cityFacilityList).then(function (e) {
                                p(e, a)
                            }),
                            a.projectToSpatialReference([a.geometryStatePlane], v.spatialReference).then(function (e) {
                                a.geometry = e[0],
                                    y(a.geometry, v),
                                    y(a.geometry, I),
                                    a.getParcelInfo(L.parcelDataList).then(function (e) {
                                        p(e, a)
                                    }),
                                    a.getLocatedServiceZoneList(L.serviceZoneSourceList).then(function (e) {
                                        p(e, a)
                                    }),
                                    h(a.geometry),
                                    console.log("newSearch", a)
                            }).catch(function (e) {
                                console.log("Error on projectToStatePlane/ getDistanceToFacilities/ getLocatedServiceZoneList:", e),
                                    displayErrorMessage(e)
                            })
                    }, function (e) {
                        console.log("getAddressInfo", e)
                    })
            }),
            o = document.getElementById("ews_link"),
            1 == t.contains(o, "d-none") && t.remove(o, "d-none")
    }
    var v, w, I, S;
    (function () {
        e.byId("offline").innerHTML = "";
        var t = new a(appSetting.mapInTop.mapImageLayer),
            r = new n({
                basemap: appSetting.mapInTop.basemap,
                layers: [t]
            });
        v = new o({
                container: "viewDiv",
                map: r,
                zoom: appSetting.mapInTop.zoom,
                center: appSetting.mapInTop.center
            }),
            w = new n({
                basemap: "topo",
                layers: [new a(appSetting.subMap.baseMap.map)]
            }),
            I = new o({
                container: "subMapView",
                map: w,
                zoom: 18,
                center: appSetting.mapInTop.center,
                constraints: {
                    rotationEnabled: !1
                }
            })
    })();
    var b = u(),
        L = new l(multilSearch_settings);
    L.getCityFacilityList(multilSearch_settings.cityFacilitySourceList).then(function () {
            var e = appSetting.locator.sourceSetting;
            e.locator = new i({
                    url: appSetting.locator.locatorUrl
                }),
                S = new r({
                    view: v,
                    container: "search",
                    includeDefaultSources: !1,
                    allPlaceholder: ".",
                    locationEnabled: !1,
                    sources: [e]
                }),
                S.on("search-start", function (e) {
                    g()
                }),
                S.on("search-complete", function (e) {
                    if (0 == e.numResults) {
                        var n = function () {
                            S.search(this.textContent)
                        };
                        t.remove("suggestedAddresses", "d-none"),
                            b.suggestion("address-links", n, e.searchTerm, L.mapService)
                    }
                }),
                S.on("select-result", function (e) {
                    v.zoom = 12,
                        e.result && (saveToIndexDB.insertInfo("term-" + this.searchTerm.trim().split(",")[0], {
                                addressId: "".concat(e.result.feature.attributes.Ref_ID),
                                createdOn: Date.now()
                            }),
                            f(e.result.feature.attributes.Ref_ID, !0))
                }),
                function () {
                    function e(e) {
                        for (var t = window.location.search.substring(1), n = t.split("&"), o = 0; o < n.length; o++) {
                            var a = n[o].split("=");
                            if (a[0].toLowerCase() == e)
                                return a[1]
                        }
                        return ""
                    }
                    var t = "".concat(e("addressid"));
                    !isNaN(t) && t > 0 && f(t, !0)
                }()
        }),
        t.remove("main-content", "d-none"),
        c(".collapsed", "nodeResult").forEach(function (n) {
            n.onclick = function () {
                var n = e.byId(this.getAttribute("aria-controls"));
                t.toggle(n, "show");
                var o = this.firstElementChild;
                t.contains(o, "esri-icon-minus") ? (t.add(o, "esri-icon-plus"),
                    t.remove(o, "esri-icon-minus")) : (t.add(o, "esri-icon-minus"),
                    t.remove(o, "esri-icon-plus"))
            }
        }),
        c(".closeButton", "main-content").forEach(function (n) {
            n.onclick = function () {
                var n = e.byId(this.getAttribute("aria-controls"));
                t.add(n, "d-none")
            }
        }),
        function (t) {
            var n = e.byId("street-condition-legend");
            d.create("p", {
                innerHTML: t.title
            }, n);
            var o = d.create("table", null, n),
                a = d.create("tbody", null, o);
            t.renderer.map(function (e) {
                var t;
                switch (e.type) {
                    case "polyline":
                        t = "".concat('<line x1="0" y1="10" x2="20" y2="10" style="stroke:', e.color, ";stroke-width:", e.size, '" />');
                        break;
                    case "polygon":
                        t = "".concat('<polygon points="0,0 0,20 20,20 20,0" style="fill:', e.color, ';stroke:black;stroke-width:1" />');
                        break;
                    default:
                        t = "".concat('  <circle cx="', e.size, '" cy="', e.size, '" r="', e.size / 2, '" stroke="black" stroke-width="1" fill="', e.color, '" />')
                }
                t = "".concat(' <svg height="20" width="20">', t, "</svg>");
                var n = d.create("tr", null, a);
                d.create("td", {
                        innerHTML: t,
                        width: 35
                    }, n),
                    d.create("td", {
                        innerHTML: e.label
                    }, n)
            })
        }(appSetting.subMap.streetCondition.legend),
        e.byId("street-condition-toggle").addEventListener("change", function () {
            var n = e.byId("street-condition-checkbox").checked,
                o = e.byId("street-condition-legend");
            if (n) {
                t.contains(o, "d-none") && t.remove(o, "d-none");
                var r = new a(appSetting.subMap.streetCondition.map);
                w.layers.add(r)
            } else {
                0 == t.contains(o, "d-none") && t.add(o, "d-none");
                r = w.layers.items.filter(function (e) {
                    return e.url == appSetting.subMap.streetCondition.map.url
                })[0];
                w.remove(r)
            }
        }),
        window.addEventListener("popstate", function (e) {
            "my-garland-address-search" == e.state.value && (g(),
                S.searchTerm = "",
                f(e.state.id, !1))
        })
});