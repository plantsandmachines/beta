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
var tempData = new Array();
var tempRefData = new Array();

var phData = new Array();
var phRefData = new Array();

var benchmark1TempData = new Array();
var benchmark1PhData = new Array();

var benchmark2TempData = new Array();
var benchmark2PhData = new Array();

var zero = new Array();

var pump = new Array();
var bubbler = new Array();
var heater = new Array();

var resolution = 100;

// listen to fayechannel (should be only the appropreate channel per page...)
var client = new Faye.Client("/faye");
client.subscribe( "/aquaponic/live", function(message) {


  // ### Get Data from server

  // trasfer the json string to an object
  message = jQuery.parseJSON(message);
 
  // make UTC timestamp to unix time stamp... TODO: add 2h for CET
  message.meta.date = new Date(message.meta.date).getTime();

 
  // ### Prepare Data for Plot:

  // fill arrays, shift when resolution is max. X=time, Y=data
  tempData.push ([message.meta.date, message.sensor.temp]);
  if (tempData.length == resolution){
    tempData.shift (0);
  }

  phData.push ([message.meta.date, message.sensor.ph]);
  if (phData.length == resolution){
    phData.shift (0);
  }   

  tempRefData.push ([message.meta.date, message.ref.refTemp]);
  if (tempRefData.length == resolution){
    tempRefData.shift(0);
  }

  phRefData.push ([message.meta.date, message.ref.refPh]);
  if (phRefData.length == resolution){
    phRefData.shift(0);
  }

  // ### calculate benchmark data
  // this is just a mockup, sens and ref data MINUS plant pattern data!!!
  // DIFF are in percent %

  var tempDiff = ((message.sensor.temp - 25)/2.5);
  var phDiff = ((message.sensor.ph - 6)/0.6);
 
  benchmark1TempData.push ([message.meta.date, tempDiff]);
  if (benchmark1TempData.length == resolution){
    benchmark1TempData.shift(0);
  }

  benchmark1PhData.push ([message.meta.date, phDiff]);
  if (benchmark1PhData.length == resolution){
    benchmark1PhData.shift(0);
  }

  
  // ### overall fish health
  var fitness = 100 - (Math.round(((Math.abs(tempDiff*2) + Math.abs(phDiff*2)) * 10)) / 10);
  $('#fitness1_value').first().html(fitness);

  // fish 2
  var tempDiff = ((message.sensor.temp - 23)/2.3);
  var phDiff = ((message.sensor.ph - 6.5)/3.25);

  benchmark2TempData.push ([message.meta.date, tempDiff]);
  if (benchmark2TempData.length == resolution){
    benchmark2TempData.shift(0);
  }

  benchmark2PhData.push ([message.meta.date, phDiff]);
  if (benchmark2PhData.length == resolution){
    benchmark2PhData.shift(0);
  }


  // ### overall fish health
  var fitness = 100 - (Math.round(((Math.abs(tempDiff*2) + Math.abs(phDiff*2)) * 10)) / 10);
  $('#fitness2_value').first().html(fitness);

  // ### dirty hack... draw a zero line in benchmark graphs
  zero.push ([message.meta.date, 0]);
  if (zero.length == resolution){
   zero.shift(0);
  }

  // ### Actor states
  pump.push ([message.meta.date, message.actor.pump.state]);
  if (pump.length == resolution){
    pump.shift(0);
  }  

  heater.push ([message.meta.date, message.actor.heater.state]);
  if (heater.length == resolution){
    heater.shift(0);
  } 

  bubbler.push ([message.meta.date, message.actor.bubbler.state]);
  if (bubbler.length == resolution){
    bubbler.shift(0);
  }


  // ### Plot Data

  // plot both tempTop and tempBtm in one graph
  $.plot("#graph_temp", [
    { data: tempData, label: "Temperature Water", lines:{fill:true}},
    { data: tempRefData, label: "Reference", lines:{fill:false}, shadowSize:0}
  ], options_water);

  $.plot("#graph_ph", [
    { data: phData, label: "PH water", lines:{fill:true}},
    { data: phRefData, label: "Reference", lines:{fill:false}, shadowSize:0}
  ], options_ph);

  $.plot("#graph_fish1_benchmark", [
    { data: benchmark1TempData, label: "Temperature deviation", lines:{fill:true, fillColor:"rgba(138,212,32,0.4)"}},
    { data: benchmark1PhData, label: "PH deviation", lines:{fill:true, fillColor:"rgba(23,58,153,0.4)"}},
    { data: zero, lines:{fill:false, lineWidth:15, shadowSize:0}}
  ], options_benchmarkfish);

  $.plot("#graph_fish2_benchmark", [
    { data: benchmark2TempData, label: "Temperature deviation", lines:{fill:true, fillColor:"rgba(138,212,32,0.4)"}},
    { data: benchmark2PhData, label: "PH deviation", lines:{fill:true, fillColor:"rgba(23,58,153,0.4)"}},
    { data: zero, lines:{fill:false, lineWidth:15, shadowSize:0}}
  ], options_benchmarkfish);

  $.plot("#graph_machine_pump", [
    { data: pump, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_heater", [
    { data: heater, lines:{fill:true}}
  ], options_machines);

  $.plot("#graph_machine_bubbler", [
    { data: bubbler, lines:{fill:true}}
  ], options_machines);


// #### buttons


// ### vote fish buttons
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
$('.act_pump').unbind().click(function(){
  if (message.actor.pump.state === true){
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"pump":{"state":0}}}');
  } else {
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"pump":{"state":1}}}');
  }
});

$('.act_heater').unbind().click(function(){
  if (message.actor.heater.state === true){
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"heater":{"state":0}}}');
  } else {
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"heater":{"state":1}}}');
  }
});

$('.act_bubbler').unbind().click(function(){
  if (message.actor.bubbler.state === true){
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"bubbler":{"state":0}}}');
  } else {
    client.publish('/aq_override','{"msg":{"deb":1}}{"actor":{"bubbler":{"state":1}}}');
  }
});

// ### trigger cycle states
$('.water_toggle').unbind().click(function(){
  if (message.actor.pump.state === true){
    client.publish('/aq_override','{"actor":{"pump":{"state":0}}}');
  } else {
    client.publish('/aq_override','{"actor":{"pump":{"state":1}}}');
  }
});

$('.aeration_toggle').unbind().click(function(){
  if (message.actor.bubbler.state === true){
    client.publish('/aq_override','{"actor":{"bubbler":{"state":0}}}');
  } else {
    client.publish('/aq_override','{"actor":{"bubbler":{"state":1}}}');
  }
});

// ### set new reference values
$('#setRefTemp').unbind().click(function(){
  if (isNaN($('#newRefTemp').val()) || ($('#newRefTemp').val()) === "") {
    // invalid input
    $('#newRefTemp').tooltip('show');
  } else {
    client.publish('/aq_override','{"ref":{"refTemp":'+ $('#newRefTemp').val() +'}}');
    $('#newRefTemp').tooltip('hide');
    $('#refTempModal').modal('hide');
  } 
});

$('#setRefPh').unbind().click(function(){
  if (isNaN($('#newRefPh').val()) || ($('#newRefPh').val()) === "") {
    // invalid input
    $('#newRefPh').tooltip('show');
  } else {
    client.publish('/aq_override','{"ref":{"refPh":'+ $('#newRefPh').val() +'}}');
    $('#newRefPh').tooltip('hide');
    $('#refPhModal').modal('hide');
  }
});

// set ref Cy and Ai need smarter number checks...
$('#setRefCy').unbind().click(function(){
  if (isNaN($('#newRefCyInt').val()) || ($('#newRefCyInt').val()) === "") {
    // invalid input
    $('#newRefCy').tooltip('show');
    return false;
  }
  if (isNaN($('#newRefCyDur').val()) || ($('#newRefCyDur').val()) === "") {
    // invalid input
    $('#newRefCy').tooltip('show')
    return false;
  } 
  client.publish('/aq_override','{"ref":{"refCy":['+ $('#newRefCyInt').val() + ',' + $('#newRefCyDur').val() +']}}');
  $('#newRefCyInt').tooltip('hide');
  $('#newRefCyDur').tooltip('hide');
  $('#refCyModal').modal('hide');
});

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
  client.publish('/aq_override','{"ref":{"refAi":['+ $('#newRefBuInt').val() + ',' + $('#newRefBuDur').val() +']}}');
  $('#newRefBuInt').tooltip('hide');
  $('#newRefBuDur').tooltip('hide');
  $('#refLiModal').modal('hide');
});


// #### resume from debug

$('.disable_debug').unbind().click(function(){
    client.publish('/aq_override','{"msg":{"deb":0}}');
});


// ### Progress Bars


// water cycle

$(function() {
  if (message.actor.pump.state == false) {
    var timeleft = message.ref.refCy[0] - message.actor.pump.dur;
    var ratio = message.ref.refCy[0] / 100;
  } else {
    var timeleft = message.ref.refCy[1] - message.actor.pump.dur;
    var ratio = message.ref.refCy[1] / 100;
  }
  var value = message.actor.pump.dur / ratio;
  $( "#water_progress" ).progressbar({
    value: value
  });
});


// aeration cycle

$(function() {
  if (message.actor.bubbler.state == false) {
    var timeleft = message.ref.refAi[0] - message.actor.bubbler.dur;
    var ratio = message.ref.refAi[0] / 100;
  } else {
    var timeleft = message.ref.refAi[1] - message.actor.bubbler.dur;
    var ratio = message.ref.refAi[1] / 100;
  }
  var value = message.actor.bubbler.dur / ratio;  
  $( "#aeration_progress" ).progressbar({
    value: value
  }); 
});
 
// fish progress

$(function() {
  $( "#fish_progress" ).progressbar({
    value: 52
  });
});

$(function() {
  $( "#fish2_progress" ).progressbar({
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

 if (message.actor.pump.state === false){
   $('.refCy_value').first().html(message.ref.refCy[0]);
   $('.water_toggle').first().html("cycle now");
 } else {
   $('.refCy_value').first().html(message.ref.refCy[1]);
   $('.water_toggle').first().html("stop cycling");
 }

 if (message.actor.bubbler.state === false){
   $('.refAi_value').first().html(message.ref.refAi[0]);
   $('.aeration_toggle').first().html("start aeration");
 } else {
   $('.refAi_value').first().html(message.ref.refAi[1]);
   $('.aeration_toggle').first().html("stop aeration");
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

 if (message.actor.pump.state === true){
   $('.pumpState').first().html('ON');
 } else {
   $('.pumpState').first().html('OFF');
 }

 if (message.actor.heater.state === true){
   $('.heaterState').first().html('ON');
 } else {
   $('.heaterState').first().html('OFF');
 }

 if (message.actor.bubbler.state === true){
   $('.bubblerState').first().html('ON');
 } else {
   $('.bubblerState').first().html('OFF');
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


