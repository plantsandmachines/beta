// HYDROPONIC GRAPH SETTINGS

        var options_temp = { 
        yaxis: { min: 0, max: 40 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},
                   
          series: {
            lines: { show: true, fillColor: "rgba(166,225,38,0.7)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },  
                               
          colors: ["rgba(50,50,50,0.7)","rgba(50,50,50,0.7)","rgba(204,47,10,1)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50, 
            labelMargin: 10, 
            axisMargin: 50, 
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20, 
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },  

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5 
          }   
    
        }; 

        var options_humid = { 
        yaxis: { min: 0, max: 100 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},
    
          series: {
            lines: { show: true, fillColor: "rgba(166,225,38,0.7)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },  
    
          colors: ["rgba(50,50,50,0.7)","rgba(50,50,50,0.7)","rgba(204,47,10,1)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50, 
            labelMargin: 10, 
            axisMargin: 50, 
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20, 
//            clickable: true,
          hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },  

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5 
          }   
    
        };

        var options_light = {
        yaxis: { min: 0, max: 1024 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, fillColor: "rgba(166,225,38,0.9)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },

          colors: ["rgba(50,50,50,0.7)","rgba(204,47,10,1)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
          hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5
          }

        };

        var options_benchmark = {
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, lineWidth: 2 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 5
          },

          colors: ["rgba(138,212,32,1)","rgba(23,58,153,1)","rgba(204,47,10,1)","rgb(255,255,255)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "se",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.0,
            noColumns: 4
          }

        };

        var options_benchmarkfish = {
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, lineWidth: 2 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 5
          },

          colors: ["rgba(138,212,32,1)","rgba(23,58,153,1)","rgb(255,255,255)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "se",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.0,
            noColumns: 4
          }

        };


// AQUAPONIC GRAPH SETTINGS

        var options_water = {
        yaxis: { min: 10, max: 30 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, fill: true, fillColor: "rgba(63,115,255,0.7)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },

          colors: ["rgba(50,50,50,0.7)","rgba(50,50,50,0.7)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5
          }

        };

        var options_ph = {
        yaxis: { min: 0, max: 14 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, fill: true, fillColor: "rgba(63,115,255,0.7)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },

          colors: ["rgba(50,50,50,0.7)","rgba(50,50,50,0.7)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5
          }

        };
  
// ### MACHINES

        var options_machines = {
        yaxis: { min: 0, max: 2 },
        xaxis: { mode: "time", timeformat: "%H:%M:%S"},

          series: {
            lines: { show: true, fillColor: "rgba(166,225,38,0.7)", lineWidth: 1 },
   //         points: { show: true, fill: true, fillColor: "rgba(202,0,204,0.7)", radius: 1 },
            shadowSize: 10
          },

          colors: ["rgba(50,50,50,0.7)","rgba(50,50,50,0.7)","rgba(204,47,10,1)"],

          grid: {
            show: true,
            aboveData: false,
            color: "#483a3a",
            backgroundColor: null,
            margin: 50,
            labelMargin: 10,
            axisMargin: 50,
            borderWidth: 1,
            borderColor: "#483a3a",
            minBorderMargin: 20,
//            clickable: true,
            hoverable: true,
            autoHighlight: true,
            mouseActiveRadius: 50
          },

          legend: {
            show: true,
            labelBoxBorderColor: "#483a3a",
            position: "sw",
            margin: 5,
            backgroundColor: "#FFFFFF",
            backgroundOpacity: 0.5
          }

        };

