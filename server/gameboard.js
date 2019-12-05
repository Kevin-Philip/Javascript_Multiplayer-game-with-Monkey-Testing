import { findIndex, areInContact } from './util';
import config, {
  defaultFood as _defaultFood, defaultVirus as _defaultVirus, gameWidth, gameHeight,
} from './config.json';
import {
  playerList, eatFood, eatVirus, eatPlayer, isAlive, respawnPlayer,
} from './player';
import {
  virusList, createVirus, removeVirus, moveVirus,
} from './virus';
import { foodList, createFood, removeFood } from './food';

let leaderboard = [];
export const sockets = [];

export function interaction() {
  let res = false;
  playerList.forEach((player) => {
    const playerIndex = findIndex(playerList, player.id);
    foodList.forEach((food) => {
      if (areInContact(food, player)) {
        res = true;
        eatFood(playerIndex, findIndex(foodList, food.id));
      }
    });
    virusList.forEach((virus) => {
      if (areInContact(virus, player)) {
        res = true;
        eatVirus(playerIndex, findIndex(virusList, virus.id));
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

export function numberOfFoodAndVirusToCreateOrRemove() {
  const len = playerList.length;
  const { defaultFood } = config;
  const { defaultVirus } = config;
  let minusFood = 0;
  let minusVirus = 0;
  const factor = 5;
  if (len >= factor && len < (2 * factor)) {
    minusFood = defaultFood / factor;
    minusVirus = defaultVirus / factor;
  } else if (len >= (2 * factor) && len < (3 * factor)) {
    minusFood = (2 * defaultFood) / factor;
    minusVirus = (2 * defaultVirus) / factor;
  } else if (len >= (3 * factor) && len < (4 * factor)) {
    minusFood = (3 * defaultFood) / factor;
    minusVirus = (3 * defaultVirus) / factor;
  } else if (len >= (4 * factor) && len < (5 * factor)) {
    minusFood = (4 * defaultFood) / factor;
    minusVirus = (4 * defaultVirus) / factor;
  } else if (len >= (5 * factor)) {
    minusFood = (5 * defaultFood) / factor;
    minusVirus = (5 * defaultVirus) / factor;
  }
  const res = {
    minusFood,
    minusVirus,
  };
  return res;
}

export function initGameBoard() {
  const numbers = numberOfFoodAndVirusToCreateOrRemove();
  createFood(_defaultFood - numbers.minusFood);
  createVirus(_defaultVirus - numbers.minusVirus);
}

export function removeVirusAndFood() {
  const numbers = numberOfFoodAndVirusToCreateOrRemove();
  removeFood(_defaultFood - numbers.minusFood);
  removeVirus(_defaultVirus - numbers.minusVirus);
}

export function updateGameBoard() {
  moveVirus();
  const interactionHappend = interaction();

  // Si une interaction a eu lieu, on vérifie que tous les joueurs soient en vie
  if (interactionHappend) {
    playerList.forEach((player) => {
      if (!isAlive(player.id)) {
        sockets[player.id].emit('message', 'You died !');
        respawnPlayer(player.id);
      }
    });

    // On met à jour le leaderboard
    const playerListSorted = playerList.sort((a, b) => ((a.mass < b.mass) ? 1 : -1));
    leaderboard = playerListSorted.slice(0, 5);
  }
}

export function gameLoop() {
  playerList.forEach((player) => {
    const playerIndex = findIndex(playerList, player.id);
    sockets[player.id].emit('draw', playerList, foodList, virusList, playerIndex, gameWidth, gameHeight, leaderboard);
  });
}
