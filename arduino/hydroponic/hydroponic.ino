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


// MAIN HYDROPONIC

// INCLUDES
//#include "sensors.ino"
//#include "actors.ino"
#include <avr/io.h>
#include <avr/interrupt.h>
#include <aJSON.h>
//#include <MemoryFree.h>

// DEFAULT ACTOR STATES
bool motorupState = false;
bool motordownState = false;

bool fanoneState = false;
bool fantwoState = false;
bool fanBtmState = false;

bool humidifierState = false;
bool soloutState = false;
bool solinState = false;

bool bubblerState = false;
bool ledState = true;

// SENSOR VALUES
bool waterStatus;
bool bfWaterStatus;
bool bumperStatus;
int lightIntensity;
int distance;
float tempTop;
float humidTop;
float tempBtm;
float humidBtm;
int lastFlood=0;

// ALERTS
char error[50];
char notification[50];

// DESIRED VALUES
// for sensor based actuators
float refTemp = 30;
float refHumid = 40;
int refLightIntensity = 600;

// DESIRED VALUES
// for time based actuators in minutes
int refLi [2] = {480, 960}; // [0] intervall, [1] duration of illumination
int refBu [2] = {30, 10};   // [0] intervall, [1] duration of biofilter aeration
int refFl = 60; // in min

// TIME COUNTERS IN MIN
int bubblerOffTime = 0;
int bubblerOnTime = 0;
long ledOffTime = 0;
long ledOnTime = 0;
int fanOffTime = 0;
int fanOnTime = 0;
int fanBtmOnTime = 0;
int fanBtmOffTime = 0;

// DEBUG FLAG for manual override
bool deb = false;

// COUNTER for internal usage
int c=0;
int drainTime=0;

// flags for internal usage
bool drain = false;
int refDrainTime = 120; // seconds


// ---------------------- BEGIN OF SENSORS.INO -------------------
// --- arduino IDE causes trouble with including a second file ---

// SENSORS HYDROPONIC

// WATER
boolean sens_water ()
{
  const int waterPin = A0;
  pinMode (waterPin, INPUT);
  digitalWrite (waterPin, HIGH);

  boolean waterStatus = digitalRead (waterPin);
  return !waterStatus;
}

// BIOFILTER WATER
boolean sens_bfWater ()
{
  const int bfWaterPin = A6;
  pinMode (bfWaterPin, INPUT);
  digitalWrite (bfWaterPin, HIGH);

  boolean bfWaterStatus = digitalRead (bfWaterPin);
  return !bfWaterStatus;
}

// TEMPERATURE & HUMIDITY
#include <DHT.h>

#define DHTPIN_TOP A1
#define DHTTYPE_TOP DHT22
#define DHTPIN_BTM A2
#define DHTTYPE_BTM DHT11

DHT dht_top (DHTPIN_TOP, DHTTYPE_TOP);
DHT dht_btm (DHTPIN_BTM, DHTTYPE_BTM);

// TOP
float sens_tempTop ()
{
  float tempTop = dht_top.readTemperature ();
  return tempTop;
}

float sens_humidTop ()
{
  float humidTop = dht_top.readHumidity ();
  return humidTop;
}

// BTM
float sens_tempBtm ()
{
  float tempBtm = dht_btm.readTemperature ();
  return tempBtm;
}

float sens_humidBtm ()
{
  float humidBtm = dht_btm.readHumidity ();
  return humidBtm;
}

// LIGHT
int sens_light ()
{
  const int lightPin = A3;
  pinMode (lightPin, INPUT);

  int lightStatus = analogRead (lightPin);
  return lightStatus;
}

// DISTANCE
long microsecondsToCentimeters(long microseconds)
{
  // speed of sound is 340 m/s or 29 microseconds per centimeter.
  int distanceStatus = microseconds / 29 / 2;
  return distanceStatus;
}


long sens_distance ()
{
  const int distancePin = A4;
  long duration;
 
  cli(); // disable global interrupts to get an acurate reading 

  // PING is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse
  
  pinMode(distancePin, OUTPUT);
  digitalWrite(distancePin, LOW);
  delayMicroseconds(2);
  digitalWrite(distancePin, HIGH);
  delayMicroseconds(5);
  digitalWrite(distancePin, LOW);
 
  // how long does it take till the ping retruns
  
  pinMode(distancePin, INPUT);
  duration = pulseIn(distancePin, HIGH);

  sei(); // enable global interrupts again
 
  // convert the time into a distance
  return microsecondsToCentimeters(duration);
}

// BUMPER
boolean sens_bumper ()
{
  const int bumperPin = A5;
  pinMode (bumperPin, INPUT);
  digitalWrite (bumperPin, HIGH);

  boolean bumperStatus = digitalRead (bumperPin);
  return bumperStatus; 
}

// ---------------------- END OF SENSORS.INO -------------------

// ---------------------- BEGIN OF ACTORS.INO -------------------
// --- arduino IDE causes trouble with including a second file ---

// ACTORS HYDROPONIC

// MOTOR

// declare fkt before using it
void act_motorDown (bool toggle); 

extern bool motordownState;
extern bool motorupState;

// UP
void act_motorUp (bool toggle)
{
  const int motorupPin = 9;
  pinMode (motorupPin, OUTPUT);

  switch (toggle)
  {
    case true:
      // this is important!!! There will be a short if u don't turn off the motoruprelay first! There should be a feedback when motordown really is off...
      act_motorDown (false);
      motordownState = false;

      digitalWrite (motorupPin, LOW); // LOW IS ON
      break;

    case false:
      digitalWrite (motorupPin, HIGH); // HIGH IS OFF... it's backwards again...
      break;
  }
}

// DOWN
void act_motorDown (bool toggle)
{
  const int motordownPin = 10;
  pinMode (motordownPin, OUTPUT);

  switch (toggle)
  {
    case true:
      // this is important!!! There will be a short if u don't turn off the motoruprelay first! There should be a feedback when motordown really is off...
      act_motorUp (false);
      motorupState = false;

      digitalWrite (motordownPin, LOW);
      break;

    case false:
      digitalWrite (motordownPin, HIGH);
      break;
  }
}

// FAN GROUP I
void act_fanOne (bool toggle)
{
  const int fanonePin = 4;
  pinMode (fanonePin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (fanonePin, LOW);
      break;

    case false:
      digitalWrite (fanonePin, HIGH);
      break;
  }
}

// FAN GROUP II
void act_fanTwo (bool toggle)
{ 
  const int fantwoPin = 5;
  pinMode (fantwoPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (fantwoPin, LOW);
      break;

    case false:
      digitalWrite (fantwoPin, HIGH);
      break;
  }
}

// FAN BOTTOM
void act_fanBtm (bool toggle)
{ 
  const int fanBtmPin = 11;
  pinMode (fanBtmPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (fanBtmPin, LOW);
      break;

    case false:
      digitalWrite (fanBtmPin, HIGH);
      break;
  }
}


// HUMIDIFIER
void act_humidifier (bool toggle)
{ 
  const int humidifierPin = 6;
  pinMode (humidifierPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (humidifierPin, LOW);
      break;

    case false:
      digitalWrite (humidifierPin, HIGH);
      break;
  }
}

// SOLENOID OUT
void act_solenoidOut (bool toggle)
{ 
  const int solenoidoutPin = 7;
  pinMode (solenoidoutPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (solenoidoutPin, LOW);
      break;

    case false:
      digitalWrite (solenoidoutPin, HIGH);
      break;
  }
}

// SOLENOID IN
void act_solenoidIn (bool toggle)
{ 
  const int solenoidinPin = 8;
  pinMode (solenoidinPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (solenoidinPin, LOW);
      break;

    case false:
      digitalWrite (solenoidinPin, HIGH);
      break;
  }
}

// BUBBLER
void act_bubbler (bool toggle)
{ 
  const int bubblerPin = 2;
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

// LIGHT
void act_led (bool toggle)
{ 
  const int ledPin = 3;
  pinMode (ledPin, OUTPUT);

  switch (toggle)
  {
    case true:
      digitalWrite (ledPin, LOW);
      break;

    case false:
      digitalWrite (ledPin, HIGH);
      break;
  }
}

// ---------------------- END OF ACTORS.INO -------------------


// CREATE JSON MSG FORMAT
aJsonStream serial_stream(&Serial);
aJsonObject *createMessage()
{

  aJsonObject *hydroponic, *sensors, *actors, *motor, *fan, *fanBtm, *humidifier, *solout, *solin, *bubbler, *led, *ref, *li, *bu, *msg; 
  hydroponic = aJson.createObject();

  aJson.addItemToObject(hydroponic, "sensor", sensors = aJson.createObject());
    aJson.addNumberToObject(sensors, "tempTop", (float)tempTop);
    aJson.addNumberToObject(sensors, "humidTop", (float)humidTop);
    aJson.addNumberToObject(sensors, "tempBtm", (float)tempBtm);
    aJson.addNumberToObject(sensors, "humidBtm", (float)humidBtm);
    aJson.addNumberToObject(sensors, "lightInt", (int)lightIntensity);
    aJson.addNumberToObject(sensors, "water", (bool)waterStatus);
    aJson.addNumberToObject(sensors, "bfWater", (bool)bfWaterStatus);
    aJson.addNumberToObject(sensors, "bumper", (bool)bumperStatus);
    aJson.addNumberToObject(sensors, "dist", (int)distance);
    aJson.addNumberToObject(sensors, "lastFlood", (int)lastFlood/60);  

  aJson.addItemToObject(hydroponic, "actor", actors = aJson.createObject());
    aJson.addItemToObject(actors, "motor", motor = aJson.createObject());
      if(motorupState == true)
      {
        aJson.addNumberToObject(motor, "state", (bool)motorupState);
        aJson.addStringToObject(motor, "dir", "up");
      }
      else if(motordownState == true)
      {
        aJson.addNumberToObject(motor, "state", (bool)motordownState);
        aJson.addStringToObject(motor, "dir", "down");
      }
      else
      {
        aJson.addNumberToObject(motor, "state", (bool)motordownState);
      }


    aJson.addItemToObject(actors, "fan", fan = aJson.createObject());
      if(fanoneState == true && fantwoState == false || fantwoState == true && fanoneState == false)
      {
        aJson.addNumberToObject(fan, "state", true);
        aJson.addNumberToObject(fan, "no", 2);
      }
      else if(fantwoState == true && fanoneState == true)
      {
        aJson.addNumberToObject(fan, "state", true);
        aJson.addNumberToObject(fan, "no", 4);
      }
      else
      {
        aJson.addNumberToObject(fan, "state", 0);
      }
      if(fanoneState == false && fantwoState == false)
      {
        aJson.addNumberToObject(fan, "dur", (int)fanOffTime/60);
      }
      else
      {
        aJson.addNumberToObject(fan, "dur", (int)fanOnTime/60);
      }
            
      aJson.addItemToObject(actors, "fanBtm", fanBtm = aJson.createObject());
        aJson.addNumberToObject(fanBtm, "state", (bool)fanBtmState);

      if(fanBtmState == false)
      {
        aJson.addNumberToObject(fanBtm, "dur", (int)fanBtmOffTime/60);
      }
      else
      {
        aJson.addNumberToObject(fanBtm, "dur", (int)fanBtmOnTime/60);
      }
      
    aJson.addItemToObject(actors, "humidifier", humidifier = aJson.createObject());
      aJson.addNumberToObject(humidifier, "state", (bool)humidifierState);

    aJson.addItemToObject(actors, "solout", solout = aJson.createObject());
      aJson.addNumberToObject(solout, "state", (bool)soloutState);

    aJson.addItemToObject(actors, "solin", solin = aJson.createObject());
      aJson.addNumberToObject(solin, "state", (bool)solinState);

    aJson.addItemToObject(actors, "bubbler", bubbler = aJson.createObject());
      aJson.addNumberToObject(bubbler, "state", (bool)bubblerState);
      if(bubblerState == false)
      {
        aJson.addNumberToObject(bubbler, "dur", (int)bubblerOffTime/60);
      }
      else
      {
        aJson.addNumberToObject(bubbler, "dur", (int)bubblerOnTime/60);
      }

    aJson.addItemToObject(actors, "led", led = aJson.createObject());
      aJson.addNumberToObject(led, "state", (bool)ledState);
      if(ledState == false)
      {
        aJson.addNumberToObject(led, "dur", (int)ledOffTime/60);
      }
      else
      {
        aJson.addNumberToObject(led, "dur", (int)ledOnTime/60);
      }

  aJson.addItemToObject(hydroponic, "ref", ref = aJson.createObject());
    aJson.addNumberToObject(ref, "refTemp", (float)refTemp);
    aJson.addNumberToObject(ref, "refHumid", (float)refHumid);
    aJson.addNumberToObject(ref, "refLightInt", (int)refLightIntensity);
    aJson.addNumberToObject(ref, "refFl", (int)refFl);
    bu = aJson.createIntArray(refBu, 2);
    aJson.addItemToObject(ref, "refBu", bu);
    li = aJson.createIntArray(refLi, 2);
    aJson.addItemToObject(ref, "refLi", li);

  aJson.addItemToObject(hydroponic, "msg", msg = aJson.createObject());
    aJson.addStringToObject(msg, "err", error);
    aJson.addStringToObject(msg, "not", notification);
    aJson.addNumberToObject(msg, "deb", (bool)deb);

  return hydroponic;    
}

void setup () 
{
  Serial.begin (9600);
  dht_top.begin ();

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

// TIMER VECTOR, gets called once a second
ISR(TIMER1_COMPA_vect)
{
  // FLOODCYCLE
  if (solinState == false && deb == false)
  {
    lastFlood++;
    if (lastFlood > refFl*60)
    {
      solinState = true;
      soloutState = true;
    }
  }
  else if (deb == false)
  {
    lastFlood = 0;
  }
  
  if (waterStatus == true)
  {
    solinState = false;
    drain = true;
  }
  
  if (drain == true)
  {
    drainTime++;
    if (drainTime > refDrainTime)
    {
      drain = false;
      soloutState = false;
      drainTime = 0;  
    }
  }
  
  // BIOFILTER SPILL ALERT
  if(bfWaterStatus == true && deb == false)
  {
    soloutState = true;
    drain = true;
  }
  
  // BUBBLERCYCLE
  if (bubblerState == false && deb == false)
  {
    bubblerOffTime++;
    if (bubblerOffTime > refBu[0]*60)
    {
      bubblerState = true;
      bubblerOffTime = 0;
    }
  }
  else if (bubblerState == true && deb == false)
  {
    bubblerOnTime++;
    if (bubblerOnTime > refBu[1]*60)
    {
      bubblerState = false;
      bubblerOnTime = 0;
    }
  }
  // TODO: ADD LIGHT INTENSITY!!!
  // LIGHTCYCLE
  if (ledState == false && deb == false)
  {
    ledOffTime++;
    if (ledOffTime > (long)refLi[0]*60)
    {
      ledState = true;
      ledOffTime = 0;
    }
  }
  else if (ledState == true && deb == false)
  {
    ledOnTime++;
    if (ledOnTime > (long)refLi[1]*60)
    {
      ledState = false;
      ledOnTime = 0;
    }
  }
  
  // FANS
  // are actually sensor based, just to get the duration
  if (fanoneState == false && fantwoState == false)
  {
     fanOffTime++;
     fanOnTime = 0;
  }
  else if (fanoneState == true || fantwoState == true)
  {
    fanOnTime++;
    fanOffTime = 0; 
  }
  
  // FANBTM
  if (fanBtmState == false)
  {
     fanBtmOffTime++;
     fanOnTime = 0;
  }
  else if (fanBtmState == true)
  {
    fanBtmOnTime++;
    fanOffTime = 0; 
  }
}

void loop ()
{

  // READ SENSORS
  waterStatus = sens_water ();
  bfWaterStatus = sens_bfWater();
  lightIntensity = sens_light ();
  distance = sens_distance ();
  bumperStatus = sens_bumper ();
  tempTop = sens_tempTop ();
  humidTop = sens_humidTop ();
  tempBtm = sens_tempBtm ();
  humidBtm = sens_humidBtm ();

  // SENSOR BASED ACTUATORS
  // compare sensor readings with ref values
  // switch corresponding actuators
  
  // MOTOR UP
  // Lightrack distance
  if(distance < 20 && deb == false)
  {
    c++;
    if(c > 5) // check five consecutive readings to eleminate false positives
    {
      int i = 0;
      while (distance < 20 && bumperStatus == 0 && i < 500) // make sure the lightrack is not on top already
      {
        motorupState = true;
        act_motorUp(true);
        distance = sens_distance ();
        i++;
        delay(10);
      }
      if (bumperStatus == 1)
      {
        strcpy( notification, "Lightrack reached max height." );
      }    
      act_motorUp(false);
    }  
  }
  else if (deb == false)
  {
    c=0;
    motorupState = false;
  }
  
  // FANS + HUMIDIFIER
  // Temperature LOW
  if (tempBtm < refTemp && tempTop+1 > tempBtm && deb == false)
  {
    fanoneState = true;
    fantwoState = true;
  }
  else if (tempBtm < refTemp && tempBtm > tempTop && deb == false)
  {
    fanoneState = false;
    fantwoState = false;
  }
  
  // Temperature HIGH
  if (tempBtm > refTemp && tempTop+1 < tempBtm && deb == false)
  {
    fanoneState = true;
    fantwoState = true;
  }
  else if (tempBtm > refTemp && tempBtm < tempTop && deb == false)
  {
    fanoneState = false;
    fantwoState = false;
  }
  
  // Humidity LOW
  if (humidBtm < refHumid && humidTop > humidBtm && deb == false)
  {
    fanoneState = true;
    fantwoState = true;
  }
  else if (humidBtm < refHumid && deb == false)
  { 
    fanoneState = true;
    fantwoState = true;
    humidifierState = true;
  }
  
  // Humidity HIGH
  if (humidBtm > refHumid && deb == false)
  {
    humidifierState = false;
    fanBtmState = true;
    if (humidBtm > refHumid && humidTop < humidBtm && deb == false)
    {
      fanoneState = true;
      fantwoState = true;
    }
  }

  
  // SWITCHING
  if (deb == true)
  {
    act_motorUp(motorupState);
    act_motorDown (motordownState);
  }
  act_fanOne(fanoneState);
  act_fanTwo(fantwoState);
  act_fanBtm(fanBtmState);
  act_humidifier(humidifierState);
  act_solenoidOut(soloutState);
  act_solenoidIn(solinState);
  act_bubbler(bubblerState);
  act_led(ledState);

  // SEND DATA TO RASPBERRYPI
  aJsonObject *hydroponic = createMessage();
  Serial.println ();
  aJson.print(hydroponic, &serial_stream);
  Serial.println ();

//  Serial.print("mem after send = ");
//  Serial.println(getFreeMemory());

  // CLEAN UP
  aJson.deleteItem(hydroponic);
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
      //aJson.print(msg, &serial_stream); // remove for deployment
      strcpy( notification, "Data Received" );

      // process msg object and set corrosponding values for actuators and references 
     
      // {"actor":{"motor":{"state":1,"dir":"up"},"fan":{"state":1,"no":4},"humidifier":{"state":1},"solout":{"state":1},"solin":{"state":1},"bubbler":{"state":1},"led":{"state":1}}}     
     
      // RETRIEVE ACTUATORS
      aJsonObject *root = aJson.getObjectItem(msg, "actor");
      if (root != NULL)
      {
        
        // {"actor":{"motor":{"state":0}}}
        // {"msg":{"deb":1}}{"actor":{"motor":{"state":1,"dir":"up"}}}
  
        // RETRIEVE MOTORUP
        aJsonObject *child1 = aJson.getObjectItem(root, "motor");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          if (child2 != NULL && child2->valuebool == false)
          {
            motorupState = false;
            motordownState = false;
          }
          else if (child2 != NULL)
          {
            aJsonObject *child3 = aJson.getObjectItem(child1, "dir");
            if (child3 != NULL)
            {
              if (strcmp(child3->valuestring, "down")  == 0)
              {
                motordownState = true;
                motorupState = false;
              }
              else if (strcmp(child3->valuestring, "up")  == 0)
              {
                motorupState = true;
                motordownState = false;
              }
            }
            else
            {
              strcpy( error, "Motor direction missing." );
            }
          }
        }
   
        // {"actor":{"fan":{"state":0}}}
        // {"actor":{"fan":{"state":1,"no":2}}}
  
        // RETRIEVE FANS
        child1 = aJson.getObjectItem(root, "fan");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          if (child2->valuebool == false)
          {
            fanoneState = false;
            fantwoState = false;
          }
          else
          {
          aJsonObject *child3 = aJson.getObjectItem(child1, "no");
            if (child3 != NULL)
            {
              if (child3->valueint == 2)
              {
                fanoneState = true;
              }
             else if (child3->valueint == 4)
              {
                fanoneState = true;
                fantwoState = true;
              }
            }
            else
            {
              strcpy( error, "Fan number missing." );
            }
          }          
          child2 = aJson.getObjectItem(child1, "dur");
          if (child2 != NULL)
          {
            if (fanoneState == true || fantwoState == true)
            {
              fanOnTime = (child2->valueint*60);
            }
            else
            {
              fanOffTime = (child2->valueint*60);
            }
          }
        }
  
        // RETRIEVE FANBTM
        child1 = aJson.getObjectItem(root, "fanBtm");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          fanBtmState = (child2->valuebool);
          child2 = aJson.getObjectItem(child1, "dur");
          if (child2 != NULL)
          {
            if (fanBtmState == true)
            {
              fanBtmOnTime = (child2->valueint*60);
            }
            else
            {
              fanBtmOffTime = (child2->valueint*60);
            }
          }
        }
          
          
        
        // {"actor":{"humidifier":{"state":0}}}
        
        // RETRIEVE HUMIDIFIER
        child1 = aJson.getObjectItem(root, "humidifier");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          humidifierState = (child2->valuebool);
        }
        
        // {"actor":{"solin":{"state":0}}}
  
        // RETRIEVE SOLENOID IN
        child1 = aJson.getObjectItem(root, "solin");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          solinState = (child2->valuebool);
        }
  
        // {"actor":{"solout":{"state":0}}}
  
        // RETRIEVE SOLENOID OUT
        child1 = aJson.getObjectItem(root, "solout");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          soloutState = (child2->valuebool);
        }
  
        // {"actor":{"bubbler":{"state":0}}}
  
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
              bubblerOnTime = (child2->valueint*60);
            }
            else
            {
              bubblerOffTime = (child2->valueint*60);
            }
          }
        }
  
        // {"actor":{"led":{"state":0}}}
  
        // RETRIEVE LED
        child1 = aJson.getObjectItem(root, "led");
        if (child1 != NULL)
        {
          aJsonObject *child2 = aJson.getObjectItem(child1, "state");
          ledState = (child2->valuebool);
          child2 = aJson.getObjectItem(child1, "dur");
          if (child2 != NULL)
          {
            if (ledState == true)
            {
              ledOnTime = (child2->valueint*60);
            }
            else
            {
              ledOffTime = (child2->valueint*60);
            }
          }
        }
      } // END if root - actor equ null
      
      // {"ref":{"refTemp":90,"refHumid":10,"refLightInt":200,"refFl":120,"refBu":[60,10],"refLi":[1080,360]}}

      // RETRIEVE REFERENCES
      root = aJson.getObjectItem(msg, "ref");
      if (root != NULL)
      {
        aJsonObject *child1 = aJson.getObjectItem(root, "refTemp");
        if (child1 != NULL)
        {
          refTemp = (child1->valueint);
        }
        child1 = aJson.getObjectItem(root, "refHumid");
        if (child1 != NULL)
        {
          refHumid = (child1->valueint);
        }
        child1 = aJson.getObjectItem(root, "refLightInt");
        if (child1 != NULL)
        {
          refLightIntensity = (child1->valueint);
        }
        child1 = aJson.getObjectItem(root, "refFl");
        if (child1 != NULL)
        {
          refFl = (child1->valueint);
        }
        child1 = aJson.getObjectItem(root, "refLi");
        if (child1 != NULL)
        {
          refLi[0] = aJson.getArrayItem(child1, 0)->valueint;
          refLi[1] = aJson.getArrayItem(child1, 1)->valueint;
        }
        child1 = aJson.getObjectItem(root, "refBu");
        if (child1 != NULL)
        {
          refBu[0] = aJson.getArrayItem(child1, 0)->valueint;
          refBu[1] = aJson.getArrayItem(child1, 1)->valueint;
        }
      }
      
      // {"msg":{"deb":0}}
      // RETRIEVE FLAGS
      root = aJson.getObjectItem(msg, "msg");
      if (root != NULL)
      {
        aJsonObject *child1 = aJson.getObjectItem(root, "deb");
        if (child1 != NULL)
        {
          deb = (child1->valuebool);
        }
      }
    
    
      // {"sensor":{"lastFlood":23}}
      // RETRIEVE LAST FLOOD
      root = aJson.getObjectItem(msg, "sensor");
      if (root != NULL)
      {
        aJsonObject *child1 = aJson.getObjectItem(root, "lastFlood");
        if (child1 != NULL)
        {
          lastFlood = (child1->valuebool*60);
        }
      }
    }
    
    aJson.deleteItem(msg);
  }
}



