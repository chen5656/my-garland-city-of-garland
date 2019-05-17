// "use strict";

var myGarlandCacheName = 'myGarlandCacheV1';
var esriJsApiCacheName='arcgisJs411';

var myGarlandCacheFiles = [
  'js/app.js',
  'js/AddressSuggestion.js',
  'js/clientStorage.js',
  'js/MultiSearch.js',
  'js/NewSearch.js',
  'js/swRegister.js',
  'js/template.js',
  'images/Env-Waste-Svcs.png',
  'images/favicon.ico',
  './',
  'resources/bootstrap/bootstrap.4.3.1.min.css',
  'resources/fonts/PublicSans_Light.woff',
  'resources/localforage/localforage.min.js',
  'resources/localforage/localforage-getitems.js',
  'resources/localforage/localforage-setitems.js',
  'css/style.css',
];


//Installing
//Pre-cache App Shell
self.addEventListener('install', function (event) {
  console.log("From SW: Install Event");
  self.skipWaiting();
  event.waitUntil(
    caches.open(myGarlandCacheName)
    .then(function (cache) {
      return cache.addAll(myGarlandCacheFiles)
    })
  );
});
//V2
//Activating
//Clean up
self.addEventListener('activate', function (event) {
  console.log("From SW: Activate Event");
  self.clients.claim();
  event.waitUntil(
    caches.keys()
    .then(function (cacheKeys) {
      var deletePromises = [];
      for (var i = 0; i < cacheKeys.length; i++) {
        if (cacheKeys[i] != myGarlandCacheName) {
          deletePromises.push(caches.delete(cacheKeys[i]));
        }
      }
      return Promise.all(deletePromises);
    })
  );
});

var arcgisJsAPI_4_11='https://js.arcgis.com';
var arcgisJsAPIList=[
  "dojo_en-us.js",
  "dojo-lite.js",
  "geometryEngineAsync.js",
  "Graphic.js",
  "Search.js",
  
  "Map.js",
  "MapView.js",
  "MapImageLayer.js",
  "Locator.js"];

//Event Listeners Once Activated
self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);
  var requestOrigin=requestUrl.origin;
  var requestPath = requestUrl.pathname;
  var fileName = requestPath.substring(requestPath.lastIndexOf('/') + 1);

  if (fileName == "sw.js") {
    //Network Only Strategy
       event.respondWith(fetch(event.request));
  } else if ( fileName in arcgisJsAPIList) {
    //Offline First then Network Strategy, save to arcgisJsApi cache
    console.log(requestOrigin,requestPath,fileName);
    
     event.respondWith(cacheFirstStrategy(event.request));
  }
});

//Caching Strategies
function cacheFirstStrategy(request) {
  return caches.match(request).then(function (cacheResponse) {
    return cacheResponse || fetchRequestAndCache(request);
  });
}

function networkFirstStrategy(request) {
  return fetchRequestAndCache(request).catch(function (response) {
    return caches.match(request);
  })
}

//Fetch Request And Cache
function fetchRequestAndCache(request) {
  return fetch(request).then(function (networkResponse) {
    caches.open(getCacheName(request)).then(function (cache) {
      cache.put(request, networkResponse);
    })
    return networkResponse.clone();
  });
}

function getCacheName(request) {
  var requestUrl = new URL(request.url);  
  var requestOrigin=requestUrl.origin;

  if (requestOrigin == arcgisJsAPI_4_11) {
    return esriJsApiCacheName;
  } else {
    return myGarlandCacheName;
  }
}

/*self.addEventListener('message', function(event) {
  var sourceID = event.source ? event.source.id : 'unknown';
  event.waitUntil(
    event.source.postMessage({
        sourceID: sourceID,
        message: 'sw:' + event.data
      })
  );
});*/