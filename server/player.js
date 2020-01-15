import {
  massToRadius, randomPosition, isInContactWith, findIndex,
} from './util';
import {
  defaultPlayerMass, playerSpeed, gameWidth, gameHeight,
} from './config.json';
import { createFood } from './food';
import { createVirus } from './virus';
import {
  sockets, playerList, virusList, foodList,
} from './global';

// eslint-disable-next-line import/no-mutable-exports
export let power1Timeout = null;
// eslint-disable-next-line import/no-mutable-exports
export let power3Timeout = null;

export function createPlayer(playerId) {
  const radius = massToRadius(defaultPlayerMass);
  let position = randomPosition(radius);
  while (isInContactWith(position, playerList) || isInContactWith(position, virusList)) {
    console.log('[DEBUG] A player spawned in a virus or a player');
    position = randomPosition(radius);
  }
  const currentPlayer = {
    id: playerId,
    x: position.x,
    y: position.y,
    radius,
    mass: defaultPlayerMass,
    oldMass: 0,
    speed: playerSpeed,
    alive: true,
    damage: false,
  };
  playerList.push(currentPlayer);
}

export function respawnPlayer(playerId) {
  const radius = massToRadius(defaultPlayerMass);
  let position = randomPosition(radius);
  while (isInContactWith(position, playerList) || isInContactWith(position, virusList)) {
    console.log('[DEBUG] A player spawned in a virus or a player');
    position = randomPosition(radius);
  }
  const playerIndex = findIndex(playerList, playerId);
  playerList[playerIndex] = {
    id: playerId,
    x: position.x,
    y: position.y,
    radius,
    mass: defaultPlayerMass,
    oldMass: 0,
    speed: playerSpeed,
    alive: true,
    damage: false,
  };
}

export function eatFood(playerIndex, foodIndex) {
  const player = playerList[playerIndex];
  if (foodList[foodIndex].magic) {
    const power = Math.floor(Math.random() * 4);
    if (power === 0) {
      foodList[foodIndex].mass *= 10;
    }
    if (power === 1) {
      if (player.speed === playerSpeed) {
        sockets[player.id].emit('speedUp');
        player.speed *= 3;
        power1Timeout = setTimeout(() => {
          player.speed /= 3;
        }, 5000);
      } else { // Si il a deja un boost on ne cumule pas, on reset juste le timer
        clearTimeout(power1Timeout);
        power1Timeout = setTimeout(() => {
          player.speed /= 3;
        }, 5000);
      }
    }
    if (power === 2) {
      virusList.forEach((virus) => {
        if (virus.target.id === player.id) {
          const radius = massToRadius(virus.mass);
          let position = randomPosition(radius);
          while (isInContactWith(position, playerList)) {
            console.log('[DEBUG] A virus spawned in a player');
            position = randomPosition(radius);
          }
          virus.x = position.x;
          virus.y = position.y;
        }
      });
    }
    if (power === 3) {
      player.oldMass = player.mass;
      player.mass = 10;
      power3Timeout = setTimeout(() => {
        player.mass += player.oldMass + 50;
        player.oldMass = 0;
        player.radius = massToRadius(player.mass);
      }, 8000);
    }
  }
  playerList[playerIndex].mass += foodList[foodIndex].mass;
  foodList.splice(foodIndex, 1);
  playerList[playerIndex].radius = massToRadius(playerList[playerIndex].mass);
  createFood(1);
}

export function eatVirus(playerIndex, virusIndex) {
  playerList[playerIndex].mass -= ((playerList[playerIndex].mass * 0.1)
    > virusList[virusIndex].mass) ? (Math.floor(playerList[playerIndex].mass * 0.1))
    : virusList[virusIndex].mass;
  virusList.splice(virusIndex, 1);
  playerList[playerIndex].radius = massToRadius(playerList[playerIndex].mass);
  createVirus(1);
}

export function eatPlayer(playerIndex, otherIndex) {
  if (playerList[playerIndex].mass > playerList[otherIndex].mass) {
    playerList[playerIndex].mass += playerList[otherIndex].mass;
    playerList[playerIndex].radius = massToRadius(playerList[playerIndex].mass);
    playerList[otherIndex].mass = 0;
  }
}

export function isAlive(playerId) {
  const playerIndex = findIndex(playerList, playerId);
  return playerList[playerIndex].mass > 10;
}

export function movePlayer(playerMovement, playerId) {
  const playerIndex = findIndex(playerList, playerId);
  const player = playerList[playerIndex];
  const playerSpd = playerList[playerIndex].speed;

  if (playerMovement.left && player.x > 0 + player.radius) {
    playerList[playerIndex].x -= playerSpd;
  }
  if (playerMovement.right && player.x < gameWidth - player.radius) {
    playerList[playerIndex].x += playerSpd;
  }
  if (playerMovement.up && player.y > 0 + player.radius) {
    playerList[playerIndex].y -= playerSpd;
  }
  if (playerMovement.down && player.y < gameHeight - player.radius) {
    playerList[playerIndex].y += playerSpd;
  }
}
