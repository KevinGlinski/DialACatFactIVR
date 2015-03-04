var express = require('express')
var app = express();
var fs = require('fs');
var cors = require('cors');
var path = require('path');
//var email = require('emailjs');
var request = require('request');
var util = require('util');
var os = require('os');
var http = require('http');
var bodyParser = require('body-parser');


app.use(express.static('public'));
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

app.set('port', (process.env.PORT || 8080))
app.set('apikey', process.env.APIKEY )
app.set('appid', process.env.APPID )

console.log("app starting")

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
    console.log("IVR is running at localhost:" + app.get('port'))
})


app.post('/nextaction', function(request, response){

    console.log("next action called")

    var lastDigits = request.body.lastdigitsreceived;

    jsonResponse = {};


    if(request.body.lastactionid == "catfact"){
        jsonResponse ={
            "action" : "play",
            "message" : "Press 1 to hear another cat fact.",
            "id" : "ivrmenu"
        };
    }else if(request.body.lastactionid == "ivrmenu"){
        jsonResponse = {
            "action" : "getdigits",
            "number" : "getdigits"
        }
    }else if(request.body.lastactionid == "getdigits" && lastDigits != 1 ){
        jsonResponse = {
            "action" : "disconnect"
        }
    }else{
        jsonResponse ={
            "action" : "play",
            "message" : nextCatFact,
            "id" : "catfact"
        };

        getCatFact();
    }

    response.writeHead(200, {'Content-Type': 'text/json'});
    response.end(JSON.stringify(jsonResponse));
})

app.get('/', function(request, response){
    response.sendFile(path.join(__dirname,"public/index.html"));
})

app.post('/callme', function(request, response){

    console.log("callme " )

    var data = {
        number: request.body.phone
    }

    // An object of options to indicate where to post to
    var post_options = {
        host: "hackathonapi.inin.com",
        port: 80,
        path: "/api/" + app.get("appid") +"/call/callandputintoivr",
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': JSON.stringify(data).length,
            'Api-Key' : app.get("apikey")
        }
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        res.setEncoding('utf8');
    });

    // post the data
    console.log("calling webhook");
    post_req.write(JSON.stringify(data));
    post_req.end();

    response.redirect('/?success=true');
})

function getCatFact(){
    console.log("Getting cat fact")
    // An object of options to indicate where to post to
    var post_options = {
        host: "catfacts-api.appspot.com",
        port: 80,
        path: "/api/facts",
        method: 'GET'
    };

    // Set up the request
    var post_req = http.request(post_options, function(res) {
        var str = '';

         //another chunk of data has been recieved, so append it to `str`
         res.on('data', function (chunk) {
           str += chunk;
         });

         res.on('end', function () {
             nextCatFact = JSON.parse(str).facts[0]
           console.log(nextCatFact);
         });
    });

    post_req.end();
}

getCatFact()
