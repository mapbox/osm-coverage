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
  var count = 0
  countries.features.forEach(country => {
    country.properties['stats'] = counts[country.properties.name]

    // if (!typeof country.properties['stats'] === "undefined") {
    //     Object.keys(country.properties.stats).forEach(statL1 => {
    //       console.log(country.properties.stats[statL1]);
    //     });      
    // }
    // console.log(country.properties['stats'])

    count +=1

    if (count >= (countries.features.length)) {
      var found = countries.features.find(function(element) {
        return element['properties']['name'] === 'Costa Rica';
      });
      console.log(found)
    }
  });



});
