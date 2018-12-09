 const staticCacheName = 'restaurant-static-006';

/**
 *   Install and Caching of Asset
 */

self.addEventListener('install', event => {    
  event.waitUntil(
    caches.open(staticCacheName)
      .then(cache => {
        return cache.addAll([
          '/',
          '/index.html',
          '/css/styles.css',
          '/js/index.min.js',
          '/js/restaurant.min.js',
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
          '/restaurant.html?id=1&isOffline=true',
          '/restaurant.html?id=2&isOffline=true',
          '/restaurant.html?id=3&isOffline=true',
          '/restaurant.html?id=4&isOffline=true',
          '/restaurant.html?id=5&isOffline=true',
          '/restaurant.html?id=6&isOffline=true',
          '/restaurant.html?id=7&isOffline=true',
          '/restaurant.html?id=8&isOffline=true',
          '/restaurant.html?id=9&isOffline=true',
          '/restaurant.html?id=10&isOffline=true',
          '/img/appoffline.png'
        ]).catch(error => {
          console.log('Caches open failed: ' + error);
        });
      })
  );
});

let i = 0;
/**
 *   Fetch event and Offline Caching 
 */
self.addEventListener('fetch', event => {
  const request = event.request;
  const requestUrl = new URL(request.url);

  if (requestUrl.port === '1337') {
    event.respondWith(idbResponse(request));
  }
  
   if (request.url.includes('reviews')) {
      let id = +requestUrl.searchParams.get('restaurant_id');
      event.respondWith(idbReviewResponse(request, id));
    }   
  else {
    event.respondWith(cacheResponse(request));
  }
});

let j = 0;
function idbRestaurantResponse(request, id) {
  // 1. getAll records from objectStore
  // 2. if more than 1 rec then return match
  // 3. if no match then fetch json, write to idb, & return response

  return idbKeyVal.getAll('restaurants')
    .then(restaurants => {
      if (restaurants.length) {
        return restaurants;
      }
      return fetch(request)
        .then(response => response.json())
        .then(json => {
          json.forEach(restaurant => {
            console.log('fetch idb write', ++j, restaurant.id, restaurant.name);
            idbKeyVal.set('restaurants', restaurant);
          });
          return json;
        });
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}

let k = 0;
function idbReviewResponse(request, id) {
  return idbKeyVal.getAllIdx('reviews', 'restaurant_id', id)
    .then(reviews => {
      if (reviews.length) {
        return reviews;
      }
      return fetch(request)
        .then(response => response.json())
        .then(json => {
          json.forEach(review => {
            console.log('fetch idb review write', ++k, review.id, review.name);
            idbKeyVal.set('reviews', review);
          });
          return json;
        });
    })
    .then(response => new Response(JSON.stringify(response)))
    .catch(error => {
      return new Response(error, {
        status: 404,
        statusText: 'my bad request'
      });
    });
}
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
