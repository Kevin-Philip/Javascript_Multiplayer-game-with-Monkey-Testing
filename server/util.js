var config = require('../config.json');

function massToRadius(mass) {
    if (mass <= 0) {
        mass = 1;
    }
    return (Math.log(mass)+1)*3;
}

function randomIntInc(max, radius) {
    return Math.floor(Math.random() * ((max-radius) - radius + 1) + radius)
}

function randomPosition(radius) {
    var position = {
        x: randomIntInc(config.gameWidth, radius),
        y: randomIntInc(config.gameHeight, radius)
    };
    return position;
}

function isInContactWith(position, entities) {
    var res = false;
    var len = entities.length;
    while (!res && len>0) {
        len --;
        res = areInContact(position, entities[len]);
    }
    return res;
}

function areInContact(first, second){
    var dist_points = Math.pow((first.x - second.x), 2) + Math.pow((first.y - second.y), 2);
    var radius = Math.pow(second.radius, 2);
    return dist_points <= radius;
}

function findIndex(array, id){
    var currentIndex = 0;
    while (currentIndex < array.length) {
        if (array[currentIndex].id === id) {
            return currentIndex;
        }
        currentIndex ++;
    }
    return -1;
}

exports.massToRadius = massToRadius;
exports.randomPosition = randomPosition;
exports.findIndex = findIndex;
exports.isInContactWith = isInContactWith;
exports.areInContact = areInContact;