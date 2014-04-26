//__________________________________________
//
// 	           PLANTS & MACHINES
//               beta v-0.0.1
//
//              Martin Breuer
//
//                  GPLv2
//
//__________________________________________

// MAIN AQUAPONIC

// INCLUDES
//#include "sensors.ino"
//#include "actors.ino"
#include <avr/io.h>
#include <avr/interrupt.h>
#include <aJSON.h>
//#include <MemoryFree.h>

// DEFAULT ACTUATOR STATES
bool pumpState = false;
bool heaterState = false;
bool bubblerState = false;

// SENSOR VALUES
float tempWtr;
float phWtr;
int seconds;

// ALERTS
char error[20];
char notification[20];

// DESIRED VALUES
// for sensor based actuators
float refTemp = 24;
float refPh = 6.5;

// DESIRED VALUES
// for time based actuators in minutes
int refCy [2] = {25,5}; // [0] intervall, [1] duration of internal water cycle
int refAi [2] = {30,60}; // [0] intervall, [1] duration of aeration

// TIME COUNTERS
int pumpOffTime = 0;
int pumpOnTime = 0;
int bubblerOffTime = 0;
int bubblerOnTime = 0;
int heaterOffTime = 0;
int heaterOnTime = 0;

// DEBUG FLAG for manual override
bool deb = false;


// ---------------------- BEGIN OF SENSORS.INO -------------------
// --- arduino IDE causes trouble with including a second file ---

// SENSORS AQUAPONIC
// WATER TEMPERATURE
#include <OneWire.h>
float sens_tempWtr ()
{
  const int tempwtrPin = 8; 
  OneWire ds(tempwtrPin);

  byte data[12];
  byte addr[8];

  if ( !ds.search(addr)) 
  { //no more sensors on chain, reset search
    ds.reset_search();
    return -1000;
  }
 
  if ( OneWire::crc8( addr, 7) != addr[7]) 
  {
    Serial.println("CRC is not valid!");
    return -1000;
  }

  if ( addr[0] != 0x10 && addr[0] != 0x28) 
  {
    Serial.print("Device is not recognized");
    return -1000;
  }

  ds.reset();
  ds.select(addr);
  ds.write(0x44); // start conversion, with parasite power on at the end

  byte present = ds.reset();
  ds.select(addr);
  ds.write(0xBE); // Read Scratchpad

  for (int i = 0; i < 9; i++) 
  { // we need 9 bytes
    data[i] = ds.read();
  }

  ds.reset_search();

  byte MSB = data[1];
  byte LSB = data[0];

  float tempRead = ((MSB << 8) | LSB); //using two's compliment
  float tempWtr = tempRead / 16;
  
  return tempWtr;
}

// WATER PH VALUE
#include <SoftwareSerial.h>
const int phwtrRxPin = 2;
const int phwtrTxPin = 3;

float phTemp;
char ph_data[20];
byte received_from_sensor = 0;

SoftwareSerial phSerial (phwtrRxPin, phwtrTxPin);

float sens_phWtr ()
{
  extern float tempWtr;
 
  // round tempWtr to two decimals
  phTemp = tempWtr*100;
  phTemp += 0.5;
  phTemp = (float)((int)phTemp);
  phTemp /= 100;
  
  // send temperature to ph sensor
  phSerial.print(tempWtr);
  phSerial.print("\r");

  if(phSerial.available() > 0)
  { 
    received_from_sensor = phSerial.readBytesUntil (13,ph_data,20); // read bytes (max. 20) from buffer, untill <CR> (13). store bytes in ph_data. count the bytes recieved.
    ph_data[received_from_sensor] = 0; // add a 0 terminator to the char array
  }  

  float phWtr=atof(ph_data); // char[] to float
  return phWtr;
}

// ---------------------- END OF SENSORS.INO -------------------


// ---------------------- BEGIN OF ACTORS.INO -------------------
// --- arduino IDE causes trouble with including a second file ---

// ACTORS AQUAPONIC
// PUMP
void act_pump (bool toggle)
{
  const int pumpPin = A0;
  pinMode (pumpPin, OUTPUT);

  switch (toggle)
  {
    case true:
    digitalWrite (pumpPin, LOW);
    break;

    case false:
    digitalWrite (pumpPin, HIGH);
    break;
  }
}

// HEATER
void act_heater (bool toggle)
{
  const int heaterPin = A2;
  pinMode (heaterPin, OUTPUT);

  switch (toggle)
  {
    case true:
    digitalWrite (heaterPin, LOW);
    break;

    case false:
    digitalWrite (heaterPin, HIGH);
    break;
  }
}

// BUBBLER
void act_bubbler (bool toggle)
{
  const int bubblerPin = A1;
  pinMode (bubblerPin, OUTPUT);

  switch (toggle)
  {
    case true:
    digitalWrite (bubblerPin, LOW);
    break;

    case false:
    digitalWrite (bubblerPin, HIGH);
    break;
  }
}

// ---------------------- END OF ACTORS.INO -------------------


// CREATE JSON MSG FORMAT
aJsonStream serial_stream(&Serial);
aJsonObject *createMessage()
{
  aJsonObject *aquaponic, *sensors, *actors, *pump, *heater, *bubbler, *ref, *cy, *ai, *msg;
  aquaponic = aJson.createObject();

  aJson.addItemToObject(aquaponic, "sensor", sensors = aJson.createObject());
    aJson.addNumberToObject(sensors, "temp", (float)tempWtr);
    aJson.addNumberToObject(sensors, "ph", (float)phWtr);

  aJson.addItemToObject(aquaponic, "actor", actors = aJson.createObject());
    aJson.addItemToObject(actors, "pump", pump = aJson.createObject());
      aJson.addNumberToObject(pump, "state", (bool)pumpState);
      if(pumpState == false)
      {
        aJson.addNumberToObject(pump, "dur", (int)pumpOffTime/60);
      }
      else if(pumpState == true)
      {
        aJson.addNumberToObject(pump, "dur", (int)pumpOnTime/60);
      }
      
    aJson.addItemToObject(actors, "heater", heater = aJson.createObject());
      aJson.addNumberToObject(heater, "state", (bool)heaterState);
      if(heaterState == false)
      {
        aJson.addNumberToObject(heater, "dur", (int)heaterOffTime/60);
      }
      else if(heaterState == true)
      {
        aJson.addNumberToObject(heater, "dur", (int)heaterOnTime/60);
      }
   
    aJson.addItemToObject(actors, "bubbler", bubbler = aJson.createObject());
      aJson.addNumberToObject(bubbler, "state", (bool)bubblerState);
      if(bubblerState == false)
      {
        aJson.addNumberToObject(bubbler, "dur", (int)bubblerOffTime/60);
      }
      else if(bubblerState == true)
      {
        aJson.addNumberToObject(bubbler, "dur", (int)bubblerOnTime/60);
      }

  aJson.addItemToObject(aquaponic, "ref", ref = aJson.createObject());
    aJson.addNumberToObject(ref, "refTemp", (float)refTemp);
    aJson.addNumberToObject(ref, "refPh", (float)refPh);
    cy = aJson.createIntArray(refCy, 2);
    aJson.addItemToObject(ref, "refCy", cy);
    ai = aJson.createIntArray(refAi, 2);
    aJson.addItemToObject(ref, "refAi", ai);


  aJson.addItemToObject(aquaponic, "msg", msg = aJson.createObject());
    aJson.addStringToObject(msg, "err", error);
    aJson.addStringToObject(msg, "not", notification);
    aJson.addNumberToObject(msg, "deb", (bool)deb);

  return aquaponic;
}

void setup () 
{
  Serial.begin(9600);
  phSerial.begin(38400);

  phSerial.print("e\r");      // take ph sensor out of continuous mode

  // INITIALIZE TIMER INTERRUPTS
  cli();                      // disable global interrupts

  TCCR1A = 0;                 // set entire TCCR1A register to 0
  TCCR1B = 0;                 // same for TCCR1B

  OCR1A = 15624;              // set compare match register to desired timer count. 16 MHz with 1024 prescaler = 15624 counts/s
  TCCR1B |= (1 << WGM12);     // turn on CTC mode. clear timer on compare match

  TCCR1B |= (1 << CS10);      // Set CS10 and CS12 bits for 1024 prescaler
  TCCR1B |= (1 << CS12);

  TIMSK1 |= (1 << OCIE1A);    // enable timer compare interrupt

  sei();                      // enable global interrupts
}

// TIME BASED ACTUATORS
ISR(TIMER1_COMPA_vect) // timer vector, gets called once a second
{  
  // CYCLING
/*   DEACTIVATED CAUSE OF BAD VALVE (solout HY)
  if(pumpState == false)
  {
    pumpOffTime++;
    if(pumpOffTime > refCy[0]*60 && deb == false)
    {
      pumpState = true; // can't switch arduino pins from inside a vector, see SWITCHING in void loop
      pumpOffTime = 0;
    }
  }
  if(pumpState == true)
  {
    pumpOnTime++;
    if(pumpOnTime > refCy[1]*60 && deb == false)
    {
      pumpState = false;
      pumpOnTime = 0;
    }
  }
*/

  // AIRATION
  if(bubblerState == false)
  {
    bubblerOffTime++;
    if(bubblerOffTime > refAi[0]*60 && deb == false)
    {
      bubblerState = true; // can't switch arduino pins from inside a vector, see SWITCHING in void loop
      bubblerOffTime = 0;
    }
  }
  else
  {
    bubblerOnTime++;
    if(bubblerOnTime > refAi[1]*60 && deb == false)
    {
      bubblerState = false;
      bubblerOnTime = 0;
    }
  }
  
  // HEATER
  // is actually sensor based, just to get the duration
  if(heaterState == false)
  {
    heaterOffTime++;
    heaterOnTime = 0;
  }
  else
  {
    heaterOnTime++;
    heaterOffTime = 0;
  }
}

void loop () 
{
  // SENSORS
  tempWtr = sens_tempWtr ();
  phWtr = sens_phWtr ();
    
  // SENSOR BASED ACTUATORS
  // compare sensor readings with ref values
  // switch corresponding actuators
  // HEATER
  if(tempWtr < refTemp && heaterState == false && deb == false)
  {
    heaterState = true;
  } 
  else if(tempWtr > refTemp + 1 && heaterState == true && deb == false) // refTemp plus one to dejitter
  {
    heaterState = false;
  }
  
  // SWITCHING
  act_pump(pumpState);
  act_heater(heaterState);
  act_bubbler(bubblerState);
 
  // SEND DATA TO RASPBERRYPI
  aJsonObject *aquaponic = createMessage();
  Serial.println ();
  aJson.print(aquaponic, &serial_stream);
  Serial.println ();
  
//  Serial.print("mem after send = ");
//  Serial.println(getFreeMemory());
  
  // Clean UP  
  aJson.deleteItem(aquaponic);    
  memset (error,'\0',20);
  memset (notification,'\0',20);

  delay(1000);
}

// RECEIVING DATA FROM RASPBERRY
// in order to receive json strings longer than 64 Byte, change SERIAL_BUFFER_SIZE to 128 in \Arduino\hardware\arduino\cores\arduino\HardwareSerial.cpp
aJsonObject *msg;
void serialEvent ()
{
  if (serial_stream.available()) 
  {
    // First, skip any accidental whitespace like newlines.
    serial_stream.skip();
  }

  if (serial_stream.available()) 
  {
    msg = aJson.parse(&serial_stream);
  
    // verify object
    if (!msg)
    {
      strcpy( error, "Data Lost" ); // access char error array and tell raspPi
      aJson.deleteItem(msg);
    }
    else
    {
      // aJson.print(msg, &serial_stream);
      strcpy( notification, "Data Received" );
     
      // process msg object and set corrosponding values for actuators and references 
      // RETRIEVE ACTUATORS
      aJsonObject *root = aJson.getObjectItem(msg, "actor");
     
      // {"ref":{"deb":1}}{"actor":{"pump":{"state":0},"heater":{"state":1},"bubbler":{"state":0}}}    
      // {"actor":{"pump":{"state":0,"dur":3}}}
      // {"actor":{"pump":{"state":0}}}
      // {"actor":{"pump":{"dur":99}}}
     
      // RETRIEVE PUMP
      aJsonObject *child1 = aJson.getObjectItem(root, "pump");
      if (child1 != NULL) 
      {
        aJsonObject *child2 = aJson.getObjectItem(child1, "state");
        pumpState = (child2->valuebool);
        child2 = aJson.getObjectItem(child1, "dur");
        if (child2 != NULL)
        {
          if (pumpState == true)
          {
            pumpOnTime = (child2->valueint);
          }
          else
          {
            pumpOffTime = (child2->valueint);
          }
        }
      }
     
      // {"actor":{"heater":{"state":1,"dur":3}}}
  
      // RETRIEVE HEATER
      child1 = aJson.getObjectItem(root, "heater");
      if (child1 != NULL)
      {
        aJsonObject *child2 = aJson.getObjectItem(child1, "state");
        heaterState = (child2->valuebool);
        child2 = aJson.getObjectItem(child1, "dur");
        if (child2 != NULL)
        {
          if (heaterState == true)
          {
            heaterOnTime = (child2->valueint);
          }
          else
          {
            heaterOffTime = (child2->valueint);
          }
        }
      }
     
      // {"actor":{"bubbler":{"state":0,"dur":3}}}
     
      // RETRIEVE BUBBLER
      child1 = aJson.getObjectItem(root, "bubbler");
      if (child1 != NULL)
      {
        aJsonObject *child2 = aJson.getObjectItem(child1, "state");
        bubblerState = (child2->valuebool);
        child2 = aJson.getObjectItem(child1, "dur");
        if (child2 != NULL)
        {
          if (bubblerState == true)
          {
            bubblerOnTime = (child2->valueint);
          }
          else
          {
            bubblerOffTime = (child2->valueint);
          }
        }
      }
      
      // {"ref":{"refTemp":10.00,"refPh":9.00}}
      // {"ref":{"refTemp":10.00,"refPh":9.00,"refCy":[10,40],"refAi":[10,40],"deb":0}}
      // {"ref":{"refCy":[10,40],"refAi":[10,40]}}
      // {"ref":{"refCy":[10,40]}}
     
      // RETRIEVE REFERENCES
      root = aJson.getObjectItem(msg, "ref");
      child1 = aJson.getObjectItem(root, "refTemp");
      if (child1 != NULL)
      {
        refTemp = (child1->valuefloat);
      }
      child1 = aJson.getObjectItem(root, "refPh");
      if (child1 != NULL)
      {
        refPh = (child1->valuefloat);
      }
      child1 = aJson.getObjectItem(root, "refCy");
      if (child1 != NULL)
      {
        refCy[0] = aJson.getArrayItem(child1, 0)->valueint;
        refCy[1] = aJson.getArrayItem(child1, 1)->valueint;
      }
      child1 = aJson.getObjectItem(root, "refAi");
      if (child1 != NULL)
      {
        refAi[0] = aJson.getArrayItem(child1, 0)->valueint;
        refAi[1] = aJson.getArrayItem(child1, 1)->valueint;
      }
  
      // {"msg":{"deb":1}}
  
      // RETRIEVE FLAGS
      root = aJson.getObjectItem(msg, "msg");
      child1 = aJson.getObjectItem(root, "deb");
      if (child1 != NULL)
      {
        deb = (child1->valuebool);
      }

    }
    aJson.deleteItem(msg);
  }
}


  
 

