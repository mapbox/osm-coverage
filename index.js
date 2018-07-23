var tilereduce = require('tile-reduce'),
  path = require('path'),
  argv = require('minimist')(process.argv.slice(2));
  fs = require('fs');

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

var stdCountries = {
    "United States":"United States of America",
    "Dem. Rep. Congo":"Democratic Republic of the Congo",
    "Congo":"Republic of the Congo",
    "Central African Rep.":"Central African Republic",
    "S. Sudan":"South Sudan",
    "Eq. Guinea":"Equatorial Guinea",
    "Côte d'Ivoire":"Ivory Coast",
    "Serbia":"Republic of Serbia",
    "Bosnia and Herz.":"Bosnia and Herzegovina",
    "Czech Rep.":"Czechia",
    "Lao PDR":"Laos",
    "Korea":"South Korea",
    "Dem. Rep. Korea":"North Korea",
    "Dominican Rep.":"Dominican Republic"
}

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

    // Standardize country names between the datasets
    if (country.properties['name'] in stdCountries) {
      country.properties['name'] = stdCountries[country.properties['name']]
    }

    // Copy the stats and stats per pop to country properties
    if (Object.keys(counts).indexOf(country.properties.name) > -1) {
      Object.keys(counts[country.properties.name]).forEach (s => {
        country.properties[s] = counts[country.properties.name][s]
        country.properties[s+"_per_pop"] = counts[country.properties.name][s] / country.properties.pop_est
      });
   }

    count +=1
    
    if (count >= (countries.features.length)) {
      console.log(JSON.stringify(countries))
    }

    // if (count >= (countries.features.length)) {
    //   var found = countries.features.find(function(element) {  
    //     return element['properties']['name'] === 'United States of America';
    //   });
    //   console.log(found['properties'])
    // }
  });

});
