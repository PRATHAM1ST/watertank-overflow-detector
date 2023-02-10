#include <WiFi.h>
#include <HTTPClient.h>

// Declaring pin number
const int waterSensorPin = 4;
const int voltageSensorPin = 32;

// Declaring wifi info
const char* WIFI_SSID = "Virus Found !";
const char* WIFI_PASS = "4321darshan";

// Server domain name
String ServerName = "https://watertank-server.vercel.app";

// Mobile number along with country code
String OwnerPhNo = "+918200357641";
String MailAdd = "prathamchudasama142@gmail.com";

// Sensory data 
float waterSensorValue = 0;
float voltageValue = 0;

// Counter for confirming correct data
int confirmationCounter = 0;

// Waiting for water tank to chnage its state from full to not-full
bool tankNotFull = true;


void sendNotification(){
  // Checking the wifi connection and http connection
  if(WiFi.status()== WL_CONNECTED){
      HTTPClient http;

      String serverPath = ServerName + "/mail/" + MailAdd;
      
      // Your Domain name with URL path or IP address with path
      http.begin(serverPath.c_str());

      // Send HTTP GET request
      int httpResponseCode = http.GET();
      
      if (httpResponseCode > 0) {
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        String payload = http.getString();
        Serial.println(payload);
      }
      else {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
      }
      // Free resources
      http.end();
    }
    else {
      Serial.println("WiFi Disconnected");
    }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Connecting to wifi
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  Serial.println("\nConnecting to wifi");

  while(WiFi.status() != WL_CONNECTED){
      Serial.print(".");
      delay(100);
  }

  Serial.println("\nConnected to the WiFi network");

}

void loop() {
  // Reading Water-Sensor Value
  waterSensorValue = touchRead(waterSensorPin);

  // Reading Voltage Value
  voltageValue = analogRead(voltageSensorPin);

  // Checking if the tank is full
  if((waterSensorValue == 0) && (voltageValue < 0.001 || voltageValue >= 0)) 
  {
    if (tankNotFull == true) confirmationCounter++;
    else confirmationCounter = 0;
  }

  else{
    tankNotFull = true;
  }

  // For safety we will check for n iteration (here 5) that the tank is really full and then send notification to the owner
  if(confirmationCounter == 5){    
    tankNotFull = false;
    Serial.println("Sending Notification...");
    sendNotification();
  }

  delay(500);
}
