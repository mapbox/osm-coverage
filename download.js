var split = require('split'),
  through2 = require('through2'),
  unzip = require('unzip2'),
  path = require('path'),
  request = require('request'),
  fs = require('fs'),
  shapefile = require('shapefile-stream'),
  join = require('join-stream'),
  zlib = require('zlib'),
  ProgressBar = require('progress');


if (process.argv[2] === '--all' || process.argv[2] === '--countries') {
  downloadShpToJson('http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries.zip',
    'ne_10m_admin_0_countries.shp',
    'natural-earth-10m-countries.json');
}

if (process.argv[2] === '--all' || process.argv[2] === '--states') {
  downloadShpToJson('http://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_1_states_provinces.zip',
    'ne_10m_admin_1_states_provinces.shp',
    'natural-earth-10m-states.json');
}

if (process.argv[2] === '--all' || process.argv[2] === '--osm') {
  downloadOsmQa();
}


function downloadOsmQa() {
  var output = fs.createWriteStream(path.join(__dirname, 'latest.planet.mbtiles'));
  request({
    method: 'HEAD',
    uri: 'https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz'
  }, function(err, res, dt) {
    var len = Number(res.toJSON().headers['content-length']);
    var progress = new ProgressBar('[:bar] :percent ETA :etas', {
      total: len
    });
    var stream = request('https://s3.amazonaws.com/mapbox/osm-qa-tiles/latest.planet.mbtiles.gz');
    stream.on('data', function(data) {
      progress.tick(data.length);
    });

    stream.pipe(zlib.createGunzip())
      .pipe(output)

  })

}

function downloadShpToJson(url, shp, json) {
  var output = fs.createWriteStream(path.join(__dirname, json));
  output.write('{"type": "FeatureCollection", "features": [');

  // Download shp, unzip, -> read to geojson
  request(url)
    .pipe(unzip.Extract({
      path: path.join(__dirname, 'downloads')
    }))
    .on('close', function() {
      shapefile.createReadStream(path.join(__dirname, 'downloads/' + shp))
        .pipe(shapefile.stringify)
        .pipe(join(','))
        .pipe(output)
        .on('close', function() {
          console.log("Done");
          fs.appendFileSync(path.join(__dirname, json), ']}');
        })
    });
}
