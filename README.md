# device_network_site

![webserver with MBED device hub reporting the stsus of its collection nodes](http://i.imgur.com/6vk3y96.png "MBED and server")

webserver with MBED device hub reporting the stsus of its collection nodes

A simple node server that implements an API to GET and POST data about device nodes on a network.

## API Structure

GET requests can be sent to /devices

| Parameter     | Type          |
| ------------- |:-------------:|
| id          | int|

requests to the root url /devices will return all of the devices in a JSON array.

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

POST requests can be sent to /register

| Parameter     | Type          |
| ------------- |:-------------:|
| d_id          | int|
| d_name        | string     |
| d_status      | string (on/off)|

example query : /register?d_id=5&d_name=alan&d_status=ON

## Running the code

```javascript
$ git clone https://github.com/ammanvedi/device_network_site.git d_n_s
$ cd d_n_s
$ npm install // install dependancies 
$ node app
```

the app will run at localhost:3000



