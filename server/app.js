import express from 'express';
import {
  host, port, defaultFood, defaultVirus, gameTime,
} from './config.json';
import { findIndex } from './util';
import { createFood } from './food';
import { createPlayer, movePlayer } from './player';
import { updateGameBoard, gameLoop, resetGameBoard } from './gameboard';
import { sockets, playerList } from './global';
import { createVirus, removeVirus } from './virus';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let timer = gameTime;

app.use(express.static(`${__dirname}/../client`));

// On commence par initialiser les foods du gameboard
createFood(defaultFood);

io.on('connection', (socket) => {
  console.log(`[INFO] New player with id : ${socket.id}is trying to connect!`);

  if (findIndex(playerList, socket.id) > -1) {
    console.log('[INFO] Player ID is already connected, kicking.');
    socket.disconnect();
  }

  // On créé un nouveau joueur, on stock son socket et on diffuse l'info
  createPlayer(socket.id);
  sockets[socket.id] = socket;
  console.log(`[INFO] Player ${socket.id} connected!`);
  io.emit('message', `${socket.id} joined the game !`);

  // On ajoute des virus pour chaque joueur qui se connecte
  createVirus(defaultVirus);

  // Dans le cas d'une déconnection du joueur, on l'enlève de l'array des joueurs et on diffuse sa
  // déconnection dans le chat
  socket.on('disconnect', () => {
    const playerIndex = findIndex(playerList, socket.id);
    removeVirus(defaultVirus);
    playerList[playerIndex].disconnecting = true;
    io.emit('message', `${socket.id} left the game`);
  });

  // Dans le cas d'un mouvement, on déplace le joueur
  socket.on('movement', (playerMovement) => {
    const playerIndex = findIndex(playerList, socket.id);
    if (playerIndex !== -1 && !playerList[playerIndex].disconnecting) {
      movePlayer(playerMovement, socket.id);
    }
  });

  // On fait yoyo avec le front suite à l'envoie d'un message du joueur pour ajouter les
  // informations nécessaires au message
  socket.on('message', (msg) => {
    io.emit('message', `${socket.id} said : ${msg}`);
  });
});

// On update presque constamment le game board et on affiche à 60fps les changements
setInterval(updateGameBoard, 1000 / 60);
setInterval(() => {
  gameLoop(timer);
}, 1000 / 60);

// On reset le gameboard toutes les ${gameTime} secondes
setInterval(() => {
  timer -= 1;
  if (timer <= 0) {
    resetGameBoard(io);
    timer = gameTime;
  }
}, 1000);

// Configuration serveur
http.listen(port, host, () => {
  console.log(`[DEBUG] Listening on ${host}:${port}`);
});

// TODO :
// Done - Corriger l'affichage de leader (quand tu parcours les mass, si player.mass < 10, afficher 10
// Done - Mourir doit clear le setTimeout des deux bonus
// Done - Faire en sorte qu'un joueur ne puisse plus avoir une mass inférieur à 10, même en cas de bonus "j'ai une plus petite mass pendant quelques secondes"
// Done - Corriger la masse du joueur qui s'affiche dans le leaderboard dans le cas où ce dernier est en bonus "j'ai une masse plus petite pendant un certains temps" (et oui il affiche pas la oldMass hélas)
// Done - Mettre la variable damage en attribut de joueur
// Done - Corriger un bug qui survient en multi mais j'arrive pas à savoir comment ni pourquoi, parfois mon joueur respawn plusieurs fois sans raison (peut être lié au fait que si un joueur marche sur le bonus 2, t'as fais changer les virus de positions sans vérifier qu'ils n'arrivaient pas sur un joueur)
// Done - Corriger tous les bugs de son (y'en a vrm plein)
// Done - Afficher sur la page de fin le pseudo du joueur + Le titre Leaderboard
// Done -  Progress (Reste juste à completer la méthode drawTimer dans client.js et décommenter l'appel à cette fonction dans draw) - Éventuellement afficher le temps restant de la partie dans un coin du gameboard (bonus mais assez important quand même)
// Essayer de bidouiller le zoom
// Faire les tests d'intégrations
