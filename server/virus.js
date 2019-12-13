import { massToRadius, randomPosition, isInContactWith } from './util';
import {
  virusMass, virusChangeDirectionFrequencyMax, virusChangeDirectionFrequencyMin, virusSpeed,
  virusTracking, virusChangeTargetFrequency, gameWidth, gameHeight,
} from './config.json';
import { playerList, virusList } from './global';

export function createVirus(numberToCreate) {
  const radius = massToRadius(virusMass);
  while (numberToCreate > 0) {
    let position = randomPosition(radius);
    while (isInContactWith(position, playerList)) {
      console.log('[DEBUG] A virus spawned in a player');
      position = randomPosition(radius);
    }
    virusList.push({
      id: (`${(new Date()).getTime()}${virusList.length}`) >>> 0,
      x: position.x,
      y: position.y,
      direction_x: 0,
      direction_y: 0,
      changeDirectionFrequency: Math.floor(Math.random() * (virusChangeDirectionFrequencyMax
        - virusChangeDirectionFrequencyMin) + virusChangeDirectionFrequencyMin),
      changeDirection: 0,
      changeTarget: 0,
      target: playerList[Math.floor(Math.random() * (playerList.length))],
      radius,
      mass: virusMass,
    });
    numberToCreate -= 1;
  }
}

export function removeVirus(numberToRemove) {
  for (let i = 0; i < numberToRemove; i += 1) {
    virusList.pop();
  }
}

export function moveVirus() {
  const speed = virusSpeed;
  virusList.forEach((virus) => {
    if (virusTracking && (virus.changeTarget === virusChangeTargetFrequency)) {
      virus.target = playerList[Math.floor(Math.random() * (playerList.length))];
      virus.changeTarget = 0;
    }
    if (virus.changeDirection === virus.changeDirectionFrequency) {
      if (virusTracking) {
        virus.direction_x = virus.x < virus.target.x;
        virus.direction_y = virus.y < virus.target.y;
      } else {
        virus.direction_x = Math.random() < 0.5;
        virus.direction_y = Math.random() < 0.5;
      }
      virus.changeDirection = 0;
    }
    if ((virus.x + virus.radius) < (gameWidth - speed) && virus.direction_x) {
      virus.x += speed;
    } else if ((virus.x - virus.radius) > (0 + speed)) {
      virus.x -= speed;
    }
    if ((virus.y + virus.radius) < (gameHeight - speed) && virus.direction_y) {
      virus.y += speed;
    } else if ((virus.y - virus.radius) > (0 + speed)) {
      virus.y -= speed;
    }
    virus.changeDirection += 1;
    virus.changeTarget += 1;
  });
}
