import { massToRadius, randomPosition } from './util';
import { foodMass, magicPourcentage } from './config.json';
import { foodList } from './global';

export function createFood(numberToCreate) {
  const radius = massToRadius(foodMass);
  let magie = false;
  while (numberToCreate > 0) {
    const position = randomPosition(radius);
    magie = Math.random() <= magicPourcentage;
    foodList.push({
      id: (`${(new Date()).getTime()}${foodList.length}`) >>> 0,
      x: position.x,
      y: position.y,
      radius,
      mass: foodMass,
      magic: magie,
    });
    numberToCreate -= 1;
  }
}

export function removeFood(numberToRemove) {
  for (let i = 0; i < numberToRemove; i += 1) {
    foodList.pop();
  }
}
