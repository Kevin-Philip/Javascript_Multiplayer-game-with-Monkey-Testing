import express from 'express';
import {
  host, port, defaultFood, defaultVirus, gameTime, stopTime
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
    if (playerIndex > -1) {
      removeVirus(defaultVirus);
      playerList.splice(playerIndex, 1);
      io.emit('message', `${socket.id} left the game`);
      console.log(`[INFO] Player ${socket.id} left!`);
    }
  });

  // Dans le cas d'un mouvement, on déplace le joueur
  socket.on('movement', (playerMovement) => {
    movePlayer(playerMovement, socket.id);
  });

  // On fait yoyo avec le front suite à l'envoie d'un message du joueur pour ajouter les
  // informations nécessaires au message
  socket.on('message', (msg) => {
    io.emit('message', `${socket.id} said : ${msg}`);
  });
});

// On update presque constamment le game board et on affiche à 60fps les changements
setInterval(updateGameBoard, 1000 / 60);
setInterval(gameLoop, 1000 / 60);

// On reset le gameboard toutes les ${gameTime} secondes
setInterval(() => {
  resetGameBoard(io);
}, (1000 * (gameTime + stopTime)));

// Configuration serveur
http.listen(port, host, () => {
  console.log(`[DEBUG] Listening on ${host}:${port}`);
});

// TODO :
// Refactor le code client
// Voir pour obliger le control+0 si le zoom n'est pas à 100%
// Faire des parties de X minutes
// Deployer sur une vm istic
// Faire des tests d'intégration
