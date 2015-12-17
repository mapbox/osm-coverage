var argv = require('minimist')(process.argv.slice(2));

var data = '';
var separator = argv.separator || ','
var headerLine = argv.headerline;
process.stdin.on('data', function (chunk) {
  data += chunk;
}).on('end', function () {
  var json = JSON.parse(data);
  var countries = Object.keys(json);
  countries.sort();

  var header = ["Name", "Motor Road Miles - Corrected for Dual Carriageways", "Motor Road Miles", "Path Miles", "Unclassified Miles"]
  console.log(header.join(separator));

  if (headerLine) {
    var hl = [];
    for (var i = 0; i < header.length; i++) {
      hl.push(headerLine);
    }
    console.log(hl.join(separator));
  }

  for (var i = 0; i < countries.length; i++) {
    var cdata = json[countries[i]];
    var carriagewayCorrection = (cdata.detected_carriageway || 0) / 2;
    
    console.log([
      countries[i],
      (cdata.classified.motor - carriagewayCorrection) || 0,
      cdata.classified.motor || 0,
      cdata.classified.paths || 0,
      cdata.classified.unclassified || 0
    ].join(separator));
  }
  
});
