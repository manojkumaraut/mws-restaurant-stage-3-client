let restaurants,
  neighborhoods,
  cuisines;
var newMap;
var markers = [];

/**
 * Fetch neighborhoods and cuisines as soon as the page is loaded.
 */
document.addEventListener('DOMContentLoaded', (event) => {
  initMap(); // added 
  fetchNeighborhoods();
  fetchCuisines();
});



window.addEventListener('load', function () {
  const isOffline = getParameterByName('isOffline');

  if (isOffline) {
    document.querySelector('#offline').setAttribute('aria-hidden', false);
    document.querySelector('#offline').classList.add('show');
      
    wait(8000).then(() => {
      document.querySelector('#offline').setAttribute('aria-hidden', true);
      document.querySelector('#offline').classList.remove('show');
    });
  }

  DBHelper.processQueue();
});

/**
 * Get a parameter by name from page URL.
 */
const getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  // name = name.replace(/[\[\]]/g, '\\$&');
  name = name.replace(/[[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
};


/**
 * Fetch all neighborhoods and set their HTML.
 */
fetchNeighborhoods = () => {
  DBHelper.fetchNeighborhoods((error, neighborhoods) => {
    if (error) { // Got an error
      console.error(error);
    } else {
      self.neighborhoods = neighborhoods;
      fillNeighborhoodsHTML();
    }
  });
}

/**
 * Set neighborhoods HTML.
 */
fillNeighborhoodsHTML = (neighborhoods = self.neighborhoods) => {
  const select = document.getElementById('neighborhoods-select');
  neighborhoods.forEach(neighborhood => {
    const option = document.createElement('option');
    option.innerHTML = neighborhood;
    option.value = neighborhood;
    select.append(option);
  });
}

/**
 * Fetch all cuisines and set their HTML.
 */
fetchCuisines = () => {
  DBHelper.fetchCuisines((error, cuisines) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.cuisines = cuisines;
      fillCuisinesHTML();
    }
  });
}

/**
 * Set cuisines HTML.
 */
fillCuisinesHTML = (cuisines = self.cuisines) => {
  const select = document.getElementById('cuisines-select');

  cuisines.forEach(cuisine => {
    const option = document.createElement('option');
    option.innerHTML = cuisine;
    option.value = cuisine;
    select.append(option);
  });
}

/**
 * Initialize leaflet map, called from HTML.
 */
initMap = () => {
  self.newMap = L.map('map', {
        center: [40.722216, -73.987501],
        zoom: 12,
        scrollWheelZoom: false
      });
      
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
    mapboxToken: 'pk.eyJ1IjoibWFub2prdW1hcmoiLCJhIjoiY2ppaWZhenU5MGdvbTN1cGN4MDJmd3c4YiJ9.ZNaOan0Pe_gfXWsfphJ7Zg',
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
      '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    id: 'mapbox.streets'
  }).addTo(newMap);

  updateRestaurants();
}
/* window.initMap = () => {
  let loc = {
    lat: 40.722216,
    lng: -73.987501
  };
  self.map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: loc,
    scrollwheel: false
  });
  updateRestaurants();
} */

/**
 * Update page and map for current restaurants.
 */
updateRestaurants = () => {
  const cSelect = document.getElementById('cuisines-select');
  const nSelect = document.getElementById('neighborhoods-select');

  const cIndex = cSelect.selectedIndex;
  const nIndex = nSelect.selectedIndex;

  const cuisine = cSelect[cIndex].value;
  const neighborhood = nSelect[nIndex].value;

  DBHelper.fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, (error, restaurants) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      resetRestaurants(restaurants);
      fillRestaurantsHTML();
    }
  })
}

/**
 * Clear current restaurants, their HTML and remove their map markers.
 */
resetRestaurants = (restaurants) => {
  // Remove all restaurants
  self.restaurants = [];
  const ul = document.getElementById('restaurants-list');
  ul.innerHTML = '';

  // Remove all map markers
  if (self.markers) {
    self.markers.forEach(marker => marker.remove());
  }
  self.markers = [];
  self.restaurants = restaurants;
}

/**
 * Create all restaurants HTML and add them to the webpage.
 */
fillRestaurantsHTML = (restaurants = self.restaurants) => {
  const ul = document.getElementById('restaurants-list');
  restaurants.forEach(restaurant => {
    ul.append(createRestaurantHTML(restaurant));
  });
  addMarkersToMap();
}



const favoriteClickHandler = (evt, fav, restaurant) => {
  evt.preventDefault();
  const is_favorite = JSON.parse(restaurant.is_favorite); // set to boolean

  DBHelper.toggleFavorite(restaurant, (error, restaurant) => {
    console.log('got callback');
    if (error) {
      console.log('We are offline. Review has been saved to the queue.');
      showOffline();
    } else {
      console.log('Received updated record from DB Server', restaurant);
      DBHelper.updateIDBRestaurant(restaurant); // write record to local IDB store
    }
  });

  // set ARIA, text, & labels
  if (is_favorite) {
    fav.setAttribute('aria-pressed', 'false');
    fav.innerHTML = `Add ${restaurant.name} as a favorite`;
    fav.title = `Add ${restaurant.name} as a favorite`;
  } else {
    fav.setAttribute('aria-pressed', 'true');
    fav.innerHTML = `Remove ${restaurant.name} as a favorite`;
    fav.title = `Remove ${restaurant.name} as a favorite`;
  }
  fav.classList.toggle('active');
};
self.favoriteClickHandler = favoriteClickHandler;

/**
 * Create restaurant HTML with srcset and font awesome Icons .
 */
createRestaurantHTML = (restaurant) => {
  const li = document.createElement('li');
  
  const fav = document.createElement('button');
  fav.className = 'fav-control';
  fav.setAttribute('aria-label', 'favorite');
  
  // RegEx method tests if is_favorite is true or "true" and returns true
  // https://codippa.com/how-to-convert-string-to-boolean-javascript/
  if ((/true/i).test(restaurant.is_favorite)) {
    fav.classList.add('active');
    fav.setAttribute('aria-pressed', 'true');
    fav.title = `Remove ${restaurant.name} as a favorite`;
  } else {
    fav.setAttribute('aria-pressed', 'false');
    fav.title = `Add ${restaurant.name} as a favorite`;
  }

  fav.addEventListener('click', (evt) => {
    favoriteClickHandler(evt, fav, restaurant);
  }, false);

  li.append(fav);

  
  
  
  const image = document.createElement('img');
  image.className = 'restaurant-img';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.srcset = DBHelper.imageSrcsetForIndex(restaurant);             // added srcset
  image.sizes = "300px";
  const altText = restaurant.name + ' restaurant in ' + restaurant.neighborhood;
  image.title = altText;
  image.alt = altText;
  li.append(image);
  
  const div = document.createElement('div');
  div.className = "restaurant-info";
 
  const name = document.createElement('h2');
  const restaurantIcon ='<i class="fa fa-cutlery"></i>';  // added font awesome icons 
  name.innerHTML = restaurantIcon + restaurant.name;
  div.append(name);

  const neighborhood = document.createElement('p');
  const neighbourhoodIcon ='<i class="fa fa-h-square"></i>';      // added font awesome icons
  neighborhood.innerHTML = neighbourhoodIcon + restaurant.neighborhood;
  div.append(neighborhood);

  const address = document.createElement('p');
  const addressIcon ='<i class="fa fa-map-marker"></i>';    // added font awesome icons
  address.innerHTML = addressIcon + restaurant.address;
  div.append(address);

  li.append(div);

  const more = document.createElement('button');
  more.innerHTML = 'View Details';
  more.addEventListener('click', () => { window.location.href = DBHelper.urlForRestaurant(restaurant); });
  li.append(more);

  return li;
};


/**
 * Add markers for current restaurants to the map.
 */
addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.newMap);
    marker.on("click", onClick);
    function onClick() {
      window.location.href = marker.options.url;
    }
    self.markers.push(marker);
  });

} 
/* addMarkersToMap = (restaurants = self.restaurants) => {
  restaurants.forEach(restaurant => {
    // Add marker to the map
    const marker = DBHelper.mapMarkerForRestaurant(restaurant, self.map);
    google.maps.event.addListener(marker, 'click', () => {
      window.location.href = marker.url
    });
    self.markers.push(marker);
  });
} */

