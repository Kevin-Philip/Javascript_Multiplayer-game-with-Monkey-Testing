/* eslint-disable no-undef */

import { expect } from 'chai';
import {
  massToRadius, randomPosition, areInContact, isInContactWith, findIndex, playerSort,
} from '../util';

describe('Util Tests', () => {
  describe('massToRadius Tests', () => {
    describe('massToRadius with mass <= 0 test', () => {
      it('should return a radius from a mass', () => {
        const mass = 0;
        const radius = massToRadius(mass);
        expect(radius).to.equal(((Math.log(1) + 1) * 3));
      });
    });
    describe('massToRadius with mass > 0 test', () => {
      it('should return a radius from a mass', () => {
        const mass = 3;
        const res = massToRadius(mass);
        expect(res).to.equal(((Math.log(mass) + 1) * 3));
      });
    });
  });

  describe('randomPosition Test', () => {
    it('should return a random position', () => {
      const radius = massToRadius(10);
      const res = randomPosition(radius);
      expect(res.x).to.be.an('number').and.to.satisfy((num) => num > 0);
      expect(res.y).to.be.an('number').and.to.satisfy((num) => num > 0);
    });
  });

  describe('areInContact Tests', () => {
    describe('areInContact with res = true test', () => {
      it('should tell if two entities are in contact', () => {
        const first = {
          x: 50,
          y: 50,
        };
        const rad = massToRadius(10);
        const second = {
          x: 50,
          y: 50,
          radius: rad,
        };
        const res = areInContact(first, second);
        expect(res).to.equal(true);
      });
    });
    describe('areInContact with res = false test', () => {
      it('should tell if two entities are in contact', () => {
        const first = {
          x: 50,
          y: 50,
        };
        const rad = massToRadius(10);
        const second = {
          x: 500,
          y: 500,
          radius: rad,
        };
        const res = areInContact(first, second);
        expect(res).to.equal(false);
      });
    });
  });

  describe('isInContactWith Tests', () => {
    describe('isInContactWith with res = true test', () => {
      it('should tell if an entity is in contact with another one within a list', () => {
        const first = {
          x: 50,
          y: 50,
        };
        const rad = massToRadius(10);
        const second = {
          x: 50,
          y: 50,
          radius: rad,
        };
        const entities = [second];
        const res = isInContactWith(first, entities);
        expect(res).to.equal(true);
      });
    });
    describe('isInContactWith with empty list test', () => {
      it('should tell if an entity is in contact with another one within a list', () => {
        const first = {
          x: 50,
          y: 50,
        };
        const entities = [];
        const res = isInContactWith(first, entities);
        expect(res).to.equal(false);
      });
    });
    describe('isInContactWith with res = false test', () => {
      it('should tell if an entity is in contact with another one within a list', () => {
        const first = {
          x: 50,
          y: 50,
        };
        const rad = massToRadius(10);
        const second = {
          x: 500,
          y: 500,
          radius: rad,
        };
        const entities = [second];
        const res = isInContactWith(first, entities);
        expect(res).to.equal(false);
      });
    });
  });

  describe('findIndex Tests', () => {
    describe('findIndex with empty array test', () => {
      it('should tell the index of the entity in the array using his id', () => {
        const array = [];
        const id = 1;
        const res = findIndex(array, id);
        expect(res).to.equal(-1);
      });
    });
    describe('findIndex with a bad array test', () => {
      it('should tell the index of the entity in the array using his id', () => {
        const array = [{
          id: 2,
        },
        {
          id: 3,
        }];
        const id = 1;
        const res = findIndex(array, id);
        expect(res).to.equal(-1);
      });
    });
    describe('findIndex with a good array test', () => {
      it('should tell the index of the entity in the array using his id', () => {
        const array = [{
          id: 1,
        },
        {
          id: 2,
        }];
        const id = 1;
        const res = findIndex(array, id);
        expect(res).to.equal(0);
      });
    });
  });

  describe('playerSort Tests', () => {
    describe('playerSort with mass1 = mass2, oldMass1 < mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 20,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 20,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort with mass1 = mass2, oldMass1 > mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 20,
        };
        const player2 = {
          id: 2,
          mass: 20,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort with mass1 = mass2, oldMass1 < mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 20,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 20,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort with mass1 = mass2, oldMass1 > mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 20,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 20,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort mass1 > mass2, oldMass1 < mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 21,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 20,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(-1);
      });
    });
    describe('playerSort mass1 > mass2, oldMass1 > mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 21,
        };
        const player2 = {
          id: 2,
          mass: 20,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(-1);
      });
    });
    describe('playerSort mass1 > mass2, oldMass1 < mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 21,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 20,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(-1);
      });
    });
    describe('playerSort mass1 > mass2, oldMass1 > mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 21,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 20,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(-1);
      });
    });
    describe('playerSort mass1 < mass2, oldMass1 < mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 20,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 21,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort mass1 < mass2, oldMass1 > mass1, oldMass2 < mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 20,
        };
        const player2 = {
          id: 2,
          mass: 21,
          oldMass: 0,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort mass1 < mass2, oldMass1 < mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 20,
          oldMass: 0,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 21,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
    describe('playerSort mass1 < mass2, oldMass1 > mass1, oldMass2 > mass2 test', () => {
      it('should sort the players by their mass', () => {
        const player1 = {
          id: 1,
          mass: 10,
          oldMass: 20,
        };
        const player2 = {
          id: 2,
          mass: 10,
          oldMass: 21,
        };
        const res = playerSort(player1, player2);
        expect(res).to.equal(1);
      });
    });
  });
});
