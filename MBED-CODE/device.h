#include "device.h"

 
device::device(int _ID, char _ADDR[])
{
   ID = _ID;
   ADDRESS = _ADDR;
}


std::string device::SendMessage(std::string message)
{
    std::string s = "hello";
    return s;
}	



//--------------------

#ifndef DEVICE_H
#define DEVICE_H

#include <string.h>
#include <string>

class device
{
private:
    int ID;
    const char* ADDRESS;
 
public:
    device(int _ID, char *_ADDR);
    std::string SendMessage(std::string message);
    int GetID()  { return ID; }
};
#endif 