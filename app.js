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
var wss = new WebSocketServer({
    port: 8080
});

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

Device_Map[30] = {
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

wss.on('connection', function (ws) {

    ws.on('message', function (message) {

        var MSG = JSON.parse(message);
        //console.log('msg ' + MSG.TYPE);

        //if the server recieves a request from the hub 
        if ((MSG.TYPE == 'UPDATE') && (MSG.ORIGIN == 'HUB')) {

            console.log('> Pull Updates...');


            var update_String = '';

            updatables.forEach(function (entry) {
                update_String += entry.update_id + ' ' + entry.update_text;
            });

            //define a response object

            var update_response = new Object();

            update_response['TYPE'] = 'RESPONSE';
            update_response['ORIGIN'] = 'SERVER';
            update_response['ID'] = 'N/A';
            update_response['STATUS'] = 1;


            if (update_String == '') {
                update_response['DATA'] = 'NODATA';
            } else {
                update_response['DATA'] = update_String;
            }

            ws.send(JSON.stringify(update_response));

            updatables = new Array();



        }

        if ((MSG.TYPE == 'SYNC') && (MSG.ORIGIN == 'HUB')) {

            console.log('> Syncing Devices...')
            var length = MSG.COUNT;
            for (var i = 0; i < length; i++) {
                device = JSON.parse(MSG.DEVICES[i]);
                console.log('--> ' + device.device_name);
            }

        }

    });

});


database.databaseget('hello');

app.get('/', routes.index);
app.get('/users', user.list);

app.post('/hubconnect', function (req, res) {

    if (database.register_hub(req.query.h_id, req.query.h_name, req.query.h_ip)) {
        res.status(200);
    }

    res.set("Connection", "close");
    res.send('{status : ok}');
    res.end();


});

app.get('/update_device', function (req, res) {

    var dev = Device_Map[req.query.update_id];
    //res.send(JSON.stringify(result));
    res.render('update', {
        hubcount: Object.keys(Hub_Map).length,
        devcount: Object.keys(Device_Map).length,
        DEVICEID: dev.device_id,
        name: dev.device_name,
        dataset: dev.device_dataset,
        pointer: dev.device_pointer,
        hub: dev.device_hub_id,
        hub_name: Hub_Map[dev.device_hub_id].hub_name,
        hub_id: Hub_Map[dev.device_hub_id].hub_id,
        hub_mac_addr: Hub_Map[dev.device_hub_id].hub_mac_addr,
        hub_ip_addr: Hub_Map[dev.device_hub_id].hub_ip_addr
    });



});


app.post('/update_device', function (req, res) {

    var update_document = {
        device_id: req.query.update_id,
        device_name: req.body.dev_name,
        device_dataset: req.body.dev_dataset,
        device_pointer: req.body.dev_pointer,
        device_hub_id: req.body.dev_hub_id
    };

    Device_Map[req.query.update_id] = update_document;

    if (updatables.indexOf(req.query.update_id) > -1) {
        console.log('update of node already pending...');
    } else {
        console.log('pushing data for update of ' + req.query.update_id + ' to pending stack...');
        updatables.push({
            update_id: req.query.update_id,
            update_text: req.body.dev_dataset
        });
    }

    res.end();

});

app.get('/pull_updates', function (req, res) {

    res.set({
        'Content-Type': 'text/plain',
    });

    res.status(200);
    console.log('JSON IS : ' + JSON.stringify(updatables));

    var update_String = '';

    updatables.forEach(function (entry) {

        update_String += entry.update_id + ' ' + entry.update_text + ' ';

    });

    if (update_String == '') {
        res.send('');
    } else {
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

                Device_Map[req.query.d_id] = document;

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