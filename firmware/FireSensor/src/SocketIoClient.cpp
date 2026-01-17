#include "SocketIoClient.h"

const char * socketIoClientPackage = "SocketIoClient";

void SocketIoClient::begin(const char* host, int port, const char* url) {
    _webSocket.begin(host, port, url);
    _webSocket.onEvent(std::bind(&SocketIoClient::webSocketEvent, this, std::placeholders::_1, std::placeholders::_2, std::placeholders::_3));
    _lastPing = millis();
}

void SocketIoClient::loop() {
    _webSocket.loop();
    if (millis() - _lastPing > PING_INTERVAL) {
        _webSocket.sendTXT("2");
        _lastPing = millis();
    }
}

void SocketIoClient::on(const char* event, std::function<void (const char * payload, size_t length)> func) {
    _events[event] = func;
}

void SocketIoClient::emit(const char* event, const char * payload) {
    String msg = String("42[\"") + event + String("\"");
    if (payload) {
        msg += String(",") + payload;
    }
    msg += String("]");
    _webSocket.sendTXT(msg);
}

void SocketIoClient::trigger(const char* event, const char * payload, size_t length) {
    auto e = _events.find(event);
    if (e != _events.end()) {
        e->second(payload, length);
    }
}

void SocketIoClient::disconnect() {
    _webSocket.disconnect();
}

void SocketIoClient::setAuthorization(const char * user, const char * password) {
    _webSocket.setAuthorization(user, password);
}

void SocketIoClient::webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
        case WStype_DISCONNECTED:
            trigger("disconnect", NULL, 0);
            break;
        case WStype_CONNECTED:
            // --- CRITICAL FIX HERE ---
            // Send the "Connect" packet (Type 40) required by Socket.IO v4
            _webSocket.sendTXT("40"); 
            trigger("connect", NULL, 0);
            break;
        case WStype_TEXT: {
            String text = (char*) payload;
            if (text.startsWith("42")) {
                text = text.substring(2);
                int bracketIndex = text.indexOf('[');
                if (bracketIndex != -1) {
                    int commaIndex = text.indexOf(',');
                    if (commaIndex == -1) commaIndex = text.length() - 1;
                    
                    String eventName = text.substring(bracketIndex + 2, commaIndex - 1);
                    
                    if (text.indexOf(',') > 0) {
                        String data = text.substring(commaIndex + 1, text.length() - 1);
                        trigger(eventName.c_str(), data.c_str(), data.length());
                    } else {
                        trigger(eventName.c_str(), NULL, 0);
                    }
                }
            }
            break;
        }
        default:
            break;
    }
}