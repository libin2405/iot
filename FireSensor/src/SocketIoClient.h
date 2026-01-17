#ifndef __SOCKET_IO_CLIENT_H__
#define __SOCKET_IO_CLIENT_H__

#include <Arduino.h>
#include <map>
#include <vector>
#include <WebSocketsClient.h>

#define PING_INTERVAL 10000
#define PING_TIMEOUT 5000

class SocketIoClient {
public:
    void begin(const char* host, int port = 80, const char* url = "/socket.io/?transport=websocket");
    void loop();
    void on(const char* event, std::function<void (const char * payload, size_t length)> func);
    void emit(const char* event, const char * payload = NULL);
    void disconnect();
    void setAuthorization(const char * user, const char * password);

private:
    void webSocketEvent(WStype_t type, uint8_t * payload, size_t length);
    void trigger(const char* event, const char * payload, size_t length);
    WebSocketsClient _webSocket;
    std::map<String, std::function<void (const char * payload, size_t length)>> _events;
    unsigned long _lastPing;
};

#endif