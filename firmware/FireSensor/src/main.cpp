#include <Arduino.h>
#include <WiFi.h>
#include "SocketIoClient.h" 
#include <DHT.h>
#include <ArduinoJson.h>

// --- CONFIGURATION ---
const char* ssid     = "--_--";     
const char* password = "libin1234"; 
char host[] = "10.164.45.250";              
int port = 5000;

#define DHTPIN 4
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

SocketIoClient socket; 
unsigned long lastUpdate = 0;
bool isConnected = false;

void event_connect(const char * payload, size_t length) {
  Serial.println("\n✅ SUCCESS: Connected to Backend Server!");
  isConnected = true;
}

void event_disconnect(const char * payload, size_t length) {
  Serial.println("\n❌ DISCONNECTED from Server!");
  isConnected = false;
}

void setup() {
    Serial.begin(115200);
    delay(1000); 
    dht.begin();
    
    Serial.println("\n\n--- ESP32 FIRE SENSOR STARTING ---");
    Serial.print("Connecting to Wi-Fi");
    WiFi.begin(ssid, password);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWi-Fi connected!");
    Serial.print("ESP32 IP Address: ");
    Serial.println(WiFi.localIP());

    // Setup Socket Events
    socket.on("connect", event_connect);
    socket.on("disconnect", event_disconnect);
    
    // IMPORTANT: EIO=4 is required for your Python server
    Serial.print("Attempting to connect to Server at: ");
    Serial.print(host);
    Serial.println(":5000");
    socket.begin(host, port, "/socket.io/?EIO=4&transport=websocket");
}

void loop() {
    socket.loop();

    if (millis() - lastUpdate >= 2000) {
        lastUpdate = millis();

        // 1. Check if we are connected
        if (!isConnected) {
            Serial.println("⚠️  Waiting for Server Connection...");
            // If Wi-Fi dropped, reconnect
            if (WiFi.status() != WL_CONNECTED) {
                 Serial.println("❌ Wi-Fi Lost! Reconnecting...");
                 WiFi.begin(ssid, password);
            }
            return; // Don't try to send data if not connected
        }

        // 2. Read Sensor
        float h = dht.readHumidity();
        float t = dht.readTemperature(true); // FAHRENHEIT

        if (isnan(h) || isnan(t)) {
            Serial.println("❌ Error: Could not read from DHT sensor!");
            return;
        }

        Serial.print("Sensor Read -> Temp: ");
        Serial.print(t);
        Serial.print("°C | Humidity: ");
        Serial.print(h);
        Serial.println("%");

        // 3. Send Data
        StaticJsonDocument<200> doc;
        doc["temperature"] = t;
        doc["humidity"] = h;
        doc["status"] = "online";
        doc["source"] = "ESP32";
        
        char jsonBuffer[512];
        serializeJson(doc, jsonBuffer);
        
        socket.emit("esp32_sensor_update", jsonBuffer);
        Serial.println("📤 Data Sent!");
    }
}