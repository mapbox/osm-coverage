var tilereduce = require('tile-reduce');

var opts = {
  zoom: 15,
  sourceCover: 'osm',
  bbox: [68.42, 7.5, 97, 35.8],
  sources: [
    {
      name: 'osm',
      mbtiles: __dirname+'/downloads/latest.planet.mbtiles',
      raw: true
    }
  ],
  map: __dirname+'/coverage.js'
};

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
