#include "btNode.h"
#include "mbed.h"
#include "xbee.h"
#include "xbeeFrame.h"

const char btNode::ADDRESS[8] = {0x00, 0x13, 0xA2, 0x00, 0x40, 0x9B, 0x6D, 0xB0};
 
btNode::btNode(int D_ID){
    ID = D_ID;

}
 
std::string btNode::SendMessage(std::string msg) {
    
    xbeeFrame xbee(p9,
               p10,
               p11);
    
    std::string full_msg = "";
    
    char send_data[50]   = "xbee string";
    
        char   to_send[100];
        char * p = to_send;
        char * r = send_data;

        while (*r)
        {
            *p++ = *r++;
        }

        *p++ = ' ';
        r    = (char *)msg.c_str();

        while (*r)
        {
            *p++ = *r++;
        }

        *p++ = '\r';
        *p   = '\0';
        
        //printf("the data to send from class  is %s\n\r\n\r", to_send);
        
        char data_buf[50];

        xbee.InitFrame();
        xbee.SetDestination((unsigned char *) ADDRESS);
        xbee.SetPayload(to_send);
        printf("--> Sending payload: %s\n\r\n\r", to_send);
        xbee.AssembleFrame();
        xbee.SendFrame();
        
        
        
        for (int i = 0; i < 2; i++)
        {
            xbee.ReceiveFrame(data_buf, 500);

            if (xbee.frameReceived)
            {
                xbee.frameReceived = 0;

                if (xbee.GetType() == TX_STATUS)
                {
                    if (xbee.GetStatus() == 0)
                    {
                        printf("--> Send success!\n\r");
                    }
                    else
                    {
                        printf("--> Send failed :(\n\r");
                        //return "sending failed....";
                    }
                }
                else if (xbee.GetType() == RX_PACKET_64)
                {
                    printf("--> Received data: %s\n\r", data_buf);
                }
            }
        }
    
        
        
        std::string response(data_buf);
        return response ;

}