var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var jimp = require('jimp');
var GoogleMapsAPI = require('googlemaps');
var SphericalMercator = require('sphericalmercator');
var Q = require('q')

var gmParams = {
  key: 'AIzaSyDQZztcmGw_bAmGJDHz3TRJOXzu8aJ7-Os',
  zoom: 18,
  scale: 2,
  size: '640x640',
  maptype: 'satellite'
};

var gmAPI = new GoogleMapsAPI(gmParams);

var merc = new SphericalMercator({
    size: 256
});

const TILE_SIZE = 1024; 
const OVERLAP = 1; 


function captureMap (trackName, nwLat, nwLng, xMax, yMax) {
  var basename = './output/' + trackName;
//  var nwLatLng = [-73.5288763, 45.5032226];
  var nwLatLng = [nwLng, nwLat];
  var factor = 2;
  for (y = 0; y < yMax; y++) {  
    for (x = 0; x < xMax; x++) {
      var centerPx = merc.px(nwLatLng, gmParams.zoom);
      centerPx[0] += x * TILE_SIZE / factor;  
      centerPx[1] += y * TILE_SIZE / factor;  
      var centerLatLng = merc.ll(centerPx, gmParams.zoom);
      console.log('Tile (' + y + ',' + x + '):' + centerLatLng[1] + ',' + centerLatLng[0]);  
      var filename = basename + '_' + y + '_' + x + '.png';
      saveImage(centerLatLng, filename);  
    }
  }

}


function saveImage(centerLatLng, filename) {
  gmParams.center = centerLatLng[1] + ',' + centerLatLng[0];
//  gmParams.center = '45.5092226,-73.5288763';

  var mapUrl = gmAPI.staticMap(gmParams); // return static map URL 
  var request = https.get(mapUrl, function(res) {
    var imagedata = ''
    res.setEncoding('binary')

    res.on('data', function(chunk) {
        imagedata += chunk
    })

    res.on('end', function() {
        fs.writeFile(filename, imagedata, 'binary', function(err) {
            if (err) throw err
            console.log('File saved: ' + filename )
        })
    })

  })
}


function helloPromise (url) {
  // promise-resolve-then-flow.js
  var deferred = Q.defer();
  deferred.promise.then(function (obj) {
      console.log(obj);
  });
  deferred.resolve("Illegal call: " + url);
}


async function readAllFiles (readPromises)  {  
  var images = await Q.all(readPromises); 
  return images;
}

function mergeImage(trackName, xMax, yMax) {
  var outFile = './output/' + trackName + '-Merged.png';
  const basename = './output/' + trackName;

  const size_x = TILE_SIZE + (xMax-1)/OVERLAP*TILE_SIZE;
  const size_y = TILE_SIZE + (yMax-1)/OVERLAP*TILE_SIZE;

  // Construct an array of read promises
//  var tileImages = [];
  var readPromises = [];
  for (y = 0; y < yMax; y++) {  
    for (x = 0; x < xMax; x++) {
//      tileImages[y*xMax + x] = new TileImage(x, y);
      var filename = basename + '_' + y + '_' + x + '.png';
      readPromises[y*xMax + x] = jimp.read(filename);
    }
  }
  // Once all file read resolved, construct the output file 
  var resultImage = new jimp(size_x, size_y);
  readAllFiles(readPromises)
  .then( function (images) {
    for (y = 0; y < yMax; y++) {  
      for (x = 0; x < xMax; x++) {
        var xshift = x*TILE_SIZE/OVERLAP;
        var yshift = y*TILE_SIZE/OVERLAP;      
        resultImage = resultImage.composite(images[y*xMax + x], xshift, yshift);
      }
    }
    return resultImage;
  })
  .then( (resultImage) => resultImage.write(outFile));

  console.log('File written: ' + outFile);  
}

module.exports.captureMap = captureMap;
//module.exports.saveImage = saveImage;
module.exports.mergeImage = mergeImage;
module.exports.hello = helloPromise;

/*
//    var mapUrl = 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDQZztcmGw_bAmGJDHz3TRJOXzu8aJ7-Os&zoom=18&size=640x640&scale=2&maptype=satellite&center=' + track.lat() + ',' + track.lng();

//    var track = new google.maps.LatLng(45.5032226,-73.5288763);
//      var url = 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDQZztcmGw_bAmGJDHz3TRJOXzu8aJ7-Os&zoom=18&size=640x640&scale=2&maptype=satellite&center=45.5032226,-73.5288763';
//    var url = 'https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDQZztcmGw_bAmGJDHz3TRJOXzu8aJ7-Os&zoom=18&size=640x640&scale=2&maptype=satellite&center=' + track.lat() + ',' + track.lng();
//    document.getElementById('tile').src = url;      
//        <img id="tile" alt="hello"></img>


function createInfoWindowContent(latLng, zoom) {
  var scale = 1 << zoom;

  var worldCoordinate = project(latLng);

  var pixelCoordinate = new google.maps.Point(
      Math.floor(worldCoordinate.x * scale),
      Math.floor(worldCoordinate.y * scale));

  var tileCoordinate = new google.maps.Point(
      Math.floor(worldCoordinate.x * scale / TILE_SIZE),
      Math.floor(worldCoordinate.y * scale / TILE_SIZE));

  return [
    'Chicago, IL',
    'LatLng: ' + latLng,
    'Zoom level: ' + zoom,
    'World Coordinate: ' + worldCoordinate,
    'Pixel Coordinate: ' + pixelCoordinate,
    'Tile Coordinate: ' + tileCoordinate
  ].join('<br>');
}
*/
