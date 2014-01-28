#include "mbed.h"
#include "EthernetInterface.h"
#include <stdio.h>
#include <string.h>
#include "Websocket.h"
#include "Updateable.h"
#include "ASyncTicker.h"
#include "xbee.h"
#include "xbeeFrame.h"
#include <ctype.h>
#define PORT   80


EthernetInterface ethernet;
Websocket ws("ws://192.168.0.4:8080/");
xbeeFrame xbee(p9,p10,p11);
const char dest_address[8] = {0x00, 0x13, 0xA2, 0x00, 0x40, 0x9B, 0x6D, 0xB0};
char send_data[50] = "xbee string";

void pull_requests(){

}

void pull_updates(){
         char str[100];
         char id[30];
         char new_msg[50];
    // string with a message
        sprintf(str, "PU");
        ws.send(str);
    
        // clear the buffer and wait a sec...
        
            
        memset(str, 0, 100);
        wait(0.5f);
    
        // websocket server should echo whatever we sent it
        if (ws.read(str)) {
            memset(id,0,30);
            memset(new_msg, 0, 50);
            printf("msg form svr: %s\n\r", str);
            sscanf((char *)str, "%s %[^\t]", id, new_msg);

            printf("the id : %s will update to : %s\n\r", id, new_msg);
            
            
            //send string to xbee HERE
        if(strlen(new_msg) == 0)
        {
            printf("nothing to update, better luck next time! (svr response: %s)\n\r", id);
            return;
        }else{
            //data was revieved
            printf("id :  %s  string: %s (original: %s) \n\r", id, new_msg, str);
        }
            
        char to_send[100];
        char* p = to_send;
        char* r = send_data;
        while(*r)
            *p++ = *r++;
        *p++ = ' ';
        r = new_msg;
        while(*r)
            *p++ = *r++;
        *p++ = '\r';
        *p = '\0';
        
        char data_buf[50];    
        xbee.InitFrame();
        xbee.SetDestination((unsigned char *)dest_address);
        xbee.SetPayload(to_send);
        printf("sending payload: %s\n\r", to_send);
        xbee.AssembleFrame();
        xbee.SendFrame();
   
   
           for(int i = 0; i<2; i++)
        {
            xbee.ReceiveFrame(data_buf, 500);
            if(xbee.frameReceived)
            {
                xbee.frameReceived = 0;
                if(xbee.GetType() == TX_STATUS)
                {
                    if(xbee.GetStatus() == 0)
                        printf("Send success!\n\r");
                    else
                        printf("Send failed :(\n\r");
                }
                else if (xbee.GetType() == RX_PACKET_64)
                    printf("Received data: %s\n\r", data_buf);
            }
        }        

        }
            
            
        

}



int main ()
{

    ethernet.init();    // connect with DHCP
    int ret_val = ethernet.connect();
 
    if (0 == ret_val) {
        printf("IP Address: %s\n\r", ethernet.getIPAddress());
    } else {
        error("ethernet failed to connect: %d.\n\r", ret_val);
    }
    
    int interval = 5;
    
    ws.connect();
    
    Timer timer;
    timer.start();

    //every <interval> seconds call to the server to pull updates
    
    while(true){
        if(timer.read() >= interval){
            //perform checks
            pull_updates();
            timer.reset();
            timer.start();
        }
    }
    
    //pull_updates();
        ws.close();

}
