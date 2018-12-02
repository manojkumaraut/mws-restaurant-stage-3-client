
class DBHelper {  // eslint-disable-line no-unused-vars 

  /**
   * Database URL.
   */
  static get DATABASE_URL() {
     const port = 1337; // Change this to your server port
     return `http://localhost:${port}`;
    
  }


  // GET
  // http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
  static fetchRestaurantReviewsById(id, callback) {
    fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(data => callback(null, data))
      .catch(err => callback(err, null));
  }

  static updateIDBRestaurant(restaurant) {
    return idbKeyVal.set('restaurants', restaurant);
  }

  static createIDBReview(review) {
    return idbKeyVal.setReturnId('reviews', review)
      .then(id => {
        console.log('Saved to IDB: reviews', review);
        return id;
      });
  }

  static addRequestToQueue(url, headers, method, data, review_key) {
    const request = {
      url: url,
      headers: headers,
      method: method,
      data: data,
      review_key: review_key
    };
    return idbKeyVal.setReturnId('offline', request)
      .then(id => {
        console.log('Saved to IDB: offline', request);
        return id;
      });
  }


  // http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=true
  static markFavorite(id) {
    fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=true`, {
      method: 'PUT'
    }).catch(err => console.log(err));

  }
   // http://localhost:1337/restaurants/<restaurant_id>/?is_favorite=false
  static unMarkFavorite(id) {
   fetch(`${DBHelper.DATABASE_URL}/restaurants/${id}/?is_favorite=false`, {
      method: 'PUT'
      }).catch(err => console.log(err));
  }
  
  
  // http://localhost:1337/reviews/?restaurant_id=<restaurant_id>
  static fetchRestaurantReviewsById(id, callback) {
    fetch(DBHelper.DATABASE_URL + `/reviews/?restaurant_id=${id}`)
      .then(response => response.json())
      .then(data => callback(null, data))
      .catch(err => callback(err, null));
  }
  
  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    fetch(DBHelper.DATABASE_URL + '/restaurants', {
    })
      .then(response => {
        if (!response.ok) {
          throw Error(`Request failed. Returned status of ${response.statusText}`);
        }
        const restaurants = response.json();
        return restaurants;
      })
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
    
    /*
    fetch(DBHelper.DATABASE_URL + '/restaurants')
      .then(response => response.json())
      .then(restaurants => callback(null, restaurants))
      .catch(err => callback(err, null));
    */
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood);
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i);
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  // GET
  // http://localhost:1337/restaurants/
  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) === i);
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    // return (`/img/${restaurant.photograph}`);
    return (`/img/${restaurant.id}-300.jpg`);
  }

  /**
   * Index image Srcset.
   */
  static imageSrcsetForIndex(restaurant) {
    // return (`${restaurant.srcset_index}`);
    return (`/img/${restaurant.id}-300.jpg 1x, /img/${restaurant.id}-600_2x.jpg 2x`);
  }

  /**
   * Restaurant image Srcset.
   */
  static imageSrcsetForRestaurant(restaurant) {
    // return (`${restaurant.srcset_restaurant}`);
    return (`/img/${restaurant.id}-300.jpg 300w, /img/${restaurant.id}-400.jpg 400w, /img/${restaurant.id}-600_2x.jpg 600w, /img/${restaurant.id}-800_2x.jpg 800w`);
  }

  /**
   * Map marker for a restaurant.
   */
 static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker  
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(newMap);
    return marker;
  } 
}

// export default DBHelper;
window.DBHelper = DBHelper;