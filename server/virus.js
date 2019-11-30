var util = require('./util.js');
var config = require('../config.json');
var playerfile = require('./player.js');

var virusList = [];

function createVirus(numberToCreate) {
    var radius = util.massToRadius(config.virusMass);
    while (numberToCreate > 0) {
        var position = util.randomPosition(radius);
        while(util.isInContactWith(position, playerfile.playerList)){
            console.log('[DEBUG] A virus spawned in a player')
            position = util.randomPosition(radius);
        }
        virusList.push({
            id: ((new Date()).getTime() + '' + virusList.length) >>> 0,
            x: position.x,
            y: position.y,
            direction_x : 0,
            direction_y : 0,
            changeDirectionFrequency : Math.floor(Math.random() * (config.VirusChangeDirectionFrequencyMax - config.VirusChangeDirectionFrequencyMin)+ config.VirusChangeDirectionFrequencyMin),
            changeDirection : 0,
            radius: radius,
            mass: config.virusMass,
        });
        numberToCreate--;
    }
}

function removeVirus(numberToRemove){
    for (i = 0; i < numberToRemove; i++){
        virusList.pop();
    }
}

function moveVirus() {
    var speed = config.virusSpeed;
    virusList.forEach((virus) => {
        if(virus.changeDirection == virus.changeDirectionFrequency){
            virus.direction_x = Math.random() < 0.5;
            virus.direction_y = Math.random() < 0.5;
            virus.changeDirection = 0;
        }
        if ((virus.x + virus.radius) < (config.gameWidth - speed) && virus.direction_x) {
            virus.x += speed
        } else if ((virus.x - virus.radius) > (0 + speed)){
            virus.x -= speed
        }
        if ((virus.y + virus.radius) < (config.gameHeight - speed) && virus.direction_y) {
            virus.y += speed
        } else if ((virus.y - virus.radius) > (0 + speed)){
            virus.y -= speed
        }
        virus.changeDirection++;
    });
}

exports.createVirus = createVirus;
exports.removeVirus = removeVirus;
exports.moveVirus = moveVirus;
exports.virusList = virusList;