define([
    'dojo/_base/declare'
], function (declare) {
    var generateCrimeMapIframe=function (urlProp) {
        var template = document.querySelector('#crime-map-iframe').innerHTML;
        template = template.replace(/{{start_date}}/g, urlProp.start_date);
        template = template.replace(/{{end_date}}/g, urlProp.end_date);
        template = template.replace(/{{lat}}/g, urlProp.lat);
        template = template.replace(/{{long}}/g, urlProp.long);
        return template;
    }

    var generateResultHtml=function (item) {
        var template;
        if (item.displayControl.hyperlinkType == "hardcode") {
            template = document.querySelector('#search-result-display-hardcode').innerHTML;                
            template = template.replace(/{{hardcode}}/g, item.displayControl.hardcode);

        } else {
            template = document.querySelector('#search-result-display').innerHTML;

            if (item.displayControl.hyperlinkType == 'googleMap') {                    
                template = template.replace(/{{link}}/g, 'https://www.google.com/maps/dir/?api=1&origin={{startAdd}}&destination={{endAdd}},Garland');
                template = template.replace(/{{linkTitle}}/g, 'Open in Google Map');
                template = template.replace(/{{startAdd}}/g, item.startAdd);
                template = template.replace(/{{endAdd}}/g, item.endAdd);
            }                 
        }
        
        template = template.replace(/{{index}}/g, item.displayControl.displayID);
        template = template.replace(/{{name}}/g, item.name);
        template = template.replace(/{{id}}/g, item.id);
        template = template.replace(/{{displayValue1}}/g, item.displayValue1);
        template = template.replace(/{{displayValue2}}/g, item.displayValue2);
        template = template.replace(/{{displayValue3}}/g, item.displayValue3);
        template = template.replace(/{{displayValue4}}/g, item.displayValue4);

        if (item.displayControl.displayDistance) {
            template = template.replace(/{{distance}}/g, '(' + item.distance + ' miles)');
        } else {
            template = template.replace(/{{distance}}/g, '');
        }

        return template;
    }

    return declare("locationService.template",null, { //'Anonymous' Class,only available within its given scope. 
        generateCrimeMapIframe: generateCrimeMapIframe,
        generateResultHtml: generateResultHtml
    });
});