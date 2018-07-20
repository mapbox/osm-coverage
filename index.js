var tilereduce = require('tile-reduce'),
  path = require('path'),
  argv = require('minimist')(process.argv.slice(2));
  fs = require('fs');

var opts = {
  zoom: 12,
  sources: [
    {
      name: 'osm',
      mbtiles: path.join(__dirname, 'data/costa_rica.mbtiles'),
      raw: true
    }
  ],
  map: __dirname+'/coverage.js'
};

if (argv.area) opts.bbox = JSON.parse(argv.area);

var countries_path = path.join(__dirname, 'data/ne_50m_admin_0_countries.geojson');
var contents = fs.readFileSync(countries_path);
var countries = JSON.parse(contents);

var counts = {};

function mapResults(result, saveTo) {
  for (var i in result) {
    if (typeof result[i] === 'number') {
      saveTo[i] = (saveTo[i] || 0) + result[i];
    } else {
      if (!saveTo[i]) saveTo[i] = {};
      mapResults(result[i], saveTo[i]);
    }
  }
}

var tilereduce = tilereduce(opts)
.on('reduce', function(result){
  mapResults(result, counts)
})
.on('end', function(){
  // Works
  countries.features.forEach(country =>
    // { console.log(country.properties) })
    { country.properties['stats'] = counts[country.properties.name] })

  // Doesn't work
  var found = countries.find(function(element) {
    return element.features['properties']['name'] === 'Costa Rica';
  });
  console.log(found)

});
