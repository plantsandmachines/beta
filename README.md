##### plants & machines 

---

# beta

This is the code of the second robotic aquaponic ecosystem we build. It is bigger in size and has a lot more features than early_alpha. Beta sports an Atlas Scientific PH sensor, multiple DHT22 and DS18S20 temperature sensors, 2 solenoid valves, LED lighting on a height adjustable light rack, a humidifier, lots of fans and comes with a seperate biofilter. 

An aquaponic system is esentially the combination of a regular hydroculture with an aquaculture. The closed loop water-cycle is used for ammonium and ammonia dissolvement and transportation. Colonies of micro-organisms convert ammonium and ammonia to nitrate. Plants use up the nitrate and thus rid the water of all substances being toxic for aquatic animals. There is no need for external nutrient supplication.

Through the use of technology we are able to modify environmental conditions inside this artificial ecosystem to become the perfect spa for plants and aquatic animals. The goal is to have a sensing robot that by the help of machinelearning is able to optimize the cultivation of food in regard to energy consumption, yield and taste.

---

##### tldr: 

##### [sensors] + [actuators] -> [arduinos] -usb-serial-JSON-> [raspberryPi] -node.js-> (mongodb) && (webinterface(bootstrap; flot graphs)) 

##### [webclient(webinterface)] -faye-JSON-> [raspberryPi(node.js)] -usb-serial-JSON-> [arduinos] -> [actuators]

* avr timer interrupts, keep track of time
* build JSON on avr
* parse string from multiple serialports in node.js
* store stuff in mongodb
* node.js dead simple http server
* send sensor, actuator and reference variables through faye (like websockets) to webclient
* send reference variables and commands from webinterface through faye to node.js
* send reference variables and commands from node.js to arduinos with JSON
* build a rather usable interface

---

##### how to run 

###### node.js

* install mongodb, node.js and npm on your machine
* inside the node folder

```
~$ npm install
```

* depending on your system:

```
~$ sudo node server.js
~$ sudo nodejs server.js
```

###### avr / arduino

* install gvr-gcc, avr-libc and avrdude
* change lib dirs and avr chip in the makefile
* inside the arduino folder:
  
```  
~$ make
~$ sudo make upload
```

*bug: compile & upload code with arduino IDE, there seems to be a problem with software serial libraries when using the given makefile.*
  
###### webinterface

* sensordata is displayed in graphs
* reference variables are displayed in graphs
* set references via the interface
* all actuator states are visibile
* toggle actuators from the interface
* some additional mockup stuff (plant status, benchmarking, datepicker)

---

##### misc

* GPLv2

* See the [wiki](https://github.com/plantsandmachines/beta/wiki) for a more detailed documentation...

* we are not accountable for any damage you might do to your body or belongings with the help of water and/or 220V alternating current

---

This project originated from [our local hackspace maschinenraum](http://www.maschinenraum.tk) in late 2012. It then became my master thesis in architecture at the [bauhaus university](http://www.uni-weimar.de/de/universitaet/start/). During the time of research about urban food production systems Bastian and I build 3 prototypes.

This repository documents our second food replication system.
We are currently fixing documentation, cleaning up code and comments on the other prototypes and will release them as soon as we're done.

---

##### visit us on

* [plantsandmachines.de](http://www.plantsandmachines.de)
* [facebook](https://www.facebook.com/plantsandmachines)
* [twitter](https://www.twitter.com/plants_machines)

Chat with us:

* [IRC](irc://irc.freenode.org/plantsandmachines)

---

![plants & machines logo](https://avatars3.githubusercontent.com/u/5636292?s=65 "plants & machines logo")


