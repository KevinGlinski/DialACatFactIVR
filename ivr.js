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

app.set('port', (process.env.PORT || 8080))
app.set('apikey', process.env.APIKEY )
app.set('appid', process.env.APPID )

console.log("app starting")

app.use(express.static(__dirname + '/public'));

app.listen(app.get('port'), function() {
    console.log("IVR is running at localhost:" + app.get('port'))
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
