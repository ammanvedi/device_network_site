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

var app = express();

var updatables = new Array();

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





        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
            if (!err) {
                //res.status(200);
                console.log("database : connected to device network database");
                db.createCollection('devices', function (err, collection) {

                    collection.find({
                        device_id: req.query.update_id
                    }).toArray(function (err, result) {
                        console.log(result[0]);


                        //res.send(JSON.stringify(result));
                        res.render('update', { DEVICEID: result[0].device_id, name: result[0].device_name
                                                        , dataset: result[0].device_dataset, pointer: result[0].device_pointer, hub: result[0].device_hub_id});
                        


                    });
                });
            }
        });  



});


app.post('/update_device', function (req, res){
        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
        if (!err) {
            res.status(200);
            console.log("database : connected to MongoDB");
            db.createCollection('devices', function (err, collection) {

                console.log('ID : ' + req.body.DEVICEID + ' ' + req.query.dev_id);

                var document = {
                    device_id: req.query.update_id,
                    device_name: req.body.dev_name,
                    device_dataset: req.body.dev_dataset,
                    device_pointer: req.body.dev_pointer,
                    device_hub_id: req.body.dev_hub_id
                };
                collection.update({device_id: req.query.update_id}, document,function (err, result){
                    if(!err){
                        console.log(result);
                        if(updatables.indexOf(req.query.update_id) > -1){
                            console.log('update of node already pending...');
                        }else{
                            console.log('pushing data for update of ' + req.query.update_id + ' to pending stack...');
                            updatables.push({update_id: req.query.update_id, update_text: req.body.dev_dataset});
                        }

                        
                    }
                });
            });
        }
    });

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
#include "EthernetNetIf.h"
#include "HTTPClient.h"
#include "NTPClient.h"
#include "HTTPServer.h"
#include "RPCFunction.h"
#include <sstream>
#include "xbee.h"
#include "xbeeFrame.h"
#include "EthernetInterface.h"



#define HOSTNAME "HUB-01"
#define DEVICENAME "ADAM"



EthernetNetIf eth(HOSTNAME);
HTTPClient http;
NTPClient ntp;
Ticker pull_ticker;
xbeeFrame xbee(p9,p10,p11);

const char dest_address[8] = {0x00, 0x13, 0xA2, 0x00, 0x40, 0x9B, 0x6D, 0xB0};

char send_data[50] = "xbee button";


using namespace std;


void pull_updates(){
    
    HTTPText a_txt;
    
    HTTPResult rs = http.get("192.168.0.4:3000/pull_updates", &a_txt);
    if (rs==HTTP_OK) {
        printf("Result ok : %s (code : %d )\n\r", a_txt.gets(), rs);
    } else {
        printf("Error %s\n\r", a_txt.gets());
    }
    
    char id[30] = "";
    char new_msg[50] = "";
    
    sscanf((char *)a_txt.gets(), "%s %s", id, new_msg);
    if(strlen(new_msg) == 0){
        printf("no data\n\r");
        return;
        }else{
            printf("update device %s with string %s\n\r", id, new_msg);
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
        *p = '\0';
        
        
 
        char data_buf[50];    
        xbee.InitFrame();
        xbee.SetDestination((unsigned char *)dest_address);
        xbee.SetPayload(to_send);
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

int main() {
    

    printf("Try starting the program with the network disconnected and then connect after a few timeouts reported\n\n\r");
    EthernetErr ethErr;
    int count = 0;
    do {
        printf("Setting up %d...\n\r", ++count);
        ethErr = eth.setup();
        if (ethErr) printf("Timeout\n\r", ethErr);
    } while (ethErr != ETH_OK);


    printf("Connected OK\n\r");
    const char* hwAddr = eth.getHwAddr();

    IpAddr ethIp = eth.getIp();
    printf("IP address : %d.%d.%d.%d\n\r", ethIp[0], ethIp[1], ethIp[2], ethIp[3]);
    
    char ip_buffer[20];
    sprintf(ip_buffer, "%d.%d.%d.%d", ethIp[0], ethIp[1], ethIp[2], ethIp[3]);
    
    //the hub will register itself with the server
     HTTPMap msg;
     
     stringstream url;
     url << "192.168.0.4:3000/hubconnect?h_id=" << HOSTNAME << "&h_name=" << DEVICENAME << "&h_ip=" << ip_buffer;
     const std::string uri = url.str();
     
     printf("query server : %s \n\r", uri);
  
   HTTPResult r1 = http.post(uri.c_str(),msg,NULL); 
  if( r1 == HTTP_OK )
  {
    printf("Hub %s registered with server (code : %d )\n\r", HOSTNAME, r1);
  }
  else
  {
    printf("Could not register, error : %d\n\r", r1);
  }
  
 
  

    printf("\nHTTPClient get...\n");
    HTTPText txt;
    HTTPResult r = http.get("192.168.0.4:3000/devices", &txt);
    if (r==HTTP_OK) {
        printf("Result ok : %s (code : %d )\n\r", txt.gets(), r);
    } else {
        printf("Error %s\n", txt.gets());
    }
    
    //begin polling the server for updates to the devices
    
    pull_ticker.attach(&pull_updates, 5.0);


}

*/