define([
    'dojo/_base/declare',
    'dojo/dom',
    "dojo/dom-class",
    "dojo/query"
], function (declare, dom, domClass, domQuery) {

    var arrayFrom =function(nodelist){
        console.log([].slice.call(nodelist));
        
       return [].slice.call(nodelist);
    }

    var containerList = multilSearch_settings.containerList;



    var generateCrimeMapIframe = function (urlProp) {
        var temp = document.querySelector('#crime-map-iframe').innerHTML;
        temp = temp.replace(/{{start_date}}/g, urlProp.start_date);
        temp = temp.replace(/{{end_date}}/g, urlProp.end_date);
        temp = temp.replace(/{{lat}}/g, urlProp.lat);
        temp = temp.replace(/{{long}}/g, urlProp.long);
        return temp;
    };

    var generateResultItem = function (item) {
        var temp;
        if (item.displayControl.hyperlinkType == "hardcode") {
            temp = document.querySelector('#search-result-display-hardcode').innerHTML;
            temp = temp.replace(/{{hardcode}}/g, item.displayControl.hardcode);

        } else {
            temp = document.querySelector('#search-result-display').innerHTML;

            if (item.displayControl.hyperlinkType == 'googleMap') {
                temp = temp.replace(/{{link}}/g, 'https://www.google.com/maps/dir/?api=1&origin={{startAdd}}&destination={{endAdd}},Garland');
                temp = temp.replace(/{{linkTitle}}/g, 'Open in Google Map');
                temp = temp.replace(/{{startAdd}}/g, item.startAdd);
                temp = temp.replace(/{{endAdd}}/g, item.endAdd);
            }
        }

        temp = temp.replace(/{{index}}/g, item.displayControl.displayID);
        temp = temp.replace(/{{name}}/g, item.name);
        temp = temp.replace(/{{id}}/g, item.id);
        temp = temp.replace(/{{displayValue1}}/g, item.displayValue1);
        temp = temp.replace(/{{displayValue2}}/g, item.displayValue2);
        temp = temp.replace(/{{displayValue3}}/g, item.displayValue3);
        temp = temp.replace(/{{displayValue4}}/g, item.displayValue4);

        if (item.displayControl.displayDistance) {
            temp = temp.replace(/{{distance}}/g, '(' + item.distance + ' miles)');
        } else {
            temp = temp.replace(/{{distance}}/g, '');
        }

        return temp;
    };

    var prepareHtmlData = function (item, searchTerm) {
        var newItem = {};
        newItem.id = item.id;
        newItem.name = item.name;
        newItem.displayControl = item.displayControl;

        if (item.queryPolygonCount == 0) {
            newItem.displayValue1 = "NULL";
            newItem.displayValue2 = "";
            return newItem;
        }

        if (item.displayControl.displayDistance) {
            newItem.distance = item.distance;
        }

        if (item.displayControl.hyperlinkType == "hardcode") {
            newItem.displayControl.hardcode = item.displayControl.hardcode;
        }

        ["displayValue1", "displayValue2", "displayValue3", "displayValue4"].forEach(function (val) {
            if (item.displayControl[val]) {
                newItem[val] = item.feature[item.displayControl[val]];
            } else {
                newItem[val] = "";
            }
        });

        if (item.displayControl.hyperlinkType == 'googleMap') {
            newItem.startAdd = searchTerm.replace(/\s|\t/g, "+");
            newItem.endAdd = item.feature.ADDRESS.replace(/\s|\t/g, "+")
        }
        return newItem;
    };


    var insertHtmlToPage = function (container, data) {
        var htmlArr = data.filter(function (val) {
            return val.containerID == container.id;
        })
        if(htmlArr.length==0){
            return 0;
        }
        
        var domContainer = document.getElementById(container.id);
        var ulNode = domContainer.querySelector('ul');
        var domExistingData = ulNode.querySelectorAll("li");
        var existingData = [];
        if (domExistingData.length > 0) {
            existingData = arrayFrom(domExistingData).map(function (node) {
                debugger;
                return {
                    displayID: node.attributes.index.value,
                    resultHtml: node.outerHTML
                };
            });
        }

        ulNode.innerHTML = existingData.concat(htmlArr).sort(function (a, b) {
            return a.displayID - b.displayID;
        }).map(function (val) {
            return val.resultHtml;
        }).join("");

        // isContainerFullDisplayed
        if (container.itemCount <= existingData.length + htmlArr.length) {
            var node = domContainer.querySelector(".spinner-grow");
            if (domClass.contains(node, "d-none") == false) {
                domClass.add(node, 'd-none');
            }
        }
      
    };

    var appendToPage = function (arr, address) {
        var resultHtmlArray = arr.map(function (item) {

            var newItem = prepareHtmlData(item, address);
            var resultHtml = generateResultItem(newItem);
            return {
                containerID: newItem.displayControl.containerID,
                displayID: newItem.displayControl.displayID,
                resultHtml: resultHtml
            }
        });

        containerList.forEach(function (val) {
            insertHtmlToPage(val, resultHtmlArray);
        });
    }

    var generateSuggestAddress = function (address) {
        var temp = document.querySelector('#suggest-address').innerHTML;
        temp = temp.replace(/{{streetNumber}}/g, address.streetNumber);
        temp = temp.replace(/{{streetLabel}}/g, address.streetLabel);
        return temp;
    };

    return declare(null, { //'Anonymous' Class,only available within its given scope. 
        generateCrimeMapIframe: generateCrimeMapIframe,
        //generateResultItem: generateResultItem,
        appendToPage: appendToPage,
        generateSuggestAddress: generateSuggestAddress
    });
});