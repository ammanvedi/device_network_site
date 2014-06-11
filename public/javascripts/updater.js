window.onload = function () {

	var fruit_div = document.getElementById('fruit_update');
	var price = document.getElementById('price_box');
	var fruit = document.getElementById('fruit_select');
	var addbtn = document.getElementById('add_fruit_btn');
	var clearbtn = document.getElementById('clear_fruit_btn');
	var dataset = document.getElementById('dataset');
	var fullstring = '{';
	var devices = new Object();

	var graph = {
  "nodes": [
   /* {
      "id": "n0",
      "label": "A node",
      "x": 0,
      "y": 0,
      "size": 3
    },
    {
      "id": "n1",
      "label": "Another node",
      "x": 3,
      "y": 1,
      "size": 2
    },
    {
      "id": "n2",
      "label": "And a last one",
      "x": 1,
      "y": 3,
      "size": 1
    }*/
  ],
  "edges": [
    // {
    //   "id": "e0",
    //   "source": "n0",
    //   "target": "n1"
    // },
    // {
    //   "id": "e1",
    //   "source": "n1",
    //   "target": "n2"
    // },
    // {
    //   "id": "e2",
    //   "source": "n2",
    //   "target": "n0"
    // }
  ]
}




	addbtn.addEventListener('click', function (evt) {
		var partial = fruit.value + ':' + price.value + ';';

		fullstring += partial;

		dataset.value = fullstring + '}';

		console.log('the value for fruit is ' + fruit.value );
		console.log('the value for fruit is ' + fruit.value );
	});

	clearbtn.addEventListener('click', function (evt) {

		dataset.value = '';

	});

 	/*var socket;  
    var host = "ws://localhost:8080/";  
    var socket = new WebSocket(host);  
  
        //message('<p class="event">Socket Status: '+socket.readyState);  
  try{
        socket.onopen = function(){  
             //message('<p class="event">Socket Status: '+socket.readyState+' (open)');  
 				console.log('connectef');
                var req = new Object();
             req[1] = {
             	TYPE: "SYNC",
             	ORIGIN: "CLIENT",
             	ID:"DSDSDSA",
             	DATA:"",
             	STATUS:"0"

             };
             console.log(JSON.stringify(req));
             socket.send(JSON.stringify(req[1]));
             initGraph(graph);
        }  
  
        socket.onmessage = function(msg){  
             //message('<p class="message">Received: '+msg.data);
             console.log(msg);
             var ServerPacket = JSON.parse(msg.data);

             if((ServerPacket.TYPE == 'UPDATERESPONSE') && (ServerPacket.ORIGIN == 'SERVER'))
             {
             	console.log('devices: ' + JSON.stringify(ServerPacket.DATA));
             	devices = ServerPacket.DATA;
             	buildNodes(devices);
             	displaygraph(graph);
             }

        }  
  
        socket.onclose = function(){  
             //message('<p class="event">Socket Status: '+socket.readyState+' (Closed)');  
        }             
  
    } catch(exception){  
         message('<p>Error'+exception);  
    }  */

/*function initGraph(graph_s){
	    var hub =   {
      "id": "HUB",
      "label": "HUB",
      "x": 0,
      "y": 0,
      "size": 4
    };
	graph_s["nodes"].push(hub);
}

function displaygraph(graphdata){

	console.log(graphdata);
      // Instanciate sigma:
      s = new sigma({
        graph: graphdata,
        container: 'container'
      });
}


function buildNodes(devicemap)
{
	console.log(devicemap);
for (var key in devicemap) {
  if (devicemap.hasOwnProperty(key)) {
    //alert(key + " -> " + p[key]);
    console.log('GOT ' + devicemap[key].device_name);
    var newnode =   {
      "id": devicemap[key].device_id.toString(),
      "label": devicemap[key].device_name,
      "x": Math.random(),
      "y": Math.random(),
      "size": 2
    };

    var newedge =    {
       "id": devicemap[key].device_id + "-HUB",
       "source": devicemap[key].device_id.toString(),
      "target": "HUB"
     }


    graph["edges"].push(newedge);
    graph["nodes"].push(newnode);
    
  }
}

console.log(graph);

}*/



}