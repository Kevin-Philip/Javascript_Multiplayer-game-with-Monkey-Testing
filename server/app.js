var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require('../config.json');

var users = [];
var food = [];
var virus = [];
var sockets = {};

var leaderboard = [];
var leaderboardChanged = false;

app.use(express.static(__dirname + '/../client'));

function createFood(numberToCreate) {
  var radius = util.massToRadius(config.foodMass);
    while (numberToCreate > 0) {
        var position = util.randomPosition(radius);
        food.push({
            id: ((new Date()).getTime() + '' + food.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: radius,
            mass: config.foodMass,
        });
        numberToCreate--;
    }
}

function createVirus(numberToCreate) {
  var radius = util.massToRadius(config.virusMass);
    while (numberToCreate > 0) {
        var position = util.randomPosition(radius);
        virus.push({
            id: ((new Date()).getTime() + '' + virus.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: radius,
            mass: config.virusMass,
        });
        numberToCreate--;
    }
}

function initGameWorld(){
  
}

function movePlayer(player) {
  
}

io.on('connection', (socket) => {
  console.log('New player connecting!');
  
  var radius = util.massToRadius(config.defaultPlayerMass);
  var position = util.randomPosition(radius);
  

  var currentPlayer = {
    id: socket.id,
    x: position.x,
    y: position.y,
    massTotal: config.defaultPlayerMass,
    alive: true
  };

  socket.on('connect', (player) => {
    console.log('[INFO] Player ' + player.name + ' connected!');
    users.push(player);
  });

});

var host = config.host;
var port = config.port;
http.listen( port, host, () => {
    console.log('[DEBUG] Listening on ' + host + ':' + port);
});
