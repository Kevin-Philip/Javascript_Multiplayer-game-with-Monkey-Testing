var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var config = require('../config.json');
var util = require('./util.js');
var playerfile = require('./player.js');
var gameboardfile = require('./gameboard.js')

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
// Done : Modifier la fonction util.randomPosition() pour ne pas pouvoir spawn sur une autre entité
// Modifier la génération de food et de virus en fonction du nombre de joueurs (+ il y a de joueurs, - on ajoute de virus)
// Modifier le nombre de food/virus en cas de déconnection d'un utilisateur
// Done : Implémenter la fonction updateLeaderboard dans gameboard.js
// Afficher le leaderboard en front (nécessitera l'ajout d'un socket emit dans la fonction updateLeaderboard())
// Rajouter l'interaction entre joueur dans la méthode interaction dans gameboard.js
// Afficher le nom et le poid du joueur en front sur chaque cellule (taille de police proportionnelle à la taille du joueur)
// Implémenter et refactor le code actuel pour permettre de rester tout le temps "centrer" sur notre joueur et de déplacer la caméra avec zqsd
// Modifier ce tchat déguelasse
// S'occuper du déploiement (docker ?)
// Bonus : Infliger une "pénalité" de mort (ne pas pouvoir respawn tout de suite)
// Bonus : Faire des trajectoires plus réalistes pour les virus
// Bonus : Améliorer les graphismes