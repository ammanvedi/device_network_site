#ifndef BT_DEVICE
#define BT_DEVICE

#include <string>
#include "xbee.h"
#include "xbeeFrame.h"
 
class btNode {
public:
    btNode(int D_ID);
    std::string SendMessage(std::string msg);
    int getID(){return ID;};
  
private:  
    int ID;
    static const char ADDRESS[8];
    //const char dest_address[8] ={0x00, 0x13, 0xA2, 0x00, 0x40, 0x9B, 0x6D, 0xB0};
};
 
#endif