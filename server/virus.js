var util = require('./util.js');
var config = require('../config.json');

var virusList = [];

function createVirus(numberToCreate) {
    var radius = util.massToRadius(config.virusMass);
    while (numberToCreate > 0) {
        var position = util.virusSpawn(radius);
        virusList.push({
            id: ((new Date()).getTime() + '' + virusList.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: radius,
            mass: config.virusMass,
        });
        numberToCreate--;
    }
}

function moveVirus() {
    var speed = config.virusSpeed
    virusList.forEach((virus) => {
        const vertical = Math.random() < 0.5
        const horizontal = Math.random() < 0.5
        if ((virus.x + virus.radius) < (config.gameWidth - speed) && horizontal) {
            virus.x += speed
        } else if ((virus.x - virus.radius) > (0 + speed)){
            virus.x -= speed
        }
        if ((virus.y + virus.radius) < (config.gameHeight - speed) && vertical) {
            virus.y += speed
        } else if ((virus.y - virus.radius) > (0 + speed)){
            virus.y -= speed
        }
    });
}

exports.createVirus = createVirus;
exports.moveVirus = moveVirus;
exports.virusList = virusList;