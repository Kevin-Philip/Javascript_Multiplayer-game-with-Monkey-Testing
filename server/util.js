var config = require('../config.json');
var playerfile = require('./player.js');
var virusfile = require('./virus.js');

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

function playerSpawn(radius){
    var position = randomPosition(radius);
    while(isInteractingList(position, playerfile.playerList) || isInteractingList(position, virusfile.virusList)){
        console.log('[DEBUG] A player spawned in a virus or a player')
        position = randomPosition(radius);
    }
    return position;
}

function virusSpawn(radius){
    var position = randomPosition(radius);
    while(isInteractingList(position, playerfile.playerList)){
        console.log('[DEBUG] A virus spawned in a player')
        position = randomPosition(radius);
    }
    return position
}

function isInteracting(object, entity) {
    var dist_points = Math.pow((object.x - entity.x), 2) + Math.pow((object.y - entity.y), 2);
    var radius = Math.pow(entity.radius, 2);
    return dist_points < radius;
}

function isInteractingList(object, entities) {
    var res = false;
    entitiesIndex = 0;
    while (!res && (entitiesIndex < entities.length)) {
        res = isInteracting(object, entities[entitiesIndex]);
        entitiesIndex ++;
    }
    return res;
}

exports.isInteracting = isInteracting;
exports.massToRadius = massToRadius;
exports.randomPosition = randomPosition;
exports.playerSpawn = playerSpawn;
exports.virusSpawn = virusSpawn;