define(["dojo/_base/declare","esri/tasks/support/Query","esri/tasks/QueryTask","dojo/query"],function(e,t,r,n){function s(e,t){var r=t.length-1;if(t.length>5){for(var n=0;n<t.length;n++)if(e<t[n].streetNumber){r=t.length-(n+3)<0?t.length-1:n+2;break}return r<4&&(r=4),[t[r-4],t[r-3],t[r-2],t[r-1],t[r]]}return t}function a(e,t){var r,s={},a=[];for(var u in e)void 0===s[e[u].attributes.STREETLABEL]&&a.push(e[u].attributes.STREETLABEL),s[e[u].attributes.STREETLABEL]=0;r=0==t?"":t+" ";var i=a.slice(0,5).map(function(e){return template.generateSuggestAddress({streetNumber:r,streetLabel:e})}).join("");node.innerHTML="<p>Did you mean?</p><ul>".concat(i,"</ul>"),n(".btn-link","suggestedAddresses").forEach(function(e){e.onclick=searchAddressFunction})}function u(e){var t=e.split(" ");return t=t.map(function(e){return appSetting.aliasExtend[e]?appSetting.aliasExtend[e]:e}),t.join(" ").trim()}var i=function(e,i,o,l){var d,c,f=document.getElementById(e),g=o.split(",")[0].trim().toUpperCase(),E=g.split(" ");if(E.length>1){var p=E[0];p!=parseInt(p,10)?(d=g,c=0):(E.shift(),d=E.join(" "),c=p)}else d=g,c=0;d=u(d);var b=new t({where:"STREETLABEL LIKE '%"+d+"%'",returnGeometry:!1,outFields:["*"]}),h=new r({url:l.address});h.execute(b).then(function(e){var u=[];if(e.features.length>0){console.log("correct street label, wrong address number"),u=e.features.map(function(e){return{streetNumber:e.attributes.STREETNUM,streetLabel:e.attributes.STREETLABEL}}).sort(function(e,t){return e.streetNumber-t.streetNumber});var o=s(c,u).map(function(e){return template.generateSuggestAddress({streetNumber:e.streetNumber,streetLabel:e.streetLabel})}).join("");f.innerHTML="<p>Did you mean?</p><ul>".concat(o,"</ul>"),n(".btn-link","suggestedAddresses").forEach(function(e){e.onclick=i})}else{o=d.split(" ");for(var g=o[0],E=1;E<o.length;E++)g.length<o[E].length&&(g=o[E]);var p=new t({where:"STREETLABEL LIKE '%"+g+"%'",returnGeometry:!1,outFields:["*"]});console.log(p.where);var b=new r({url:l.road});b.execute(p).then(function(e){if(e.features.length>0)console.log("wrong street label. find street name in road table"),a(e.features,c);else{var n=new t({where:"STREETNAME LIKE '%"+g+"%'",returnGeometry:!1,outFields:["*"]}),s=new r({url:l.streetAlias});s.execute(n).then(function(e){e.features.length>0?(console.log("wrong street label. find street name in alias table"),a(e.features,c)):f.innerHTML="<p>Couldn't find entered address. </p><p>Please check the address name.</p>"})}})}})};return e(null,{suggestion:i})});