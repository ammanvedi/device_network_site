/**
 * Module dependencies.
 */
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var MongoClient = require('mongodb').MongoClient;

var app = express();

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



app.get('/', routes.index);
app.get('/users', user.list);

app.post('/register', function (req, res) {

    MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
        if (!err) {
            console.log("database : connected to MongoDB");
            db.createCollection('devices', function (err, collection) {


                var document = {
                    device_id: req.query.d_id,
                    name: req.query.d_name,
                    status: req.query.d_status
                };
                collection.insert(document, function (err, record) {});

                res.send("done");


            });
        }
    });


});

//api call for devices
//parameters ----
//            	NONE --> return all devices
//				:id --> return device id
app.get('/devices', function (req, res) {

    if (req.query.id != undefined) {
        //res.send('-- device id requested: ' + req.query.id + ' --');


        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
            if (!err) {
                console.log("database : connected to MongoDB");
                db.createCollection('devices', function (err, collection) {

                    collection.find({
                        device_id: req.query.id
                    }).toArray(function (err, result) {
                        console.log(result);
                        res.send(result);
                    });
                });
            }
        });




    } else {



        MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
            if (!err) {
                console.log("database : connected to MongoDB");
                db.createCollection('devices', function (err, collection) {

                    collection.find().toArray(function (err, result) {
                        console.log(result);
                        res.send(result);
                    });
                });
            }
        });


    }

});

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});