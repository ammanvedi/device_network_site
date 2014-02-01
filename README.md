# Network Hub Server

![webserver with MBED device hub reporting the stsus of its collection nodes](http://i.imgur.com/avniIxD.png "MBED and server")

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

## Socket Message Schema / Packet Format

The HTTP api is useful for one-time events (registering nodes/hubs). Other events that need to be checked for regularly are handled by web sockets. 

Sockets use a packet format to transport data; 


```javascript
{
	"TYPE":"REQUEST",
	"ORIGIN":"CLIENT",
	"ID":"SOMERANDOMHASH",
	"DATA":"xbee button",
	"STATUS":"0"
}
```

#### TYPE : UPDATE | RESPONSE | REQUEST
Type defines the overall purpose of the request, request and response are self explanatory. UPDATE will apply to the repeated calls the MBED makes when checking for updates on node information, as well as repeated client checks for responses to data requests (such as sensor data requests)

#### ORIGIN : SERVER | HUB | CLIENT
Origin lays out the source of the request, so it can be dealt with appropriately


#### ID : (SOME ID)
The packet ID will mostly apply to sensor data requests, each data request from a client (browser) will have an associated ID that the client application can use in communication with the server when checking for response data.

#### DATA : REQUEST DATA | RESPONSE DATA
The data that is being sent or returned


#### STATUS : (UNFULFILLED) 0 | (FULFILLED) 1
For client requests, when the client has requested data, their request will be stacked until the MBED receives a response from the bluetooth node in question. When a response is received, the stacked request is marked as fulfilled and the response data added. This allows the server to determine the state of a request when a client (browser) requests the status.

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






