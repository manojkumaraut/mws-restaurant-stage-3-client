 const staticCacheName = 'restaurant-static-006';

/**
 *   Install and Caching of Asset
 */

self.addEventListener('install', event => {    
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll([
          '/index.html',
          '/css/styles.css',
          '/css/font-awesome.min.css',
          '/js/dbhelper.js',
          '/js/registerServiceWorker.js',
          '/js/main.js',
          '/js/restaurant_info.js',
          '/data/restaurants.json',
          '/restaurant.html?id=1',
          '/restaurant.html?id=2',
          '/restaurant.html?id=3',
          '/restaurant.html?id=4',
          '/restaurant.html?id=5',
          '/restaurant.html?id=6',
          '/restaurant.html?id=7',
          '/restaurant.html?id=8',
          '/restaurant.html?id=9',
          '/restaurant.html?id=10',
          '/img/appoffline.png'
        ]).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});


/**
 *   Fetch event and Offline Caching 
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.port === '1337') {
    event.respondWith(idbResponse(request));
  }
  else {
    event.respondWith(cacheResponse(request));
  }
});

function cacheResponse(request) {
	return caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
            return caches.open(staticCacheName).then(cache => {
                if(request.url.indexOf('http') === 0){
                    cache.put(request, fetchResponse.clone());
                }
              return fetchResponse;
            });
          });
      }).catch(error => {
        if (request.url.includes('.jpg')) {
            return caches.match('/img/appoffline.png');
          }
          return new Response('Not connected to the internet', {
            status: 404,
            statusText: "Not connected to the internet"
          });
        console.log(error, 'no cache entry for:', request.url);
      })
   
	
}
function idbResponse(request) {
  return idbKeyVal.get('restaurants')
    .then(restaurants => {
      return (
        restaurants ||
        fetch(request)
          .then(response => response.json())
          .then(json => {
            idbKeyVal.set('restaurants', json);
            return json;
          })
      );
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}
	

/**
 *   Static Cache Clear
 */

  self.addEventListener('activate', event => {
    event.waitUntil(
       caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.filter(cacheName => {
            return cacheName.startsWith('restaurant-static-') && cacheName !== staticCacheName;
          }).map(cacheName => {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });
