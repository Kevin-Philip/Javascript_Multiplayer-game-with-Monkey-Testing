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
    speed: playerSpeed,
    alive: true,
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
    speed: playerSpeed,
    alive: true,
  };
}

export function eatFood(playerIndex, foodIndex) {
  if (foodList[foodIndex].magic) {
    const power = Math.floor(Math.random() * 4);
    if (power === 0) {
      foodList[foodIndex].mass *= 10;
    }
    if (power === 1) {
      sockets[playerList[playerIndex].id].emit('speedUp');
      playerList[playerIndex].speed *= 3;
      setTimeout(() => {
        playerList[playerIndex].speed /= 3;
      }, 5000);
    }
    if (power === 2) {
      let position;
      virusList.forEach((virus) => {
        if (virus.target.id === playerList[playerIndex].id) {
          position = randomPosition(massToRadius(virus.mass));
          virus.x = position.x;
          virus.y = position.y;
        }
      });
    }
    if (power === 3) {
      const oldMass = playerList[playerIndex].mass;
      playerList[playerIndex].mass = 1;
      setTimeout(() => {
        playerList[playerIndex].mass = oldMass + 50;
        playerList[playerIndex].radius = massToRadius(playerList[playerIndex].mass);
      }, 8000);
    }
  }
  playerList[playerIndex].mass += foodList[foodIndex].mass;
  foodList.splice(foodIndex, 1);
  playerList[playerIndex].radius = massToRadius(playerList[playerIndex].mass);
  createFood(1);
}

export function eatVirus(playerIndex, virusIndex) {
  playerList[playerIndex].mass -= virusList[virusIndex].mass;
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
  return playerList[playerIndex].mass > 0;
}

export function movePlayer(playerMovement, playerId) {
  const playerIndex = findIndex(playerList, playerId);
  const player = playerList[playerIndex];
  const { speed } = playerList[playerIndex];

  if (playerMovement.left && player.x > 0 + player.radius) {
    playerList[playerIndex].x -= speed;
  }
  if (playerMovement.right && player.x < gameWidth - player.radius) {
    playerList[playerIndex].x += speed;
  }
  if (playerMovement.up && player.y > 0 + player.radius) {
    playerList[playerIndex].y -= speed;
  }
  if (playerMovement.down && player.y < gameHeight - player.radius) {
    playerList[playerIndex].y += speed;
  }
}
