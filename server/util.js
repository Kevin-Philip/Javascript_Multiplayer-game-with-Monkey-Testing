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

export function setIntervalX(callback, delay, repetitions) {
  let x = repetitions;
  const intervalID = setInterval(() => {
    callback(x);
    x -= 1;
    if (x === 0) {
      clearInterval(intervalID);
    }
  }, delay);
}

export function playerSort(player1, player2) {
  const mass1 = player1.oldMass > player1.mass ? player1.oldMass : player1.mass;
  const mass2 = player2.oldMass > player2.mass ? player2.oldMass : player2.mass;
  let res;
  if (mass1 < mass2) {
    res = 1;
  } else if (mass1 > mass2) {
    res = -1;
  } else {
    res = player1.id < player2.id ? 1 : -1;
  }
  return res;
}
