//__________________________________________
//
//         PLANTS & MACHINES
//            beta v-0.0.1
//
//            Martin Breuer
// 
//                GPLv2
//
//__________________________________________

// This is a DUMMY SERVER to be used w/o bot data from serial and w/o Database!!!

// Includes 

var http = require('http');
var fs = require('fs');
var path = require('path');
var faye = require('faye');

// Creating web server serving http and lib files

var httpserver = http.createServer(function (request, response) {
     
    var filePath = '.' + request.url;
    if (filePath == './')
        filePath = './index.html';
         
    var extname = path.extname(filePath);
    var contentType = 'text/html';
    switch (extname) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
    }
     
    path.exists(filePath, function(exists) {
     
        if (exists) {
            fs.readFile(filePath, function(error, content) {
                if (error) {
                    response.writeHead(500);
                    response.end();
                }
                else {
                    response.writeHead(200, { 'Content-Type': contentType });
                    response.end(content, 'utf-8');
                }
            });
        }
        else {
            response.writeHead(404);
            response.end();
        }
    });
     
})

httpserver.listen(80);

var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(httpserver);


// start a fayeclient for client-request, too
var aq_override = new faye.Client('/faye');
aq_override.subscribe('/aq_override', function(message) {
console.log(message);
});

var hy_override = new faye.Client('/faye');
hy_override.subscribe('/hy_override', function(message) {
console.log(message);
});

// add plain jSON
// AQ

var aquaponic = {"id":"520e6b76d928fdb60c000309","meta":{"date":"Fri, 16 Aug 2013 18:12:06 GMT"},"msg":{"err":"","not":"","deb":false },"ref":{"refTemp":24,"refPh":6.5,"refAi":[ 30, 60 ],"refCy":[ 25, 5 ] },"actor":{"bubbler":{"state":false,"dur":9},"heater":{"state":true,"dur":20},"pump":{"state":false,"dur":20}},"sensor":{"temp":24.1875,"ph": 6.81 } }

// HY

var hydroponic = {"id": "520e67de34f3069e0c00015a","meta": { "date": "Fri, 16 Aug 2013 17:56:46 GMT" },"msg": { "err": "", "not": "", "deb": false },"ref":{ "refTemp": 30,"refHumid": 40,"refLightInt": 600,"refFl": 10,"refLi": [ 480, 960 ],"refBu": [ 41, 20 ] },"actor":{ "led": { "state": true, "dur": 20 },"bubbler": { "state": false, "dur": 40 },"solin": { "state": false },"solout": { "state": false },"humidifier": { "state": false },"fan": { "state": true, "no": 4, "dur": 43 },"fanBtm": {"state":0, "dur": 23}, "motor": { "state": true, "dir": "up" } },"sensor":{ "tempTop": 23.6,"humidTop": 66.4,"tempBtm": 26,"humidBtm": 58,"lightInt": 749,"water": false,"bumper": false,"dist": 10,"lastFlood": 4 } }


setInterval(function () {

  // renew the date string, so we have moving graphs
  aquaponic.meta.date = new Date().toString();
  hydroponic.meta.date = new Date().toString();

  // start a fayeserver and send plain jSON
  bayeux.getClient().publish('/hydroponic/live', JSON.stringify(hydroponic));
  bayeux.getClient().publish('/aquaponic/live', JSON.stringify(aquaponic));
  
}, 1000) // delay for a second


