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