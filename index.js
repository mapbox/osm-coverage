var tilereduce = require('tile-reduce'),
  path = require('path'),
  argv = require('minimist')(process.argv.slice(2));

var opts = {
  zoom: 12,
  sources: [
    {
      name: 'osm',
      mbtiles: path.join(__dirname, 'data/latest.planet.mbtiles'),
      raw: true
    }
  ],
  map: __dirname+'/coverage.js'
};

if (argv.area) opts.bbox = JSON.parse(argv.area);
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
.on('reduce', function(result, tile){
  mapResults(result, counts)
})
.on('end', function(error){
  console.log(JSON.stringify(counts));
});
