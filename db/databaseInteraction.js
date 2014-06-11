var MongoClient = require('mongodb').MongoClient;

exports.databaseget = function (x)
	{
		console.log('calling' + x);
	}

exports.register_hub = function(_id, _name, _ip)
	{

		MongoClient.connect("mongodb://ammanvedi:poopoo12@ds057528.mongolab.com:57528/seeder-dev", function (err, db) {
        if (!err) {
            //res.status(200);
            console.log("database : connected to MongoDB");
            db.createCollection('hubs', function (err, collection) {

                var document = {
                    hub_id: _id,
                    hub_name: _name,
                    hub_ip_addr: _ip
                };
                collection.insert(document, function (err, record) {


                    console.log('added');
                    console.log(document);
                });




            });

            return true;
        }
    });



}

//register hub

//get devices with id