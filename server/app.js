var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var config = require('../config.json');
var util = require('./util.js');
var playerfile = require('./player.js');
var gameboardfile = require('./gameboard.js');

app.use(express.static(__dirname + '/../client'));



io.on('connection', (socket) => {

    console.log('[INFO] New player with id : ' + socket.id + 'is trying to connect!');

    if (util.findIndex(playerfile.playerList, socket.id) > -1) {
        console.log('[INFO] Player ID is already connected, kicking.');
        socket.disconnect();
    }
    
    // On créé un nouveau joueur, on stock son socket et on diffuse l'info
    playerfile.createPlayer(socket.id);
    gameboardfile.sockets[socket.id] = socket;
    console.log('[INFO] Player ' + socket.id + ' connected!');
    io.emit('message', socket.id + ' joined the game !');    

    // On créé les foods & virus
    gameboardfile.initGameBoard();

    // Dans le cas d'une déconnection du joueur, on l'enlève de l'array des joueurs et on diffuse sa déconnection dans le chat
    socket.on('disconnect', () => {
        var playerIndex = util.findIndex(playerfile.playerList, socket.id);
        if (playerIndex > -1) {
            gameboardfile.removeVirusAndFood();
            playerfile.playerList.splice(playerIndex, 1);
            io.emit('message', socket.id + ' left the game');
            console.log('[INFO] Player ' + socket.id + ' left!');
        }
    });

    // Dans le cas d'un mouvement, on déplace le joueur
    socket.on('movement', (playerMovement) => {
        playerfile.movePlayer(playerMovement, socket.id);
    });

    // On fait yoyo avec le front suite à l'envoie d'un message du joueur pour ajouter les informations nécessaires au message
    socket.on('message', (msg) => {
        io.emit('message', currentPlayer.id + ' said : ' + msg);
    });

});

// On update presque constamment le game board et on affiche à 60fps les changements 
setInterval(gameboardfile.updateGameBoard, 1000 / 60);
setInterval(gameboardfile.gameLoop, 1000 / 60);

// Configuration serveur
var host = config.host;
var port = config.port;
http.listen(port, host, () => {
    console.log('[DEBUG] Listening on ' + host + ':' + port);
});

// TODO :
// Fini : Modifier la fonction util.randomPosition() pour ne pas pouvoir spawn sur une autre entité
// Fini : Modifier la génération de food et de virus en fonction du nombre de joueurs (+ il y a de joueurs, - on ajoute de virus)
// Fini : Modifier le nombre de food/virus en cas de déconnection d'un utilisateur
// Fini : Implémenter la fonction updateLeaderboard dans gameboard.js
// Fini : Rajouter l'interaction entre joueur dans la méthode interaction dans gameboard.js et implémenter eatPlayer dans player.js
// Fini : Bonus : Faire des trajectoires plus réalistes pour les virus
// Fini : Afficher le leaderboard en front (nécessitera l'ajout d'un socket emit dans la fonction updateLeaderboard())
// Fini : Afficher le nom et le poid du joueur en front sur chaque cellule (taille de police proportionnelle à la taille du joueur)
// Fini : Implémenter le code pour permettre de rester tout le temps "centrer" sur notre joueur et de déplacer la caméra avec zqsd
// Refactor le code client
// Linter le code back
// Voir pour obliger le control+0 si le zoom n'est pas à 100%
// Modifier ce tchat déguelasse
// S'occuper du déploiement sur vm istic (voir pour docker)
// Bonus : Infliger une "pénalité" de mort (ne pas pouvoir respawn tout de suite)
// Bonus : Améliorer les graphismes