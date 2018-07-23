var lineclip = require('lineclip'),
  lineDistance = require('turf-line-distance'),
  linestring = require('turf-linestring'),
  extent = require('turf-extent'),
  tilebelt = require('tilebelt'),
  tilecover = require('tile-cover'),
  which = require('which-polygon'),
  countries = require('./data/natural-earth-10m-countries.json');

var countryIndex = which(countries);

// Mappings for general classifications
var roadClasses = {
  motorway: "road_class_motor",
  trunk: "road_class_motor",
  motorway_link: "road_class_motor",
  trunk_link: "road_class_motor",
  primary: "road_class_motor",
  secondary: "road_class_motor",
  tertiary: "road_class_motor",
  primary_link: "road_class_motor",
  secondary_link: "road_class_motor",
  tertiary_link: "road_class_motor",
  service: "road_class_motor",
  residential: "road_class_motor",
  unclassified: "road_class_motor",
  living_street: "road_class_motor",
  road: "road_class_motor",

  footway: "road_class_paths",
  cycleway: "road_class_paths",
  path: "road_class_paths",
  bridleway: "road_class_paths",
  steps: "road_class_paths",
  sidewalk: "road_class_paths"
};

var amenityClasses = {
  restaurant: "amenity_restaurant",
  fuel: "amenity_fuel",
  cafe: "amenity_cafe",
  fast_food: "amenity_fast_food",
  place_of_worship: "amenity_place_of_worship",
  bank: "amenity_bank",
  pharmacy: "amenity_pharmacy",
  post_office: "amenity_post_office",
  hospital: "amenity_hospital",
  doctors: "amenity_doctors",
  public_building: "amenity_public_building",
  community_centre: "amenity_community_centre",
  clinic: "amenity_clinic",
  library: "amenity_library",
  dentist: "amenity_dentist",
  theatre: "amenity_theatre",
  parking: "amenity_parking",
  kindergarten: "amenity_education",
  school: "amenity_education",
  college: "amenity_education",
  university: "amenity_education",
  bar: "amenity_bars",
  pub: "amenity_bars",
  nightclub: "amenity_bars"
}

module.exports = function (tileLayers, tile, write, done) {
  var bbox = tilebelt.tileToBBOX(tile);
  var country = findCountry(tile, countryIndex);

  var resultClasses = {};
  resultClasses[country] = {};

  for (var i = 0; i < tileLayers.osm.osm.length; i++) {
    var ft = tileLayers.osm.osm.feature(i);
    // console.log(ft.properties)

    if (ft.properties.highway) {
      handleRoad(ft.toGeoJSON(tile[0], tile[1], tile[2]), bbox, resultClasses[country]);
    }
    
    if (!ft.properties.highway) {
      handlePlace(ft.toGeoJSON(tile[0], tile[1], tile[2]), bbox, resultClasses[country]);
    }    
  }

  done(null, resultClasses);
};


/**
 * Handles a feature as a potential road. If it is a road, we update the miles count
 * for the appropriate sub-class, and return true
 */
function handleRoad(road, bbox, result) {
  var geotype = road.geometry.type;

  var classification = roadClasses[road.properties.highway] || 'unclassified';
  if (!road.properties.highway || geotype !== "LineString" && geotype !== "MultiLineString") return false;

  var len = 0;

  if (geotype === 'LineString') {
    len = lineDistance(road, 'miles');

  } else if (geotype === 'MultiLineString') {
    for (var i = 0; i < road.geometry.coordinates.length; i++) {
      len += lineDistance(linestring(road.geometry.coordinates[i]), 'miles');
    }
  }

  var highwayTypeNew = 'road_' + road.properties.highway

  result[highwayTypeNew] = (result[highwayTypeNew] || 0) + len;
  result[classification] = (result[classification] || 0) + len;

  if (road.properties.oneway !== ('no' || 0 || -1)) {
    result['roads_oneway'] = (result['roads_oneway'] || 0) + len;
  }

  if (!road.properties.oneway) {
    result['roads_onewayness_unknown'] = (result['roads_onewayness_unknown'] || 0) + len;
  }  

  if (road.properties.maxspeed) {
    result['roads_maxspeed'] = (result['roads_maxspeed'] || 0) + len;
  }

  if (road.properties.surface) {
    result['roads_surface'] = (result['roads_surface'] || 0) + len;
  }

  return true;
}


function handlePlace(place, bbox, result) {
  var geotype = place.geometry.type;
  var classification = amenityClasses[place.properties.amenity] || 'amenity_unclassified';
  
  if (place.properties.highway) return false;

  var count = 0;

  if (geotype == 'Point') {
    result['places_points'] = (result['places_points'] || 0) + 1;
  }

  if ((geotype == 'Point') && (place.properties.building)) {
    result['places_point_and_building'] = (result['places_point_and_building'] || 0) + 1;
  }

  if (place.properties.building) {
    result['places_building'] = (result['places_building'] || 0) + 1;
  }

  if (place.properties.amenity) {
    result['places_amenity'] = (result['places_amenity'] || 0) + 1;
    result[classification] = (result[classification] || 0) + 1;
  }

  if ((place.properties.building) && (place.properties.amenity)) {
    result['places_amenity_and_building'] = (result['places_amenity_and_building'] || 0) + 1;
  }

  if (place.properties.building === ('house' || 'residential' || 'apartments' || 'hut')) {
    result['places_building_residential'] = (result['places_building_residential'] || 0) + 1;
  }

}

function findCountry(tile, countryIndex) {
  var bbox = tilebelt.tileToBBOX(tile);
  var matchedCountries = countryIndex.bbox(bbox);

  return (matchedCountries.length > 0) ? matchedCountries[0].GEOUNIT : 'Unknown';
};
