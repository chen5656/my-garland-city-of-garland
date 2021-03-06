function hasClass(el, className) {
    if (el.classList) {
        return el.classList.contains(className);
    }
    return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className);
    } else if (!hasClass(el, className)) {
        el.className += " " + className;
    }
}


function formatPhoneNumber(phoneNumberString) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '')
    var match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
    if (match) {
        return '' + match[1] + '-' + match[2] + '-' + match[3]
    }
    return null
}

var myGarland = myGarland || {};
myGarland.templates = function () {};
var arrayFrom = function (nodelist) {
    return [].slice.call(nodelist);
};

var containerList = multilSearch_settings.containerList;

var generateResultItem = function (item) {
    if (item.displayControl.displayFunction) {
        var functionParameter = item.displayControl.displayFunction.functionParameter.map(function (parameter) {
            return item[parameter];
        });
        var functionCode = multiSearch_displayFunctions[item.displayControl.displayFunction.functionCode];
        item.displayValue1 = functionCode(functionParameter);
    }

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

    if (item.displayControl.displayFormat) {
        item.displayControl.displayFormat.forEach(function (e) {
            if (e.value = "phone-number") {
                item[e.id] = formatPhoneNumber(item[e.id]);
            }
        })
    }

    temp = temp.replace(/{{index}}/g, item.displayControl.displayID);
    temp = temp.replace(/{{name}}/g, item.name);
    temp = temp.replace(/{{id}}/g, item.id);
    temp = temp.replace(/{{displayValue1}}/g, item.displayValue1);
    temp = temp.replace(/{{displayValue2}}/g, item.displayValue2);
    temp = temp.replace(/{{displayValue3}}/g, item.displayValue3);
    temp = temp.replace(/{{displayValue4}}/g, item.displayValue4);
    temp = temp.replace(/{{hardcodeValue1}}/g, item.hardcodeValue1);

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
        newItem.displayValue1 = "NONE";
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
            if(item.feature[item.displayControl[val]]==""){
                newItem[val] ="None";
            }else{
                newItem[val] = item.feature[item.displayControl[val]];
            }
        } else {
            newItem[val] = "";
        }
    });

    ["hardcodeValue1"].forEach(function (val) {
        if (item[val]) {
            newItem[val] = item[val];
        } else {
            newItem[val] = "";
        }
    });

    if (item.displayControl.hyperlinkType == 'googleMap') {
        newItem.startAdd = searchTerm.replace(/\s|\t/g, "+");
        if (item.feature.ADDRESS) {

            newItem.endAdd = item.feature.ADDRESS.replace(/\s|\t/g, "+")
        } else {
            console.error("error, no address info for ", item.feature);
        }
    }
    return newItem;
};

var insertHtmlToPage = function (container, data) {
    var htmlArr = data.filter(function (val) {
        return val.containerID == container.id;
    })
    if (htmlArr.length == 0) {
        return 0;
    }

    var domContainer = document.getElementById(container.id);
    var ulNode = domContainer.querySelector('ul');
    var domExistingData = ulNode.querySelectorAll("li");
    var existingData = [];
    if (domExistingData.length > 0) {
        existingData = arrayFrom(domExistingData).map(function (node) {
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
        addClass(node, 'd-none');
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

myGarland.templates.prototype = {
    appendToPage: appendToPage,
    generateSuggestAddress: generateSuggestAddress
};