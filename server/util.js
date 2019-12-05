import { gameWidth, gameHeight } from './config.json';

export function massToRadius(mass) {
  if (mass <= 0) {
    mass = 1;
  }
  return (Math.log(mass) + 1) * 3;
}

function randomIntInc(max, radius) {
  return Math.floor(Math.random() * ((max - radius) - radius + 1) + radius);
}

export function randomPosition(radius) {
  const position = {
    x: randomIntInc(gameWidth, radius),
    y: randomIntInc(gameHeight, radius),
  };
  return position;
}

export function areInContact(first, second) {
  const distPoints = ((first.x - second.x) ** 2) + ((first.y - second.y) ** 2);
  const radius = (second.radius ** 2);
  return distPoints <= radius;
}

export function isInContactWith(position, entities) {
  let res = false;
  let len = entities.length;
  while (!res && len > 0) {
    len -= 1;
    res = areInContact(position, entities[len]);
  }
  return res;
}

export function findIndex(array, id) {
  let currentIndex = 0;
  while (currentIndex < array.length) {
    if (array[currentIndex].id === id) {
      return currentIndex;
    }
    currentIndex += 1;
  }
  return -1;
}
