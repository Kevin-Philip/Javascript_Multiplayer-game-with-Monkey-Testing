import { findIndex, areInContact } from './util';
import { gameWidth, gameHeight, respawnTimeout } from './config.json';
import {
  eatFood, eatVirus, eatPlayer, isAlive, respawnPlayer,
} from './player';
import { moveVirus } from './virus';
import {
  sockets, playerList, foodList, virusList,
} from './global';


let leaderboard = [];
let damage = false;

export function interaction() {
  let res = false;
  playerList.forEach((player) => {
    const playerIndex = findIndex(playerList, player.id);
    foodList.forEach((food) => {
      if (areInContact(food, player)) {
        sockets[player.id].emit('eat');
        res = true;
        eatFood(playerIndex, findIndex(foodList, food.id));
      }
    });
    virusList.forEach((virus) => {
      if (areInContact(virus, player)) {
        eatVirus(playerIndex, findIndex(virusList, virus.id));
        if (isAlive(player.id)) {
          sockets[player.id].emit('damage');
          damage = true;
          setTimeout(() => {
            damage = false;
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
  moveVirus();
  const interactionHappend = interaction();

  // Si une interaction a eu lieu, on vérifie que tous les joueurs soient en vie
  if (interactionHappend) {
    playerList.forEach((player) => {
      if (!isAlive(player.id)) {
        player.alive = false;
        sockets[player.id].emit('died');
        setTimeout(() => {
          respawnPlayer(player.id);
        }, respawnTimeout);
        sockets[player.id].emit('died');
        sockets[player.id].emit('message', 'You died !');
      }
    });
  }
}

export function gameLoop() {
  playerList.forEach((player) => {
    if (player.alive && !damage) {
      const playerIndex = findIndex(playerList, player.id);
      sockets[player.id].emit('draw', playerList, foodList, virusList, playerIndex, gameWidth, gameHeight, leaderboard);
    }
  });
  // On met à jour le leaderboard
  const playerListSorted = playerList.sort((a, b) => ((a.mass < b.mass) ? 1 : -1));
  leaderboard = playerListSorted.slice(0, 5);
}
