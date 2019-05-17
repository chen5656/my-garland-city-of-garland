function hasClass(e,a){return e.classList?e.classList.contains(a):!!e.className.match(new RegExp("(\\s|^)"+a+"(\\s|$)"))}function addClass(e,a){e.classList?e.classList.add(a):hasClass(e,a)||(e.className+=" "+a)}function removeClass(e,a){if(e.classList)e.classList.remove(a);else if(hasClass(e,a)){var r=new RegExp("(\\s|^)"+a+"(\\s|$)");e.className=e.className.replace(r," ")}}var myGarland=myGarland||{};myGarland.templates=function(){};var arrayFrom=function(e){return[].slice.call(e)},containerList=multilSearch_settings.containerList,generateCrimeMapIframe=function(e){var a=document.querySelector("#crime-map-iframe").innerHTML;return a=a.replace(/{{start_date}}/g,e.start_date),a=a.replace(/{{end_date}}/g,e.end_date),a=a.replace(/{{lat}}/g,e.lat),a=a.replace(/{{long}}/g,e.long),a},generateResultItem=function(e){var a;return"hardcode"==e.displayControl.hyperlinkType?(a=document.querySelector("#search-result-display-hardcode").innerHTML,a=a.replace(/{{hardcode}}/g,e.displayControl.hardcode)):(a=document.querySelector("#search-result-display").innerHTML,"googleMap"==e.displayControl.hyperlinkType&&(a=a.replace(/{{link}}/g,"https://www.google.com/maps/dir/?api=1&origin={{startAdd}}&destination={{endAdd}},Garland"),a=a.replace(/{{linkTitle}}/g,"Open in Google Map"),a=a.replace(/{{startAdd}}/g,e.startAdd),a=a.replace(/{{endAdd}}/g,e.endAdd))),a=a.replace(/{{index}}/g,e.displayControl.displayID),a=a.replace(/{{name}}/g,e.name),a=a.replace(/{{id}}/g,e.id),a=a.replace(/{{displayValue1}}/g,e.displayValue1),a=a.replace(/{{displayValue2}}/g,e.displayValue2),a=a.replace(/{{displayValue3}}/g,e.displayValue3),a=a.replace(/{{displayValue4}}/g,e.displayValue4),a=e.displayControl.displayDistance?a.replace(/{{distance}}/g,"("+e.distance+" miles)"):a.replace(/{{distance}}/g,""),a},prepareHtmlData=function(e,a){var r={};return r.id=e.id,r.name=e.name,r.displayControl=e.displayControl,0==e.queryPolygonCount?(r.displayValue1="NULL",r.displayValue2="",r):(e.displayControl.displayDistance&&(r.distance=e.distance),"hardcode"==e.displayControl.hyperlinkType&&(r.displayControl.hardcode=e.displayControl.hardcode),["displayValue1","displayValue2","displayValue3","displayValue4"].forEach(function(a){e.displayControl[a]?r[a]=e.feature[e.displayControl[a]]:r[a]=""}),"googleMap"==e.displayControl.hyperlinkType&&(r.startAdd=a.replace(/\s|\t/g,"+"),r.endAdd=e.feature.ADDRESS.replace(/\s|\t/g,"+")),r)},insertHtmlToPage=function(e,a){var r=a.filter(function(a){return a.containerID==e.id});if(0==r.length)return 0;var t=document.getElementById(e.id),l=t.querySelector("ul"),n=l.querySelectorAll("li"),s=[];if(n.length>0&&(s=arrayFrom(n).map(function(e){return{displayID:e.attributes.index.value,resultHtml:e.outerHTML}})),l.innerHTML=s.concat(r).sort(function(e,a){return e.displayID-a.displayID}).map(function(e){return e.resultHtml}).join(""),e.itemCount<=s.length+r.length){var i=t.querySelector(".spinner-grow");addClass(i,"d-none")}},appendToPage=function(e,a){var r=e.map(function(e){var r=prepareHtmlData(e,a),t=generateResultItem(r);return{containerID:r.displayControl.containerID,displayID:r.displayControl.displayID,resultHtml:t}});containerList.forEach(function(e){insertHtmlToPage(e,r)})},generateSuggestAddress=function(e){var a=document.querySelector("#suggest-address").innerHTML;return a=a.replace(/{{streetNumber}}/g,e.streetNumber),a=a.replace(/{{streetLabel}}/g,e.streetLabel),a};myGarland.templates.prototype={generateCrimeMapIframe:generateCrimeMapIframe,appendToPage:appendToPage,generateSuggestAddress:generateSuggestAddress};