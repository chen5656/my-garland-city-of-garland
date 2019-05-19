// "use strict";

var myGarlandCacheName = 'myGarlandCacheV1';
var EsriJsApiCache411 = 'EsriJsApiV411';

var myGarlandCacheFiles = [
  'js/app.js',
  'js/AddressSuggestion.js',
  'js/clientStorage.js',
  'js/MultiSearch.js',
  'js/NewSearch.js',
  'js/swRegister.js',
  'js/template.js',
  'images/Env-Waste-Svcs.png',
  './',
  'resources/bootstrap/bootstrap.4.3.1.min.css',
  'resources/fonts/PublicSans_Light.woff',
  'resources/localforage/localforage.min.js',
  'css/style.css'
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
        if (cacheKeys[i] != myGarlandCacheName &&
          cacheKeys[i] != EsriJsApiCache411) {
          deletePromises.push(caches.delete(cacheKeys[i]));
        }
      }
      return Promise.all(deletePromises);
    })
  );
});

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url);
  var requestOrigin = requestUrl.origin;
  var hostname = requestUrl.hostname;
  var requestPath = requestUrl.pathname;
  var fileName = requestPath.substring(requestPath.lastIndexOf('/') + 1);

  if (fileName == "sw.js") {
    //Network Only Strategy
    event.respondWith(fetch(event.request));
  } else if (hostname == "js.arcgis.com") {
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (hostname == "127.0.0.1" || (hostname == "maps.garlandtx.gov" && !requestUrl.pathname.includes("/arcgis/rest/services/WebApps/MyGarland/"))) {
    //Offline First  
    console.log(requestOrigin, requestPath, fileName);
    event.respondWith(cacheFirstStrategy(event.request));
  }
});

//Caching Strategies
function cacheFirstStrategy(request) {
  var s = caches.match(request).then(function (cacheResponse) {
    return cacheResponse || fetchRequestAndCache(request);
  });
  return s;
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
  var hostname = requestUrl.hostname;

  if (hostname == "js.arcgis.com") {
    return EsriJsApiCache411;
  } else {
    return myGarlandCacheName;
  }
}