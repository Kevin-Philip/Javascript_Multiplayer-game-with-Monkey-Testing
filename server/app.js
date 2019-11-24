var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var util = require('./util.js');
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

function initGameWorld() {

}

function getUserIndex(ID) {
    var index = users.findIndex(function(user) {
        return user.id === ID;
    });
    return index
}


io.on('connection', (socket) => {
    console.log('New player connecting!');

    var radius = util.massToRadius(config.defaultPlayerMass);
    var position = util.randomPosition(radius);

    var currentPlayer = {
        id: socket.id,
        x: position.x,
        y: position.y,
        radius: radius,
        massTotal: config.defaultPlayerMass,
        alive: true
    };

    console.log('[INFO] Player ' + currentPlayer.id + ' connected!');
    io.emit('Player', currentPlayer.id + ' joined the game !');
    users.push(currentPlayer);

    /*     //vraiment utile ? Pourquoi pas dans "connection"
        socket.on('connected', () => {
            console.log('[INFO] Player ' + currentPlayer.id + ' connected!');
            users.push(currentPlayer);
        }); */

    socket.on('disconnect', function() {
        users = users.filter(function(user) {
            return user.id != socket.id;
        });
        io.emit('Player', currentPlayer.id + ' left the game');
    });

    // en millisecondes 1000/60 = 60fps
    setInterval(() => {
        socket.emit('draw', users);
    }, 1000 / 60)

    socket.on('movement', (playerMovement, width, height) => {
        var index = getUserIndex(socket.id);
        var player = users[index];

        if (playerMovement.left && player.x > 0 + player.radius) {
            users[index].x -= 4
                //console.log("moved left")
        }
        if (playerMovement.right && player.x < width - player.radius) {
            users[index].x += 4
                //console.log("moved right")
        }
        if (playerMovement.up && player.y > 0 + player.radius) {
            users[index].y -= 4
                //console.log("moved up")
        }
        if (playerMovement.down && player.y < height - player.radius) {
            users[index].y += 4
                //console.log("moved down")
        }
    });

    socket.on('message', (msg) => {
        io.emit('message', currentPlayer.id + ' said : ' + msg);
    });

});

var host = config.host;
var port = config.port;
http.listen(port, host, () => {
    console.log('[DEBUG] Listening on ' + host + ':' + port);
});