import { massToRadius, randomPosition } from './util';
import { foodMass, magicPourcentage } from './config.json';

export const foodList = [];

export function createFood(numberToCreate) {
  const radius = massToRadius(foodMass);
  let magicToCreate = numberToCreate * magicPourcentage;
  let magie = false;
  let random;
  while (numberToCreate > 0) {
    const position = randomPosition(radius);
    if (numberToCreate <= magicToCreate || (magicToCreate<1 && Math.random() <= magicPourcentage)){
      magie = true;
    }
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
