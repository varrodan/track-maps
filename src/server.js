var http = require('http');
var https = require('https');
var url = require('url');
var fs = require('fs');
var iman = require('./imageman.js');

/*
function initMap() {
  var url = 'https://maps.googleapis.com/maps/api/staticmap?zoom=18&size=640x640&scale=2&maptype=satellite&center=45.5032226,-73.5288763';
  document.getElementById('tile').src = url;
  var track = new google.maps.LatLng(45.5032226,-73.5288763);

}
*/

http.createServer(function (req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});
  var q = url.parse(req.url, true);
  var pathname = q.pathname;
  var pos = q.query;
  var trackName = pos.track;
  var lat = pos.lat;
  var lng = pos.lng;
  var xMax = pos.x;
  var yMax = pos.y;
  fs.readFile('./src/prefix.html', function(err, data) {
    if (err) {
      res.writeHead(404, {'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } else {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write(data);
      res.end();    
    }
//    if (trackName != undefined && lat != undefined && lng != undefined &&
//        xMax != undefined && yMax != undefined) 
//      console.log(trackName + ':' + lat + ',' +  lng + ':' +  xMax + 'x' + yMax);
    if (pathname.includes("merge") && trackName != undefined && xMax != undefined && yMax != undefined) {
        console.log('Merging track:' + trackName + ' : ' + xMax +'x' + yMax);
    //    iman.mergeImage('Montreal', 2,2);
        iman.mergeImage(trackName, xMax, yMax);
    } else if (pathname.includes("capture") && trackName != undefined && lat != undefined && lng != undefined &&
        xMax != undefined && yMax != undefined) {
        console.log('Capturing track:' + trackName + ' : ' + xMax +'x' + yMax);
    //    iman.captureMap('Montreal', -73.5288763, 45.5032226, 2, 2);
        iman.captureMap(trackName, lat, lng, xMax, yMax);
    } else {
        iman.hello(req.url);
    }

  });
//  output += '<img id="tile" alt="hello" src="https://maps.googleapis.com/maps/api/staticmap?key=AIzaSyDQZztcmGw_bAmGJDHz3TRJOXzu8aJ7-Os&zoom=18&size=640x640&scale=2&maptype=satellite&center=45.5032226,-73.5288763"></img>';
}).listen(8090);

