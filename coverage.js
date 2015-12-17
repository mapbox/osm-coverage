var lineclip = require('lineclip'),
  lineDistance = require('turf-line-distance'),
  linestring = require('turf-linestring'),
  extent = require('turf-extent'),
  tilebelt = require('tilebelt'),
  tilecover = require('tile-cover'),
  which = require('which-polygon'),
  countries = require('./natural-earth-10m-countries.json');

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

module.exports = function (tileLayers, tile, write, done) {
  var bbox = tilebelt.tileToBBOX(tile);
  var country = findCountry(tile, countryIndex);

  var resultClasses = {};
  resultClasses[country] = {"classified": {}, "raw": {}};

  for (var i = 0; i < tileLayers.osm.osm.length; i++) {
    var ft = tileLayers.osm.osm.feature(i);

    if (ft.properties.highway) {
      handleRoad(ft.toGeoJSON(tile[0], tile[1], tile[2]), bbox, resultClasses[country]);
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

  if ((road.properties.highway === 'motorway' || road.properties.highway === 'primary' || road.properties.highway === 'secondary')
    && (road.properties.oneway === 'yes' || road.properties.oneway === 'true' || road.properties.oneway === '1')) {

    result.detected_carriageway = (result.carriageway || 0) + len;
  }

  result.raw[road.properties.highway] = (result.raw[road.properties.highway] || 0) + len;
  result.classified[classification] = (result.classified[classification] || 0) + len;

  return true;
}

function findCountry(tile, countryIndex) {
  var bbox = tilebelt.tileToBBOX(tile);
  var matchedCountries = countryIndex.bbox(bbox);

  return (matchedCountries.length > 0) ? matchedCountries[0].GEOUNIT : 'Unknown';
};
