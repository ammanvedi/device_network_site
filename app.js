/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var database = require('./db/databaseInteraction');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({port: 8080});

var app = express();

var updatables = new Array();

var Device_Map = new Object();
var Hub_Map = new Object();

Hub_Map[1] = {
    hub_id: 1,
    hub_mac_addr: "AA:BB:CC:DD:EE:FF:GG:HH", 
    hub_ip_addr: "192.168.0.100",
    hub_name: "mbed-EVE"
}

Device_Map[30] ={
                    device_id: 30,
                    device_name: "msp430-ADAM",
                    device_dataset: "{HELLO WORLD!}",
                    device_pointer: 1,
                    device_hub_id: 1
                };
console.log(Device_Map[30]);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));




// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

wss.on('connection', function(ws) {

//create an array here 


 
    ws.on('message', function(message) {



        //recieving a result of the command
        if(message == 'GET_CMD_REQS'){
            //return  all the commands that are destined for the nodes
        }

        if(message == 'REG_HUB'){
            //the first 
        }


        if(message == 'PU'){
            console.log('pull updates');
           

var update_String  = '';

updatables.forEach(function(entry) {

update_String += entry.update_id + ' ' + entry.update_text;
    
});

if(update_String == ''){
    ws.send('NODATA');
}else{
    ws.send(update_String);
}

updatables = new Array();



        }

    });

});


database.databaseget('hello');

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/hubconnect', function (req, res) {

    if(database.register_hub(req.query.h_id, req.query.h_name, req.query.h_ip)){
        res.status(200);
    }

    res.set("Connection", "close");
    res.send('{status : ok}');
    res.end();


});

app.get('/update_device', function (req, res){

var dev = Device_Map[req.query.update_id];
                        //res.send(JSON.stringify(result));
    res.render('update', {hubcount: Object.keys(Hub_Map).length, devcount: Object.keys(Device_Map).length, DEVICEID: dev.device_id, name: dev.device_name
                                                        , dataset: dev.device_dataset, pointer: dev.device_pointer, hub: dev.device_hub_id
                                                        , hub_name: Hub_Map[dev.device_hub_id].hub_name, hub_id: Hub_Map[dev.device_hub_id].hub_id
                                                        ,hub_mac_addr: Hub_Map[dev.device_hub_id].hub_mac_addr, hub_ip_addr: Hub_Map[dev.device_hub_id].hub_ip_addr});
                        


});


app.post('/update_device', function (req, res){

                var update_document = {
                    device_id: req.query.update_id,
                    device_name: req.body.dev_name,
                    device_dataset: req.body.dev_dataset,
                    device_pointer: req.body.dev_pointer,
                    device_hub_id: req.body.dev_hub_id
                };

                Device_Map[req.query.update_id] = update_document;

                        if(updatables.indexOf(req.query.update_id) > -1){
                            console.log('update of node already pending...');
                        }else{
                            console.log('pushing data for update of ' + req.query.update_id + ' to pending stack...');
                            updatables.push({update_id: req.query.update_id, update_text: req.body.dev_dataset});
                        }

res.end();

});

app.get('/pull_updates', function (req, res){

        res.set({
        'Content-Type': 'text/plain',
    });

res.status(200);
console.log('JSON IS : ' + JSON.stringify(updatables));

var update_String  = '';

updatables.forEach(function(entry) {

update_String += entry.update_id + ' ' + entry.update_text + ' ';
    
});

if(update_String == ''){
    res.send('');
}else{
    res.send(update_String);
}



res.end();

updatables = new Array();


});


//post request allows api users to add a device to the network with a HTTP request
//params in readme
app.post('/register', function (req, res) {

    MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
        if (!err) {
            res.status(200);
            console.log("database : connected to MongoDB");
            db.createCollection('devices', function (err, collection) {

                var document = {
                    device_id: req.query.d_id,
                    device_name: req.query.d_name,
                    device_dataset: [],
                    device_pointer: -1,
                    device_hub_id: req.query.d_hub_id
                };
                collection.insert(document, function (err, record) {

                    console.log('added');
                });




            });
        }
    });

    res.set("Connection", "close");
    res.send('{status : ok}');
    res.end();




});

//api call for devices
//parameters ----
//              NONE --> return all devices
//              :id --> return device id
app.get('/devices', function (req, res) {

    res.set({
        'Content-Type': 'text/plain',
    });


    if (req.query.id != undefined) {
        //res.send('-- device id requested: ' + req.query.id + ' --');


        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
            if (!err) {
                res.status(200);
                console.log("database : connected to device network database");
                db.createCollection('devices', function (err, collection) {

                    collection.find({
                        device_id: req.query.id
                    }).toArray(function (err, result) {
                        console.log(result);


                        res.send(JSON.stringify(result));
                        res.end();


                    });
                });
            }
        });




    } else {



        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
            if (!err) {
                res.status(200);
                console.log("database : connected to MongoDB");
                db.createCollection('devices', function (err, collection) {

                    collection.find().toArray(function (err, result) {
                        //console.log(result);

                        res.send(JSON.stringify(result));
                        res.end();


                    });
                });
            }
        });



    }



});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Started server on port :' + app.get('port'));
});








/* THE MBED CODE THAT WORKS WITH THIS server

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



*/