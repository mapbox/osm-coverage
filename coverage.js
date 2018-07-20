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
  motorway: "motor",
  trunk: "motor",
  motorway_link: "motor",
  trunk_link: "motor",
  primary: "motor",
  secondary: "motor",
  tertiary: "motor",
  primary_link: "motor",
  secondary_link: "motor",
  tertiary_link: "motor",
  service: "motor",
  residential: "motor",
  unclassified: "motor",
  living_street: "motor",
  road: "motor",

  footway: "paths",
  cycleway: "paths",
  path: "paths",
  bridleway: "paths",
  steps: "paths",
  sidewalk: "paths"
};

var amenityClasses = {
  restaurant: "restaurant",
  fuel: "fuel",
  cafe: "cafe",
  fast_food: "fast_food",
  place_of_worship: "place_of_worship",
  bank: "bank",
  pharmacy: "pharmacy",
  post_office: "post_office",
  hospital: "hospital",
  doctors: "doctors",
  public_building: "public_building",
  community_centre: "community_centre",
  clinic: "clinic",
  library: "library",
  dentist: "dentist",
  theatre: "theatre",
  parking: "parking",
  kindergarten: "education",
  school: "education",
  college: "education",
  university: "education",
  bar: "bars",
  pub: "bars",
  nightclub: "bars"
}

module.exports = function (tileLayers, tile, write, done) {
  var bbox = tilebelt.tileToBBOX(tile);
  var country = findCountry(tile, countryIndex);

  var resultClasses = {};
  resultClasses[country] = {"roads": {"classified": {}, "raw": {}}, "places": {"classified": {}, "amenity_type": {}}};

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
  // console.log(geotype)
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

  result.roads.raw[road.properties.highway] = (result.roads.raw[road.properties.highway] || 0) + len;
  result.roads.classified[classification] = (result.roads.classified[classification] || 0) + len;

  if (road.properties.oneway !== ('no' || 0 || -1)) {
    result.roads.raw['oneway'] = (result.roads.raw['oneway'] || 0) + len;
  }

  if (!road.properties.oneway) {
    result.roads.raw['onewayness_unknown'] = (result.roads.raw['onewayness_unknown'] || 0) + len;
  }  

  if (road.properties.maxspeed) {
    result.roads.raw['maxspeed'] = (result.roads.raw['maxspeed'] || 0) + len;
  }

  if (road.properties.surface) {
    result.roads.raw['surface'] = (result.roads.raw['surface'] || 0) + len;
  }

  return true;
}


function handlePlace(place, bbox, result) {
  var geotype = place.geometry.type;
  var classification = amenityClasses[place.properties.amenity] || 'amenity_unclassified';
  
  if (place.properties.highway) return false;

  var count = 0;

  if (geotype == 'Point') {
    result.places.classified['points'] = (result.places.classified['points'] || 0) + 1;
  }

  if ((geotype == 'Point') && (place.properties.building)) {
    result.places.classified['point_and_building'] = (result.places.classified['point_and_building'] || 0) + 1;
  }

  if (place.properties.building) {
    result.places.classified['building'] = (result.places.classified['building'] || 0) + 1;
  }

  if (place.properties.amenity) {
    result.places.classified['amenity'] = (result.places.classified['amenity'] || 0) + 1;
    result.places.amenity_type[classification] = (result.places.amenity_type[classification] || 0) + 1;
  }

  if ((place.properties.building) && (place.properties.amenity)) {
    result.places.classified['amenity_and_building'] = (result.places.classified['amenity_and_building'] || 0) + 1;
  }

  if (place.properties.building === ('house' || 'residential' || 'apartments' || 'hut')) {
    result.places.classified['building_residential'] = (result.places.classified['building_residential'] || 0) + 1;
  }

}

function findCountry(tile, countryIndex) {
  var bbox = tilebelt.tileToBBOX(tile);
  var matchedCountries = countryIndex.bbox(bbox);

  return (matchedCountries.length > 0) ? matchedCountries[0].GEOUNIT : 'Unknown';
};
