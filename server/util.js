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

function isInside(object, player) {
    var dist_points = Math.pow((object.x - player.x), 2) + Math.pow((object.y - player.y), 2);
    var radius = Math.pow(player.radius, 2);
    return dist_points < radius;
}

exports.isInside = isInside
exports.massToRadius = massToRadius
exports.randomPosition = randomPosition