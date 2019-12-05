import { massToRadius, randomPosition } from './util';
import { foodMass } from './config.json';

export const foodList = [];

export function createFood(numberToCreate) {
  const radius = massToRadius(foodMass);
  while (numberToCreate > 0) {
    const position = randomPosition(radius);
    foodList.push({
      id: (`${(new Date()).getTime()}${foodList.length}`) >>> 0,
      x: position.x,
      y: position.y,
      radius,
      mass: foodMass,
    });
    numberToCreate -= 1;
  }
}

export function removeFood(numberToRemove) {
  for (let i = 0; i < numberToRemove; i += 1) {
    foodList.pop();
  }
}
