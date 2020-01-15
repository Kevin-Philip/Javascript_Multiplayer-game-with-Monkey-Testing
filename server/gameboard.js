import { findIndex, areInContact, setIntervalX, playerSort } from './util';
import {
  gameWidth, gameHeight, respawnTimeout, stopTime, defaultVirus,
} from './config.json';
import {
  eatFood, eatVirus, eatPlayer, isAlive, respawnPlayer, power3Timeout, power1Timeout,
} from './player';
import { moveVirus, removeVirus, createVirus } from './virus';
import {
  sockets, playerList, foodList, virusList,
} from './global';

let leaderboard = [];
let gameIsRunning = true;
let diedTimeout = null;

export function interaction() {
  let res = false;
  playerList.forEach((player) => {
    const playerIndex = findIndex(playerList, player.id);
    foodList.forEach((food) => {
      if (areInContact(food, player) && gameIsRunning) {
        sockets[player.id].emit('eat');
        res = true;
        eatFood(playerIndex, findIndex(foodList, food.id));
      }
    });
    virusList.forEach((virus) => {
      if (areInContact(virus, player)) {
        eatVirus(playerIndex, findIndex(virusList, virus.id));
        if (isAlive(player.id) && gameIsRunning) {
          player.damage = true;
          sockets[player.id].emit('damage');
          setTimeout(() => {
            player.damage = false;
          }, 10);
        }
        res = true;
      }
    });
    playerList.forEach((other) => {
      if (player.id !== other.id) {
        if (areInContact(player, other)) {
          res = true;
          eatPlayer(playerIndex, findIndex(playerList, other.id));
        }
      }
    });
  });
  return res;
}

export function updateGameBoard() {
  if (gameIsRunning) {
    moveVirus();
    const interactionHappend = interaction();

    // Si une interaction a eu lieu, on vérifie que tous les joueurs soient en vie
    if (interactionHappend && gameIsRunning) {
      playerList.forEach((player) => {
        if (!isAlive(player.id) && gameIsRunning) {
          player.alive = false;
          clearTimeout(power3Timeout);
          clearTimeout(power1Timeout);
          sockets[player.id].emit('died');
          diedTimeout = setTimeout(() => {
            respawnPlayer(player.id);
          }, respawnTimeout);
        }
      });
    }
  }
}

export function gameLoop(timer) {
  if (gameIsRunning) {
    playerList.forEach((player) => {
      if (player.alive && !player.damage) {
        const playerIndex = findIndex(playerList, player.id);
        sockets[player.id].emit('draw', playerList, foodList, virusList, playerIndex, gameWidth, gameHeight, leaderboard, timer);
      }
    });
    // On met à jour le leaderboard
    const playerListSorted = playerList.sort((a, b) => playerSort(a, b));
    leaderboard = playerListSorted.slice(0, 5);
  }
}

export function resetGameBoard(io) {
  clearTimeout(diedTimeout);
  clearTimeout(power3Timeout);
  clearTimeout(power1Timeout);
  const leaderboardAtTheEnd = leaderboard;
  gameIsRunning = false;
  removeVirus(virusList.length);
  setIntervalX((x) => {
    io.emit('reset', leaderboardAtTheEnd, x - 1);
    if (x === 1) {
      gameIsRunning = true;
      setTimeout(() => {
        createVirus(playerList.length * defaultVirus);
      }, stopTime * 1000);
    }
  }, 1000, stopTime);
  playerList.forEach((player) => {
    respawnPlayer(player.id);
  });
}
