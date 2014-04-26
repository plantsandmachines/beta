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

$(document).ready(function(){

// set up arrays for the plot
var tempTopData = new Array();
var tempBtmData = new Array();
var tempRefData = new Array();

var humidTopData = new Array();
var humidBtmData = new Array();
var humidRefData = new Array();

var lightIntData = new Array();
var lightRefData = new Array();

var benchmark1TempData = new Array();
var benchmark1HumidData = new Array();
var benchmark1IntData = new Array();

var benchmark2TempData = new Array();
var benchmark2HumidData = new Array();
var benchmark2IntData = new Array();

var zero = new Array();

var led = new Array();
var fan = new Array();
var fanBtm = new Array();
var bubbler = new Array();
var humidifier = new Array();
var solin = new Array();
var solout = new Array();
var motor = new Array();
var camera = new Array();


var resolution = 100;

// listen to fayechannel (should be only the appropreate channel per page...)
var client = new Faye.Client("/faye");
client.subscribe( "/hydroponic/live", function(message) {


  // ### Get Data from server

  // trasfer the json string to an object
  message = jQuery.parseJSON(message);
 
  // make UTC timestamp to unix time stamp... TODO: add 2h for CET
  message.meta.date = new Date(message.meta.date).getTime();

 
  // ### Prepare Data for Plot:

  // fill arrays, shift when resolution is max. X=time, Y=data
  tempTopData.push ([message.meta.date, message.sensor.tempTop]);
  if (tempTopData.length == resolution){
    tempTopData.shift (0);
  }

  tempBtmData.push ([message.meta.date, message.sensor.tempBtm]);
  if (tempBtmData.length == resolution){
    tempBtmData.shift (0);
  }   

  tempRefData.push ([message.meta.date, message.ref.refTemp]);
  if (tempRefData.length == resolution){
    tempRefData.shift(0);
  }

  humidTopData.push ([message.meta.date, message.sensor.humidTop]);
  if (humidTopData.length == resolution){
    humidTopData.shift (0);  
  }

  humidBtmData.push ([message.meta.date, message.sensor.humidBtm]);
  if (humidBtmData.length == resolution){
    humidBtmData.shift (0);  
  }  
  
  humidRefData.push ([message.meta.date, message.ref.refHumid]);
  if (humidRefData.length == resolution){
    humidRefData.shift(0);
  }

  lightIntData.push ([message.meta.date, message.sensor.lightInt]);
  if (lightIntData.length == resolution){
    lightIntData.shift (0);
  } 

  lightRefData.push ([message.meta.date, message.ref.refLightInt]);
  if (lightRefData.length == resolution){
    lightRefData.shift(0);
  }

  // ### calculate benchmark data
  // this is just a mockup, sens and ref data MINUS plant pattern data!!!
  // DIFF are in percent %

  var tempDiff = ((message.sensor.tempBtm - 40)/4);
  var humidDiff = ((message.sensor.humidBtm - 30)/3);
  var intDiff = ((message.sensor.lightInt - 700)/70);
 
  benchmark1TempData.push ([message.meta.date, tempDiff]);
  if (benchmark1TempData.length == resolution){
    benchmark1TempData.shift(0);
  }

  benchmark1HumidData.push ([message.meta.date, humidDiff]);
  if (benchmark1HumidData.length == resolution){
    benchmark1HumidData.shift(0);
  }

  benchmark1IntData.push ([message.meta.date, intDiff]);
  if (benchmark1IntData.length == resolution){
    benchmark1IntData.shift(0);
  }
  
  // ### overall plant health
  var fitness = 100 - (Math.round(((Math.abs(tempDiff*2) + Math.abs(humidDiff*2) + Math.abs(intDiff*2)) * 10)) / 10);
  $('#fitness1_value').first().html(fitness);

  // plant 2
  var tempDiff = ((message.sensor.tempBtm - 23)/2.3);
  var humidDiff = ((message.sensor.humidBtm - 60)/6);
  var intDiff = ((message.sensor.lightInt - 620)/62);

  benchmark2TempData.push ([message.meta.date, tempDiff]);
  if (benchmark2TempData.length == resolution){
    benchmark2TempData.shift(0);
  }

  benchmark2HumidData.push ([message.meta.date, humidDiff]);
  if (benchmark2HumidData.length == resolution){
    benchmark2HumidData.shift(0);
  }

  benchmark2IntData.push ([message.meta.date, intDiff]);
  if (benchmark2IntData.length == resolution){
    benchmark2IntData.shift(0);
  }

  // ### overall plant health
  var fitness = 100 - (Math.round(((Math.abs(tempDiff*2) + Math.abs(humidDiff*2) + Math.abs(intDiff*2)) * 10)) / 10);
  $('#fitness2_value').first().html(fitness);

  // ### dirty hack... draw a zero line in benchmark graphs
  zero.push ([message.meta.date, 0]);
  if (zero.length == resolution){
   zero.shift(0);
  }

  // ### Actor states
  led.push ([message.meta.date, message.actor.led.state]);
  if (led.length == resolution){
    led.shift(0);
  }  

  fan.push ([message.meta.date, message.actor.fan.state]);
  if (fan.length == resolution){
    fan.shift(0);
  } 

  fanBtm.push ([message.meta.date, message.actor.fanBtm.state]);
  if (fanBtm.length == resolution){
    fanBtm.shift(0);
  }

  bubbler.push ([message.meta.date, message.actor.bubbler.state]);
  if (bubbler.length == resolution){
    bubbler.shift(0);
  }

  humidifier.push ([message.meta.date, message.actor.humidifier.state]);
  if (humidifier.length == resolution){
    humidifier.shift(0);
  }

  solin.push ([message.meta.date, message.actor.solin.state]);
  if (solin.length == resolution){
    solin.shift(0);
  }

  solout.push ([message.meta.date, message.actor.solout.state]);
  if (solout.length == resolution){
    solout.shift(0);
  }

  motor.push ([message.meta.date, message.actor.motor.state]);
  if (motor.length == resolution){
    motor.shift(0);
  }

  camera.push ([message.meta.date, 1]);
  if (camera.length == resolution){
    camera.shift(0);
  }


  // ### Plot Data

  // plot both tempTop and tempBtm in one graph
  $.plot("#graph_temp", [
    { data: tempBtmData, label: "Temperature Bottom", lines:{fill:true}},
    { data: tempTopData, label: "Temperature Top", lines:{fill:true}},
    { data: tempRefData, label: "Reference", lines:{fill:false}, shadowSize:0}
  ], options_temp);

  $.plot("#graph_humid", [
    { data: humidTopData, label: "Humidity Top", lines:{fill:true}},
    { data: humidBtmData, label: "Humidity Bottom", lines:{fill:true}},
    { data: humidRefData, label: "Reference", lines:{fill:false}, shadowSize:0}
  ], options_humid);

  $.plot("#graph_lightInt", [
    { data: lightIntData, label: "Light Intensity", lines:{fill:true}},
    { data: lightRefData, label: "Reference", lines:{fill:false}, shadowSize:0}
  ], options_light);

  $.plot("#graph_plant1_benchmark", [
    { data: benchmark1TempData, label: "Temperature deviation", lines:{fill:true, fillColor:"rgba(138,212,32,0.4)"}},
    { data: benchmark1HumidData, label: "Humidity deviation", lines:{fill:true, fillColor:"rgba(23,58,153,0.4)"}},
    { data: benchmark1IntData, label: "Ligth Intensity deviation", lines:{fill:true, fillColor:"rgba(204,47,10,0.4)"}},
    { data: zero, lines:{fill:false, lineWidth:15, shadowSize:0}}
  ], options_benchmark);

  $.plot("#graph_plant2_benchmark", [
    { data: benchmark2TempData, label: "Temperature deviation", lines:{fill:true, fillColor:"rgba(138,212,32,0.4)"}},
    { data: benchmark2HumidData, label: "Humidity deviation", lines:{fill:true, fillColor:"rgba(23,58,153,0.4)"}},
    { data: benchmark2IntData, label: "Ligth Intensity deviation", lines:{fill:true, fillColor:"rgba(204,47,10,0.4)"}},
    { data: zero, lines:{fill:false, lineWidth:15, shadowSize:0}}
  ], options_benchmark);

  $.plot("#graph_machine_led", [
    { data: led, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_fan", [
    { data: fan, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_fanBtm", [
    { data: fanBtm, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_bubbler", [
    { data: bubbler, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_humidifier", [
    { data: humidifier, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_solin", [
    { data: solin, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_solout", [
    { data: solout, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_motor", [
    { data: motor, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_camera", [
    { data: camera, lines:{fill:true}}
  ], options_machines);


// #### buttons


$('#li_btn').live('click', function(event) {
    if (active == false){
      client.publish('/hy_override','{"actor":{"led":{"state":1}}}');
      active = true;
    } else {
      client.publish('/hy_override','{"actor":{"led":{"state":0}}}');
      active = false;
    }   
});

$('#fl_btn').live('click', function(event) {
    client.publish('/hy_override','{"ref":{"refFl":1}}');
});

$('#fl2_btn').live('click', function(event) {
    client.publish('/hy_override','{"ref":{"refFl":60}}');
});

var solinactive = false;

$('#solin_btn').live('click', function(event) {
    if (solinactive == false){
      client.publish('/hy_override','{"actor":{"solin":{"state":1}}}');
      solinactive = true;
    } else {
      client.publish('/hy_override','{"actor":{"solin":{"state":0}}}');
      solinactive = false;
    }   
});
var soloutactive = false;

$('#solout_btn').live('click', function(event) {
    if (soloutactive == false){
      client.publish('/hy_override','{"actor":{"solout":{"state":1}}}');
      soloutactive = true;
    } else {
      client.publish('/hy_override','{"actor":{"solout":{"state":0}}}');
      soloutactive = false;
    } 
});


// ### vote plants buttons
$('.voteup').unbind().hover(function(){
    $('.voteup').tooltip('show');
});
$('.voteup').bind('mouseleave', function(){
    $('.voteup').tooltip('hide');
});
$('.votedown').unbind().hover(function(){
    $('.votedown').tooltip('show');
});
$('.votedown').bind('mouseleave', function(){
    $('.votedown').tooltip('hide');
});

// ### set actor states
$('.act_led').unbind().click(function(){
  if (message.actor.led.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"led":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"led":{"state":1}}}');
  }
});

$('.act_fan').unbind().click(function(){
  if (message.actor.fan.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"fan":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"fan":{"state":1}}}');
  }
});

$('.act_fanBtm').unbind().click(function(){
  if (message.actor.fanBtm.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"fanBtm":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"fanBtm":{"state":1}}}');
  }
});

$('.act_bubbler').unbind().click(function(){
  if (message.actor.bubbler.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"bubbler":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"bubbler":{"state":1}}}');
  }
});

$('.act_humidifier').unbind().click(function(){
  if (message.actor.humidifier.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"humidifier":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"humidifier":{"state":1}}}');
  }
});

$('.act_solin').unbind().click(function(){
  if (message.actor.solin.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"solin":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"solin":{"state":1}}}');
  }
});

$('.act_solout').unbind().click(function(){
  if (message.actor.solout.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"solout":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"solout":{"state":1}}}');
  }
});

$('.act_motor').unbind().click(function(){
  $('.dropdown-toggle').dropdown()

/*
  if (message.actor.motor.state === true){
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"motor":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"motor":{"state":1}}}');
  }
*/

});

$('.act_motor_off').unbind().click(function(){
  client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"motor":{"state":0}}}');
});

$('.act_motor_down').unbind().click(function(){
  client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"motor":{"state":1,"dir":"down"}}}');
});

$('.act_motor_up').unbind().click(function(){
  client.publish('/hy_override','{"msg":{"deb":1}}{"actor":{"motor":{"state":1,"dir":"up"}}}');
});


// ### trigger cycle states
$('.flood_toggle').unbind().click(function(){
  if (message.actor.solout.state === true){
    client.publish('/hy_override','{"actor":{"solout":{"state":0}}}');
    client.publish('/hy_override','{"actor":{"solin":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"actor":{"solout":{"state":1}}}');
    client.publish('/hy_override','{"actor":{"solin":{"state":1}}}');
  }
});

$('.light_toggle').unbind().click(function(){
  if (message.actor.led.state === true){
    client.publish('/hy_override','{"actor":{"led":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"actor":{"led":{"state":1}}}');
  }
});

$('.aeration_toggle').unbind().click(function(){
  if (message.actor.bubbler.state === true){
    client.publish('/hy_override','{"actor":{"bubbler":{"state":0}}}');
  } else {
    client.publish('/hy_override','{"actor":{"bubbler":{"state":1}}}');
  }
});

// ### set new reference values
$('#setRefTemp').unbind().click(function(){
  if (isNaN($('#newRefTemp').val()) || ($('#newRefTemp').val()) === "") {
    // invalid input
    $('#newRefTemp').tooltip('show');
  } else {
    client.publish('/hy_override','{"ref":{"refTemp":'+ $('#newRefTemp').val() +'}}');
    $('#newRefTemp').tooltip('hide');
    $('#refTempModal').modal('hide');
  } 
});

$('#setRefHumid').unbind().click(function(){
  if (isNaN($('#newRefHumid').val()) || ($('#newRefHumid').val()) === "") {
    // invalid input
    $('#newRefHumid').tooltip('show');
  } else {
    client.publish('/hy_override','{"ref":{"refHumid":'+ $('#newRefHumid').val() +'}}');
    $('#newRefHumid').tooltip('hide');
    $('#refHumidModal').modal('hide');
  }
});

$('#setRefFl').unbind().click(function(){
  if (isNaN($('#newRefFl').val()) || ($('#newRefFl').val()) === "") {
    // invalid input
    $('#newRefFl').tooltip('show');
  } else {
    client.publish('/hy_override','{"ref":{"refFl":'+ $('#newRefFl').val() +'}}');
    $('#newRefFl').tooltip('hide');
    $('#refFlModal').modal('hide');
  } 
});

// set ref BU and LI need smarter number checks...
$('#setRefBu').unbind().click(function(){
  if (isNaN($('#newRefBuInt').val()) || ($('#newRefBuInt').val()) === "") {
    // invalid input
    $('#newRefBuInt').tooltip('show');
    return false;
  }
  if (isNaN($('#newRefBuDur').val()) || ($('#newRefBuDur').val()) === "") {
    // invalid input
    $('#newRefBuDur').tooltip('show')
    return false;
  } 
  client.publish('/hy_override','{"ref":{"refBu":['+ $('#newRefBu').val() + ',' + $('#newRefBu').val() +']}}');
  $('#newRefBuInt').tooltip('hide');
  $('#newRefBuDur').tooltip('hide');
  $('#refBuModal').modal('hide');
});

$('#setRefLi').unbind().click(function(){
  if (isNaN($('#newRefLiInt').val()) || ($('#newRefLiInt').val()) === "") {
    // invalid input
    $('#newRefLiInt').tooltip('show');
    return false;
  } 
  if (isNaN($('#newRefLiDur').val()) || ($('#newRefLiDur').val()) === "") {
    // invalid input
    $('#newRefLiDur').tooltip('show')
    return false;
  } 
  client.publish('/hy_override','{"ref":{"refLi":['+ $('#newRefLi').val() + ',' + $('#newRefLi').val() +']}}');
  $('#newRefLiInt').tooltip('hide');
  $('#newRefLiDur').tooltip('hide');
  $('#refLiModal').modal('hide');
});


$('#setRefLightInt').unbind().click(function(){
  if (isNaN($('#newRefLightInt').val()) || ($('#newRefLightInt').val()) === "") {
    // invalid input
    $('#newRefLightInt').tooltip('show');
  } else {
    client.publish('/hy_override','{"ref":{"refLightInt":'+ $('#newRefLightInt').val() +'}}');
    $('#newRefLightInt').tooltip('hide');
    $('#refLightIntModal').modal('hide');
  } 
});

// #### resume from debug

$('.disable_debug').unbind().click(function(){
    client.publish('/hy_override','{"msg":{"deb":0}}');
});


// ### Progress Bars

// flood cycle

$(function() {
  var timeleft = message.ref.refFl - message.sensor.lastFlood;
  var ratio = message.ref.refFl / 100;
  var value = message.sensor.lastFlood / ratio;
  $( "#flood_progress" ).progressbar({
    value: value
  }); 
}); 

// aeration cycle

$(function() {
  if (message.actor.bubbler.state == false) {
    var timeleft = message.ref.refBu[0] - message.actor.bubbler.dur;
    var ratio = message.ref.refBu[0] / 100;
  } else {
    var timeleft = message.ref.refBu[1] - message.actor.bubbler.dur;
    var ratio = message.ref.refBu[1] / 100;
  }
  var value = message.actor.bubbler.dur / ratio;
  $( "#aeration_progress" ).progressbar({
    value: value
  });
});


// light cycle

$(function() {
  if (message.actor.led.state == false) {
    var timeleft = message.ref.refLi[0] - message.actor.led.dur;
    var ratio = message.ref.refLi[0] / 100;
  } else {
    var timeleft = message.ref.refLi[1] - message.actor.led.dur;
    var ratio = message.ref.refLi[1] / 100;
  }
  var value = message.actor.led.dur / ratio;  
  $( "#light_progress" ).progressbar({
    value: value
  }); 
});
 
// plant progress

$(function() {
  $( "#plant_progress" ).progressbar({
    value: 52
  });
});

$(function() {
  $( "#plant2_progress" ).progressbar({
    value: 10
  });
});


  // ### insert Data values into html

  for (var key in message) {
    for (var subkey in message[key]) {
      $('.' + subkey + '_value').html(message[key][subkey]);
    }
  };

 for (var key in message.actor) {
   for (var subkey in message.actor[key]) {
     $('.' + key + subkey +'_value').html(message.actor[key][subkey]);
   }
 }; 

 if (message.actor.solout.state === false && message.sensor.bfWater == false){
   $('.flood_toggle').first().html("flood now");
 } else if (message.actor.solout.state === true && message.sensor.bfWater == false) {
   $('.flood_toggle').first().html("stop flooding");
 } else if (message.sensor.bfWater == true) {
   $('.flood_toggle').first().html("draining biofilter");
 }

 if (message.actor.bubbler.state === false){
   $('.refBu_value').first().html(message.ref.refBu[0]);
   $('.aeration_toggle').first().html("start aeration");
 } else {
   $('.refBu_value').first().html(message.ref.refBu[1]);
   $('.aeration_toggle').first().html("stop aeration");
 }

 if (message.actor.led.state === false){
   $('.refLi_value').first().html(message.ref.refLi[0]);
   $('.light_toggle').first().html("start day");
 } else {
   $('.refLi_value').first().html(message.ref.refLi[1]);
   $('.light_toggle').first().html("start night");
 }


 // ### alerts, error messages
 // #### debug message alert
 
 if (message.msg.deb === true){
   $("#debug").show();
 } else {
   $("#debug").hide();
 }

 if (message.msg.err !== ''){
   $('.err_value').first().html(message.msg.err);
   $("#err").show();
 }

$('.err').unbind().click(function(){
  $('#err').hide();
});

 if (message.msg.not !== ''){
   $('.not_value').first().html(message.msg.not);
   $("#not").show();
 }

$('.not').unbind().click(function(){
  $('#not').hide();
});


// ### actor states!!!

 if (message.actor.led.state === true){
   $('.ledState').first().html('ON');
 } else {
   $('.ledState').first().html('OFF');
 }

 if (message.actor.fan.state === true){
   $('.fanState').first().html('ON');
 } else {
   $('.fanState').first().html('OFF');
 }

 if (message.actor.fanBtm.state === true){
   $('.fanBtmState').first().html('ON');
 } else {
   $('.fanBtmState').first().html('OFF');
 }

 if (message.actor.bubbler.state === true){
   $('.bubblerState').first().html('ON');
 } else {
   $('.bubblerState').first().html('OFF');
 }

 if (message.actor.humidifier.state === true){
   $('.humidifierState').first().html('ON');
 } else {
   $('.humidifierState').first().html('OFF');
 }

 if (message.actor.solin.state === true){
   $('.solinState').first().html('ON');
 } else {
   $('.solinState').first().html('OFF');
 }

 if (message.actor.solout.state === true){
   $('.soloutState').first().html('ON');
 } else {
   $('.soloutState').first().html('OFF');
 }

 if (message.actor.motor.state === true){
   $('.motorState').first().html('ON');
   $('.motorDir').first().html(message.actor.motor.dir);
 } else {
   $('.motorState').first().html('OFF');
 }






}); // end of message data handling


// ### Datepicker Widget

var to = new Date();
var from = new Date(to.getTime() - 1000 * 60 * 60 * 24 * 14);

$('#datepicker-calendar').DatePicker({
  inline: true,
  date: [from, to],
  calendars: 4,
  mode: 'range',
  current: new Date(to.getFullYear(), to.getMonth() - 1, 1),
  onChange: function(dates,el) {


    // update the range display
    $('#date-range-field span').text(dates[0].getDate()+' '+dates[0].getMonthName(true)+' '+dates[0].getFullYear()+' - '+ dates[1].getDate()+' '+dates[1].getMonthName(true)+', '+dates[1].getFullYear());


    // ### send a query to the server

    // request a date range 
    if (dates[0].toDateString() !== dates[1].toDateString()) {
      client.publish('/request', {
	from: dates[0].getTime(),
	to: dates[1].getTime()
      }); 

    // reset Data Arrays    
    tempTopData.length = 0;
    tempBtmData.length = 0;
    humidTopData.length = 0;
    humidBtmData.length = 0;

    console.log ("date range");  
    console.log (dates);
     
    }

    // request a single day (the differentiation btw date range and single day might be redundant...)
    if (dates[0].toDateString() == dates[1].toDateString()){
      client.publish('/request', {
	from: dates[0].getTime(),
	to: dates[0].getTime()
      });
      
      tempTopData.length = 0;
      tempBtmData.length = 0;
      humidTopData.length = 0;
      humidBtmData.length = 0;

      console.log ("single day");
      console.log (dates);
    }

  }

});

// initialize the special date dropdown field
$('#date-range-field span').text(from.getDate()+' '+from.getMonthName(true)+' '+from.getFullYear()+' - right now');

// bind a click handler to the date display field, which when clicked
// toggles the date picker calendar, flips the up/down indicator arrow,
// and keeps the borders looking pretty
$('#date-range-field').bind('click', function(){
  $('#datepicker-calendar').toggle();
  return false;
});

// global click handler to hide the widget calendar when it's open, and
// some other part of the document is clicked.  Note that this works best
// defined out here rather than built in to the datepicker core because this
// particular example is actually an 'inline' datepicker which is displayed
// by an external event, unlike a non-inline datepicker which is automatically
// displayed/hidden by clicks within/without the datepicker element and datepicker respectively
$('html').click(function() {
  if($('#datepicker-calendar').is(":visible")) {
    $('#datepicker-calendar').hide();
    $('#date-range-field a').html('&#9660;');
  }
});

// stop the click propagation when clicking on the calendar element
// so that we don't close it
$('#datepicker-calendar').click(function(event){
  event.stopPropagation();
});



});


