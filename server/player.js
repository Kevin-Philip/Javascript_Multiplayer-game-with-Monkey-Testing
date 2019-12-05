import {
  massToRadius, randomPosition, isInContactWith, findIndex,
} from './util';
import {
  defaultPlayerMass, playerSpeed, gameWidth, gameHeight,
} from './config.json';
import { foodList, createFood } from './food';
import { virusList, createVirus } from './virus';

export const playerList = [];

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
  };
}

export function eatFood(playerIndex, foodIndex) {
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
  return playerList[playerIndex].mass >= defaultPlayerMass;
}

export function movePlayer(playerMovement, playerId) {
  const playerIndex = findIndex(playerList, playerId);
  const player = playerList[playerIndex];
  const speed = playerSpeed;

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
