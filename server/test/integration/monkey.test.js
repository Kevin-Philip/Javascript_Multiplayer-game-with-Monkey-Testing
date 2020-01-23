import express from 'express';
import { connect } from 'socket.io-client';
import {
  host, port, defaultFood, defaultVirus, gameTime, monkeyNumber,
} from '../../config.json';
import { findIndex } from '../../util';
import { createFood } from '../../food';
import { createPlayer, movePlayer } from '../../player';
import { updateGameBoard, gameLoop, resetGameBoard } from '../../gameboard';
import { sockets, playerList } from '../../global';
import { createVirus, removeVirus } from '../../virus';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let timer = gameTime;

// On commence par initialiser les foods du gameboard
createFood(defaultFood);

const socketClient = [];

for (let i = 0; i < monkeyNumber; i += 1) {
  const socket = connect('http://localhost:3000', {
    'reconnection delay': 0,
    'reopen delay': 0,
    'force new connection': true,
  });
  socketClient[i] = socket;
}

let counter = 10;
const MouvementsJoueurs = [];

const mouvementIntervalID = setInterval(() => {
  for (let i = 0; i < monkeyNumber; i += 1) {
    if (counter === 10) {
      const x = Math.random() < 0.5;
      const y = Math.random() < 0.5;
      const mouvement = {
        up: x,
        down: !x,
        left: y,
        right: !y,
      };
      MouvementsJoueurs[i] = mouvement;
    }
    socketClient[i].emit('movement', MouvementsJoueurs[i]);
  }
  counter = counter === 10 ? 0 : counter += 1;
}, 1000 / 60);

setTimeout(() => {
  clearInterval(mouvementIntervalID);
  socketClient.forEach((socket) => {
    socket.disconnect();
  });
}, 60000);

io.on('connection', (socket) => {
  console.log(`[INFO] New player with id : ${socket.id}is trying to connect!`);

  if (findIndex(playerList, socket.id) !== -1) {
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
