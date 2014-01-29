# Network Hub Server

![webserver with MBED device hub reporting the stsus of its collection nodes](http://imgur.com/ASw7cDp.png "MBED and server")

A NodeJS webserver that provides a HTTP API as well as socket connections to ARM-MBED microcontrollers located on the local network or internet. The server allows a user to interact with a bluetooth low energy broadcast network that is usong the ARM-MBED as a router.

This server was written for the ARM Internet-Of-Things competition

## HTTP API Structure


| URL          |Method          | Parameters | Description     
| ------------- |:-------------:|---------:|----------:|
| /devices| GET         | id  | returns JSON array of all devices if id not specified |
|/register| POST| d_id, d_name, d_hub_id| allows for a new (MSP430/Bluetooth) node to be identified by the server

example query : /devices?id=10

example response : 

```json
[
-{
_id: "52e43052712d1c0000b4cdb9",
device_id: "30",
device_name: "EUSTON LONDON",
device_dataset: "{HELLO!}",
device_pointer: "1",
device_hub_id: "1"
}
]
```

## Socket Message Schema

The HTTP api is useful for one-time events (registering nodes/hubs). Other events that need to be checked for regularly are handled by web sockets. 

the following outlines the messages recieved on the SERVER-side, sent from the (mbed) HUB-side

| Message          |Description          | Response |
| ------------- |:-------------:|---------:|
| "PU"| Pull Updates - the hub is requesting any new data that needs to be forwarded to the node network        | a string formatted "DEVICE_ID {UPDATE_DATA}"  | returns JSON array of all devices if id not specified |
|"GET_CMD_REQS"| Get Command Requests - the hub is checking if there are any pending data requests that need to be sent to nodes| reaponds with a string in the format "DEVICE_ID COMMAND_REQUEST"

## Running the server

```javascript
$ git clone https://github.com/ammanvedi/device_network_site.git d_n_s
$ cd d_n_s
$ npm install // install dependancies 
$ node app
```

the app will run at localhost:3000

## MBED Code

the file main.cpp contains the basic code for the MBED microcontroller so it can communicate with the server over ethernet, the code repository is located [here](https://mbed.org/users/ammanvedi/code/IOT_Sockets/)







