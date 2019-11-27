var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var config = require('../config.json');
var playerfile = require('./player.js');
var gameboardfile = require('./gameboard.js')

app.use(express.static(__dirname + '/../client'));

io.on('connection', (socket) => {
    console.log('[INFO] New player connecting!');

    // On créé un nouveau joueur
    playerfile.createPlayer(socket.id);

    // On créé les foods & virus
    gameboardfile.initGameBoard();

    // On diffuse dans le l'info qu'un nouveau joueur rejoind la partie
    console.log('[INFO] Player ' + socket.id + ' connected!');
    io.emit('message', socket.id + ' joined the game !');

    // On veut afficher en permanence (60 fps) les changements sur le board puisque les virus bougent constament
    // en millisecondes 1000/60 = 60fps
    gameboardfile.refreshBoard(socket);
    
    // Dans le cas d'une déconnection du joueur, on l'enlève de l'array des joueurs et on diffuse sa déconnection dans le chat
    socket.on('disconnect', () => {
        playerfile.removePlayer(socket.id);
        io.emit('message', socket.id + ' left the game');
        console.log('[INFO] Player ' + socket.id + ' left!');
    });

    // Dans le cas d'un mouvement, on déplace le joueur et on agit si il y a une interaction
    socket.on('movement', (playerMovement) => {

        // On déplace le joueur
        playerfile.movePlayer(playerMovement, socket.id);

        // On vérifie s'il y a une interaction avec un autre objet
        var interaction = gameboardfile.interaction(socket.id);

        // Si il y a eu une interaction, on vérifie que le joueur soit toujours en vie et on met à jour le leaderboard
        if(interaction){
            if(!playerfile.isAlive(socket.id)){
                socket.emit('message', 'You died !');
                playerfile.resetPlayer(socket.id);
            }
            gameboardfile.updateLeaderboard();
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