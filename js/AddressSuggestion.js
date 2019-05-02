define([
    "dojo/_base/declare",

    "esri/tasks/support/Query",
    "esri/tasks/QueryTask",

    "dojo/query"
], function (declare,
    Query, QueryTask,
    domQuery
) {

    var suggestion = function (displayArea, searchAddressFunction, searchTerm, mapServices, aliasExtend) {
        var AddrRoad, AddrNumber;
        var node = document.getElementById(displayArea);
        var str = searchTerm.split(",")[0].trim().toUpperCase();
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

        AddrRoad = findArrayInAliasExtend(AddrRoad, aliasExtend);

        var query = new Query({
            where: "STREETLABEL LIKE '%" + AddrRoad + "%'",
            returnGeometry: false,
            outFields: ["*"]
        });
        var queryTask = new QueryTask({
            url: mapServices.address
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
                var str = closestNums(AddrNumber, AddList).map(function (val) {
                    return '<li><button class="btn btn-link"  onclick="myFunction()">' + val.streetNumber + " " + val.streetLabel + '</button></li>'
                }).join("");

                node.innerHTML = "<p>Did you mean?</p><ul>".concat(str, "</ul>");

                domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
                    btn.onclick = searchAddressFunction;
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
                    url: mapServices.road
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
                            url: mapServices.streetAlias
                        });
                        queryTask.execute(query).then(function (results) {
                            if (results.features.length > 0) {

                                console.log("wrong street label. find street name in alias table");
                                displayUniquleStreetList(results.features, AddrNumber);
                            } else {
                                node.innerHTML = "<p>Couldn't find entered address. </p><p>Please check the address name.</p>";
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

        var str = distinct.slice(0, 5).map(function (val) {
            return '<li><button class="btn btn-link"  onclick="myFunction()">' + tempAddrNum + val + '</button></li>'
        }).join("");
        node.innerHTML = "<p>Did you mean?</p><ul>".concat(str, "</ul>");

        domQuery(".btn-link", "suggestedAddresses").forEach(function (btn) {
            btn.onclick = searchAddressFunction;
        });
    }

    function findArrayInAliasExtend(AddrRoad, aliasExtend) {
        var str = AddrRoad.split(" ");
        str = str.map(function (val) {
            if (aliasExtend[val]) {
                return aliasExtend[val];
            } else {
                return val;
            }

        });
        return str.join(" ").trim();
    }
    
    return declare(null, {
        //no result found. Suggestion the nearest result
        suggestion: suggestion
    });
});