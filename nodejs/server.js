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

// Includes 

var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/beta_okt_13');

var SerialPort  = require('serialport2').SerialPort;
var hydroponicPort = '/dev/hydroponic';
var hydroponicSerial;
var aquaponicPort = '/dev/aquaponic';
var aquaponicSerial;
var http = require('http');
var fs = require('fs');
var path = require('path');
var faye = require('faye');

// database schema & model

var hydroponicSchema = mongoose.Schema({
  sensor: 
  { tempTop           : Number
  , humidTop          : Number
  , tempBtm           : Number
  , humidBtm          : Number
  , lightInt          : Number
  , water             : Boolean
  , bfWater           : Boolean
  , bumper            : Boolean
  , dist              : Number
  , lastFlood         : Number 
  },
  actor: 
  { motor:       
    { state           : Boolean
    , dir             : String
    }
  , fan:                
    { state           : Boolean
    , no              : Number
    , dur             : Number
    }
  , fanBtm:
    { state           : Boolean
    , dur             : Number
    } 
  , humidifier:
    { state           : Boolean
    }
  , solout:
    { state           : Boolean
    }
  , solin:
    { state           : Boolean
    }
  , bubbler:
    { state           : Boolean
    , dur             : Number
    }
  , led:
    { state           : Boolean
    , dur             : Number
    }
  },
  ref:
  { refTemp           : Number
  , refHumid          : Number
  , refLightInt       : Number
  , refFl             : Number
  , refBu             : [Number]
  , refLi             : [Number]
  },
  msg: 
  { err               : String
  , not               : String
  , deb               : Boolean 
  },
  meta:
  { date              : { type: Date, default : Date.now } }
});

var aquaponicSchema = mongoose.Schema({
  sensor:
  { temp              : Number
  , ph                : Number
  },
  actor:
  { pump:
    { state           : Boolean
    ,  dur            : Number
    }
  , heater:
    { state           : Boolean
    ,  dur            : Number
    }
  , bubbler:
    { state           : Boolean
    ,  dur            : Number
    }
  },
  ref:
  { refTemp           : Number
  , refPh             : Number
  , refCy             : [Number]
  , refAi             : [Number]
  },
  msg:
  { err               : String
  , not               : String
  , deb               : Boolean
  },
  meta:
  { date              : { type: Date, default : Date.now } }
});

var hydroponicDataSample = mongoose.model('hydroponicDataSample', hydroponicSchema);
var aquaponicDataSample = mongoose.model('aquaponicDataSample', aquaponicSchema);

// connect to database

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  console.log("hail all database conections")
});

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

// start a fayeserver
 
var bayeux = new faye.NodeAdapter({mount: '/faye', timeout: 45});
bayeux.attach(httpserver);

// start a fayeclient for client-request, too
var override = new faye.Client('/faye');
override.subscribe('/aq_override', function(message) {
  aquaponicSerial.write(message);
});

var hy_override = new faye.Client('/faye');
hy_override.subscribe('/hy_override', function(message) {
  hydroponicSerial.write(message);
});


/*

var client = new faye.Client('/faye');
client.subscribe('/request', function(message) {



  // get the last 24h of data for live view (client: on reload and on live button)

  if (message.live == true) { 
    console.log ("live");

    var lastDay = DataSample.find({ date: { $gte: new Date(message.from), $lte: new Date(message.to) }}).sort({_id: 1}).skip(1000).limit(50);
    lastDay.exec(function (err, answer) {    
    if (err) console.log('request data query error');
      for (i = 0; i < answer.length; i++) {
        bayeux.getClient().publish('/data/live', {
          date: answer[i].date.getTime()
        , temp: answer[i].temp
        , humid: answer[i].humid
        , lastFlood: answer[i].lastFlood
        , id: answer[i]._id
        }); 
      };  
    }); 
  }


  // get the requested daterange of date (client: datepicker)

  else {
    console.log(message.from);
    console.log(message.to);

    var lastDay = DataSample.find({ date: { $gte: new Date(message.from), $lte: new Date(message.to) }}).sort({_id: 1}).skip(3600).limit(200);
    lastDay.exec(function (err, answer) {
    if (err) console.log('request data query error');
      for (i = 0; i < answer.length; i++) {
        bayeux.getClient().publish('/data/live', {
          date: answer[i].date.getTime()
        , temp: answer[i].temp
        , humid: answer[i].humid
        , lastFlood: answer[i].lastFlood
        , id: answer[i]._id
        });
      };
    });
  }

});

*/

// Setting up Serial Port for hydroponic

var connectHy = function() {
   hydroponicSerial = new SerialPort();
   hydroponicSerial.open(hydroponicPort, { 
     baudRate: 9600, 
     dataBits: 8, 
     parity: 'none', 
     stopBits: 1, 
     flowControl: false 
  });

// get last db entry and send it to HY
// this allows for a resume functionallity


var lastData = hydroponicDataSample.findOne().sort({_id: -1});
lastData.exec(function (err, answer) {
  if (err) {
    console.log('can not access db for resume');
  } else {
    // send to HY
    var resumeMsg = '{"msg":' + JSON.stringify(answer.msg) + '}';
    var resumeAct = '{"actor":' + JSON.stringify(answer.actor) + '}';
    var resumeRef = '{"ref":' + JSON.stringify(answer.ref) + '}';
    var resumeFl = '{"sensor":{"lastFlood":' + JSON.stringify(answer.sensor.lastFlood) + '}}';
  
    console.log('resuming from disconnect!');

    setTimeout (function(){
      console.log ("sending ref...");
      hydroponicSerial.write(resumeRef);
    }, 500);

    setTimeout (function(){ 
      console.log ("sending msg...");
      hydroponicSerial.write(resumeMsg); 
    }, 2000);

    setTimeout (function(){
      console.log ("sending actor...");
      hydroponicSerial.write(resumeAct);
    }, 3500);

    setTimeout (function(){
      console.log ("sending lastFlood...");
      hydroponicSerial.write(resumeFl);
    }, 5000);
  }
});


// listening to hydroponic serial port

var readDataHydroponic = '';
var lastHydroponic;

// call back when data is received

hydroponicSerial.on('data', function (data) {
  readDataHydroponic += data.toString();

  // get rid of bytes left over in the ARD tx buffer
  if (readDataHydroponic.indexOf('\r') != 0) {
    readDataHydroponic = '';
  } else if (readDataHydroponic.indexOf('\r') == 1) {
    readDataHydroponic = readDataHydroponic.substring(readDataHydroponic.indexOf('\r')+1, readDataHydroponic.length); 
  }

  var countCrHydroponic = readDataHydroponic.match(/\r/gi);

  if (countCrHydroponic !== null && countCrHydroponic.length == 2) {
    cleanDataHydroponic = readDataHydroponic.substring(readDataHydroponic.indexOf('\r')+1, readDataHydroponic.lastIndexOf('\r'));
    readDataHydroponic = '';

    try {
      var hydroponic = JSON.parse(cleanDataHydroponic);
    } catch (err) {
      // error parsing
      console.log("error parsing HY serial data");
    }

    if (typeof hydroponic == 'undefined') {
      console.log("error, HY object not valid");
    } else {

      // save serial data to mongodb

      if (hydroponic !== lastHydroponic) {
        var hydroponicDataInstance = new hydroponicDataSample(hydroponic);
        hydroponicDataInstance.save(function (err) {
          if (err){
            console.log('error writing to HY DB!');
          } else {
            //console.log('HY written to DB!');
          }
        });
      }

      console.log(hydroponicDataInstance);
      // publish to faye clients
      bayeux.getClient().publish('/hydroponic/live', JSON.stringify(hydroponicDataInstance));

      // when a floodcycle is detected through solout == true, tell AQ to turn on pump
      if (typeof lastHydroponic != 'undefined' && hydroponic.actor.solout.state == true && lastHydroponic.actor.solout.state == false) {
        aquaponicSerial.write('{"ref":{"deb":1}}{"actor":{"pump":{"state":1}}}');
      } else if (typeof lastHydroponic != 'undefined' && hydroponic.actor.solout.state == false && lastHydroponic.actor.solout.state == true) {
        aquaponicSerial.write('{"ref":{"deb":0}}{"actor":{"pump":{"state":0}}}');
      }

      lastHydroponic = hydroponic;
    }
  } // END entire string check
}); // END on serial evend


hydroponicSerial.on('close', function(){
  console.log('--------------------------------------');
  console.log('HY PORT CLOSED');
  reconnectHy();
});

hydroponicSerial.on('error', function (err) {
  console.log('--------------------------------------');
  console.error("error", err);
  reconnectHy();
});

}


// CHECK FOR HY CONNECTION ERRORS

var reconnectHy = function () {
//  hydroponicSerial = new SerialPort();
  console.log('--------------------------------------');
  console.log('INITIATING RECONNECT');
  setTimeout(function(){ 
    console.log('--------------------------------------');
    console.log('CONNECTING TO HY');
    connectHy();
  }, 10000);
};

connectHy();


// setting up serial port for aquaponic

var connectAq = function() {
   aquaponicSerial = new SerialPort();
   aquaponicSerial.open(aquaponicPort, {
     baudRate: 9600,
     dataBits: 8,
     parity: 'none',
     stopBits: 1,
     flowControl: false
  });


// listening to aquaponic serial port

var readDataAquaponic = ''; 
var lastAquaponic; 

// call back when data is received

aquaponicSerial.on('data', function (data) {
  readDataAquaponic += data.toString();

  // get rid of bytes left over in the ARD tx buffer
  if (readDataAquaponic.indexOf('\r') != 0) {
    readDataAquaponic = '';
  } else if (readDataAquaponic.indexOf('\r') == 1) {
    readDataAquaponic = readDataAquaponic.substring(readDataAquaponic.indexOf('\r')+1, readDataAquaponic.length);
  }


  var countCrAquaponic = readDataAquaponic.match(/\r/gi);

  if (countCrAquaponic !== null && countCrAquaponic.length == 2) {
    cleanDataAquaponic = readDataAquaponic.substring(readDataAquaponic.indexOf('\r')+1, readDataAquaponic.lastIndexOf('\r'));
    readDataAquaponic = '';

    try {
      var aquaponic = JSON.parse(cleanDataAquaponic);
    } catch (err) {
      // error parsing
      console.log("error parsing AQ serial data");
    }

    if (typeof aquaponic == 'undefined') { 
      console.log("error, AQ object not valid");
    } else {
   
      // save serial data to mongodb

      if (aquaponic !== lastAquaponic) {
        var aquaponicDataInstance = new aquaponicDataSample(aquaponic);
        aquaponicDataInstance.save(function (err) {
          if (err){ 
            console.log('error writing to AQ DB!');
          } else {
            //console.log('AQ written to DB!');
          }
        });
      }

      console.log(aquaponicDataInstance);
      // publish to faye clients
      bayeux.getClient().publish('/aquaponic/live', JSON.stringify(aquaponicDataInstance));
      
      lastAquaponic = aquaponic;
    }
  } // END entire string check
}); // END on serial evend

aquaponicSerial.on('close', function(){
  console.log('--------------------------------------');
  console.log('AQ PORT CLOSED');
  reconnectAq();
});

aquaponicSerial.on('error', function (err) {
  console.log('--------------------------------------');
  console.error("error", err);
  reconnectAq();
});


}

// CHECK FOR AQ CONNECTION ERRORS

var reconnectAq = function () {
  console.log('--------------------------------------');
  console.log('INITIATING RECONNECT');
  setTimeout(function(){
    console.log('--------------------------------------');
    console.log('CONNECTING TO AQ');
    connectAq();
  }, 10000);
};

connectAq();

