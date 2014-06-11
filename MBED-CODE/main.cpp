#include "mbed.h"
#include "EthernetInterface.h"
#include <stdio.h>
#include "Websocket.h"
#include "xbee.h"
#include "xbeeFrame.h"
#include "MbedJSONValue.h"
#include <ctype.h>
#include <string>
#include "btNode.h"
#include <map>
#include <utility>
#define PORT 80
const std::string HUBID = "1";

// status leds
// led 1
// lit - successful ethernet connection
DigitalOut led_ethernet(LED1);

// led 2
// lit - successful socket connection
DigitalOut led_socket(LED2);

map<int, btNode> BTnodes;

EthernetInterface ethernet;
Websocket         ws("ws://192.168.0.4:8080/");

bool sync_devices()
{
    MbedJSONValue sync_data;

    std::string sync_string;
    
        // fill the object
    sync_data["TYPE"]   = "SYNC";
    sync_data["ORIGIN"] = "HUB";
    sync_data["ID"]     = "N/A";

    //sync_data["DATA"]   = "N/A";
    //iterate over local nodes and send node list to svr over socket
    
    // map<char, int>::iterator p;
    
    int index = 0;
  
for (std::map<int, btNode>::iterator it = BTnodes.begin(); it != BTnodes.end(); ++it)
{
  MbedJSONValue device = it->second.GetAsJSON();
  printf("dev : %s\n\r", device.serialize());
  sync_data["DEVICES"][index] = device.serialize();
  index++;
} 
    
    sync_data["STATUS"] = "0";
    
    sync_string = sync_data.serialize();
    
    ws.send((char *)sync_string.c_str());

    // serialize it into a JSON string

    
return true;
}

void pull_updates()
{
    // build json request string
    MbedJSONValue request;

    std::string s;

    // fill the object
    request["TYPE"]   = "UPDATE";
    request["ORIGIN"] = "HUB";
    request["ID"]     = "N/A";
    request["DATA"]   = "N/A";
    request["STATUS"] = "N/A";

    // serialize it into a JSON string
    s = request.serialize();

    // printf("json: %s\r\n", s.c_str());

    char str[100];
    char id[30];
    char new_msg[50];

    // string with a message
    // sprintf(str, "PU");
    ws.send((char *) s.c_str());

    // clear the buffer and wait a sec...
    memset(str, 0, 100);
    wait(0.5f);

    // websocket server should echo whatever we sent it
    if (ws.read(str))
    {
        memset(id, 0, 30);
        memset(new_msg, 0, 50);

        // response from server is JSON
        // parse back to a traversable object
        MbedJSONValue updt_res;

        parse(updt_res, str);
        printf("> %s from svr with data %s\n\r", updt_res["TYPE"].get<std::string>().c_str(), updt_res["DATA"].get<std::string>().c_str());
        sscanf((char *) updt_res["DATA"].get<std::string>().c_str(), "%s %[^\t]", id, new_msg);

        // send string to xbee HERE
        if (strlen(new_msg) == 0)
        {
            printf("--> Nothing to update.\n\r\n\r");
            return;
        }else{
            printf("--> id :  %s  string: %s \n\r", id, new_msg);
        }
        
        std::string real_msg(new_msg);
        
        btNode bt = BTnodes.find(atoi(id))->second;
        
        printf("> Found device with ID : %d\n\r\n\r", bt.getID());
        
        std::string result = bt.SendMessage(real_msg);
        
        printf("--> xbee response : %s\n\r\n\r", result.c_str());
        
    }
}

int main()
{
    //add a registered device to the device array
    btNode b(30, "mp430-adam", HUBID);
    BTnodes.insert(pair<int, btNode>(30,b));
    
    led_ethernet = 0;
    led_socket   = 0;

    ethernet.init();    // connect with DHCP

    int ret_val = ethernet.connect();

    if (0 == ret_val)
    {
        printf("\n\rIP Address: %s\n\r", ethernet.getIPAddress());

        led_ethernet = 1;
    }
    else
    {
        error("ethernet failed to connect: %d.\n\r", ret_val);
    }

    int interval = 5;

    if (ws.connect())
    {
        led_socket = 1;
    }

    Timer timer;

    timer.start();
    
    sync_devices();

    // every <interval> seconds call to the server to pull updates
    while (true)
    {
        if (timer.read() >= interval)
        {
            // perform checks
            pull_updates();
            timer.reset();
            timer.start();
        }
    }
    //ws.close();
}



