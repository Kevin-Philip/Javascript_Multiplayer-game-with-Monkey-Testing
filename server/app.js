import express from 'express';
import config from './config.json';
import { findIndex } from './util';
import { playerList, createPlayer, movePlayer } from './player';
import {
  initGameBoard, removeVirusAndFood, updateGameBoard, gameLoop, sockets,
} from './gameboard';

const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.use(express.static(`${__dirname}/../client`));

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

  // On créé les foods & virus
  initGameBoard();

  // Dans le cas d'une déconnection du joueur, on l'enlève de l'array des joueurs et on diffuse sa
  // déconnection dans le chat
  socket.on('disconnect', () => {
    const playerIndex = findIndex(playerList, socket.id);
    if (playerIndex > -1) {
      removeVirusAndFood();
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

// Configuration serveur
const { host } = config;
const { port } = config;
http.listen(port, host, () => {
  console.log(`[DEBUG] Listening on ${host}:${port}`);
});

// TODO :
// Refactor le code client
// Linter le code back
// Voir pour obliger le control+0 si le zoom n'est pas à 100%
// Adapter le chat à la longueur des messages
// S'occuper du déploiement sur vm istic (voir pour docker)
// Bonus : Infliger une "pénalité" de mort (ne pas pouvoir respawn tout de suite)
// Bonus : Améliorer les graphismes
// Bonus : Rajouter du son
