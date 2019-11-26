var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var util = require('./util.js');
var config = require('../config.json');

var users = [];
var food = [];
var virus = [];

var leaderboard = [];

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

function getUserIndex(ID) {
    var index = users.findIndex((user) => {
        return user.id === ID;
    });
    return index
}

function removeUser(userID) {
    users = users.filter((user) => {
        return user.id != userID;
    });
}

function eatFood(userIndex, foodIndex){
    users[userIndex].mass += food[foodIndex].mass;
    food.splice(foodIndex, 1);
    users[userIndex].radius = util.massToRadius(users[userIndex].mass);
    createFood(1);
}

function eatVirus(userIndex, virusIndex){
    users[userIndex].mass -= virus[virusIndex].mass
    virus.splice(virusIndex, 1)
    users[userIndex].radius = util.massToRadius(users[userIndex].mass);
    createVirus(1);
}

function alive(userID){
    var userIndex = getUserIndex(userID);
    return users[userIndex].mass >= config.defaultPlayerMass;
    
}

function movePlayer(playerMovement, userIndex) {
    var player = users[userIndex];
    var speed = config.playerSpeed

    if (playerMovement.left && player.x > 0 + player.radius) {
        users[userIndex].x -= speed
    }
    if (playerMovement.right && player.x < config.gameWidth - player.radius) {
        users[userIndex].x += speed
    }
    if (playerMovement.up && player.y > 0 + player.radius) {
        users[userIndex].y -= speed
    }
    if (playerMovement.down && player.y < config.gameHeight - player.radius) {
        users[userIndex].y += speed
    }
}

function moveVirus() {
    var speed = config.virusSpeed
    virus.forEach((virus) => {
        const vertical = Math.random() < 0.5
        const horizontal = Math.random() < 0.5
        if ((virus.x + virus.radius) < (config.gameWidth - speed) && horizontal) {
            virus.x += speed
        } else if ((virus.x - virus.radius) > (0 + speed)){
            virus.x -= speed
        }
        if ((virus.y + virus.radius) < (config.gameHeight - speed) && vertical) {
            virus.y += speed
        } else if ((virus.y - virus.radius) > (0 + speed)){
            virus.y -= speed
        }
    });
}

function refreshBoard(socket) {
    setInterval(() => {
        moveVirus()
        socket.emit('draw', users, food, virus);   
    }, 1000 / 60)
}

function createPlayer(id) {
    var radius = util.massToRadius(config.defaultPlayerMass);
    var position = util.randomPosition(radius);

    var currentPlayer = {
        id: id,
        x: position.x,
        y: position.y,
        radius: radius,
        mass: config.defaultPlayerMass,
    };

    return currentPlayer;
}

io.on('connection', (socket) => {
    console.log('[INFO] New player connecting!');

    // On créé un nouveau joueur
    var currentPlayer = createPlayer(socket.id);
    users.push(currentPlayer);

    // On créé les foods & virus
    createFood(config.defaultFood);
    createVirus(config.defaultVirus);

    // On diffuse dans le l'info qu'un nouveau joueur rejoind la partie
    console.log('[INFO] Player ' + currentPlayer.id + ' connected!');
    io.emit('message', currentPlayer.id + ' joined the game !');

    // On veut afficher en permanence (60 fps) les changements sur le board puisque les virus bougent constament
    // en millisecondes 1000/60 = 60fps
    refreshBoard(socket)
    
    // Dans le cas d'une déconnection du joueur, on l'enlève de l'array des joueurs et on diffuse sa déconnection dans le chat
    socket.on('disconnect', () => {
        removeUser(socket.id);
        io.emit('message', currentPlayer.id + ' left the game');
        console.log('[INFO] Player ' + currentPlayer.id + ' left!');
    });

    // Dans le cas d'un mouvement, on déplace le joueur et on agit si il y a une interaction
    socket.on('movement', (playerMovement) => {
        var userIndex = getUserIndex(socket.id);

        // On déplace le joueur
        movePlayer(playerMovement, userIndex);

        // On vérifie s'il y a une interaction avec un autre objet
        var interaction = false;
        var player = users[userIndex];
        food.forEach((object) => {
            if (util.isInside(object, player)) {
                interaction = true
                eatFood(userIndex, food.indexOf(object));
            }
        })
        virus.forEach((object) => {
            if (util.isInside(object, player)) {
                interaction = true
                eatVirus(userIndex, virus.indexOf(object));
            }
        })

        // Si il y a eu une interaction, on vérifie que le joueur soit toujours en vie et on met à jour le leaderboard et
        if(interaction){
            if(!alive(socket.id)){
                socket.emit('message', 'You died !');
                users[userIndex] = createPlayer(socket.id);
            }
            //updateLeaderBoard(userIndex);
            //interaction = false;  probablement inutile puisque l'on refait la déclaration du 
            //                      boolean interaction à chaque reception de mouvement
        }
    });

    // On fait yoyo avec le front suite à l'envoie d'un message du joueur pour ajouter les informations nécessaires au message
    socket.on('message', (msg) => {
        io.emit('message', currentPlayer.id + ' said : ' + msg);
    });

});

// Configuration serveur
var host = config.host;
var port = config.port;
http.listen(port, host, () => {
    console.log('[DEBUG] Listening on ' + host + ':' + port);
});

// TODO : 
// Ajouter une fonction updateLeaderboard() ligne 193 et l'implémenter
// Afficher le leaderboard en front (nécessitera l'ajout d'un socket emit dans la fonction updateLeaderboard())
// Rajouter l'interaction entre joueur ligne 186
// Refactor un peu le code en séparant les méthodes pour user, food, virus et gameboard
// Afficher le nom et le poid du joueur en front sur chaque cellule (taille de poliec proportionnelle à la taille du joueur)
// Implémenter et refactor le code actuel pour permettre de rester tout le temps "centrer" sur notre joueur et de déplacer la caméra avec zqsd
// Modifier ce tchat déguelasse
// S'occuper du déploiement (docker ?)
// Bonus : Infliger une "pénalité" de mort (ne pas pouvoir respawn tout de suite)
// Bonus : Faire des trajectoires plus réalistes pour les virus
// Bonus : Améliorer les graphismes