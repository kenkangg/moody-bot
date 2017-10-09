
const express = require('express');
const bodyParser = require('body-parser');
const server = express();
const spotify = require("./spotify.js")

server.use(bodyParser.urlencoded({extended: false}));

var count = 0
var mood;

server.get('/', function (request, response) {
    spotify.playlist(mood, function(link) {
      count = count + 1
      console.log("Request Count: " + count)
      response.send(link);
    })
});
server.post('/', function (request, response) {
    mood = request.body['mood'];
    // console.log(mood);
    response.send(request.body);
});


server.listen(3500);
