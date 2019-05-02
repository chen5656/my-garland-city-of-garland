define([
    'dojo/_base/declare'
], function (declare) {
    var generateCrimeMapIframe=function (urlProp) {
        var temp = document.querySelector('#crime-map-iframe').innerHTML;
        temp = temp.replace(/{{start_date}}/g, urlProp.start_date);
        temp = temp.replace(/{{end_date}}/g, urlProp.end_date);
        temp = temp.replace(/{{lat}}/g, urlProp.lat);
        temp = temp.replace(/{{long}}/g, urlProp.long);
        return temp;
    }

    var generateResultHtml=function (item) {
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
    }

    var generateSuggestAddress=function(address){
        var temp = document.querySelector('#suggest-address').innerHTML;
        temp = temp.replace(/{{streetNumber}}/g, address.streetNumber);
        temp = temp.replace(/{{streetLabel}}/g, address.streetLabel);
        return temp;
    }
  
    return declare(null, { //'Anonymous' Class,only available within its given scope. 
        generateCrimeMapIframe: generateCrimeMapIframe,
        generateResultHtml: generateResultHtml,
        generateSuggestAddress:generateSuggestAddress
    });
});