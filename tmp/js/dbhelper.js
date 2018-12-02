/**
 * Common database helper functions.
 */
 
import idb from 'idb'; 
class DBHelper {
  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
   
   
   static indexdbInit() {
   return idb.open('restaurant-db', 1, function (upgradeDb) {
      switch (upgradeDb.oldVersion) {
        case 0:
          upgradeDb.createObjectStore('restaurants');
      }
    });
  }

  /**
   * Fetch restaurants from restaurant-list.
   */
  static getRestaurantsFromDb(dbPromise) {
    return dbPromise.then(function (db) {
      if (!db) return;
      let tx = db.transaction('restaurants');
      let restaurantsStore = tx.objectStore('restaurants');
      return restaurantsStore.get('restaurant-list');
    });
  }

  /**
   * Update restaurants to restaurant-list.
   */
  static updateRestaurantsInDb(restaurants, dbPromise) {
    return dbPromise.then(function (db) {
      if (!db) return;
      let tx = db.transaction('restaurants', 'readwrite');
      let restaurantsStore = tx.objectStore('restaurants');
      restaurantsStore.put(restaurants, 'restaurants-list');
      tx.complete;
    });
  }
   
   static fetchRestaurants(callback) {
    const dbPromise = DBHelper.indexdbInit();
    DBHelper.getRestaurantsFromDb(dbPromise)
      .then((restaurants) => {
        if (restaurants && restaurants.length > 0) {
          // Fetched restaurants from restaurant-list
          callback(null, restaurants);
        } else {
          return fetch(DBHelper.DATABASE_URL);
        }
      }).then(response => {
        // Got a success response
        if (!response) return;
        return response.json();
      }).then(restaurants => {
      if (!restaurants) return;
        DBHelper.updateRestaurantsInDb(restaurants, dbPromise);
        callback(null, restaurants);
      }).catch((error) => {
        // Oops!. Got an error from server or some error while operations!
        const errorMessage = (`Request failed. Error message: ${error}`);
        callback(errorMessage, null);
      });
  }

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
   
   
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }
  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }
  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(
    cuisine,
    neighborhood,
    callback
  ) {
    // Fetch all restaurants
    fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants;
        if (cuisine != "all") {
          // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != "all") {
          // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }
  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map(
          (v, i) => restaurants[i].neighborhood
        );
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter(
          (v, i) => neighborhoods.indexOf(v) == i
        );
        callback(null, uniqueNeighborhoods, new IndexPage());
      }
    });
  }
  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type);
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter(
          (v, i) => cuisines.indexOf(v) == i
        );
        callback(null, uniqueCuisines, new IndexPage());
      }
    });
  }
}
© 2018 GitHub, Inc.