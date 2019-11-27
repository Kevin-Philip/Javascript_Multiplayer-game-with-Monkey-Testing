var util = require('./util.js');
var config = require('../config.json');
var foodfile = require('./food.js');
var virusfile = require('./virus.js');

var playerList = [];

function getPlayerIndex(playerId) {
    var index = playerList.findIndex((player) => {
        return player.id === playerId;
    });
    return index;
}

function createPlayer(playerId) {
    var radius = util.massToRadius(config.defaultPlayerMass);
    var position = util.randomPosition(radius);
    var currentPlayer = {
        id: playerId,
        x: position.x,
        y: position.y,
        radius: radius,
        mass: config.defaultPlayerMass,
    };
    playerList.push(currentPlayer);
}

function resetPlayer(playerId) {
    var radius = util.massToRadius(config.defaultPlayerMass);
    var position = util.randomPosition(radius);
    playerIndex = getPlayerIndex(playerId);
    playerList[playerIndex] = {
        id: playerId,
        x: position.x,
        y: position.y,
        radius: radius,
        mass: config.defaultPlayerMass,
    };
}

function removePlayer(playerId) {
    playerList = playerList.filter((player) => {
        return player.id != playerId;
    });
}

function eatFood(playerIndex, foodIndex){
    playerList[playerIndex].mass += foodfile.foodList[foodIndex].mass;
    foodfile.foodList.splice(foodIndex, 1);
    playerList[playerIndex].radius = util.massToRadius(playerList[playerIndex].mass);
    foodfile.createFood(1);
}

function eatVirus(playerIndex, virusIndex){
    playerList[playerIndex].mass -= virusfile.virusList[virusIndex].mass
    virusfile.virusList.splice(virusIndex, 1)
    playerList[playerIndex].radius = util.massToRadius(playerList[playerIndex].mass);
    virusfile.createVirus(1);
}

function isAlive(playerId){
    var playerIndex = getPlayerIndex(playerId);
    return playerList[playerIndex].mass >= config.defaultPlayerMass; 
}

function movePlayer(playerMovement, playerId) {
    var playerIndex = getPlayerIndex(playerId);
    var player = playerList[playerIndex];
    var speed = config.playerSpeed;

    if (playerMovement.left && player.x > 0 + player.radius) {
        playerList[playerIndex].x -= speed
    }
    if (playerMovement.right && player.x < config.gameWidth - player.radius) {
        playerList[playerIndex].x += speed
    }
    if (playerMovement.up && player.y > 0 + player.radius) {
        playerList[playerIndex].y -= speed
    }
    if (playerMovement.down && player.y < config.gameHeight - player.radius) {
        playerList[playerIndex].y += speed
    }
}

exports.getPlayerIndex = getPlayerIndex;
exports.createPlayer = createPlayer;
exports.resetPlayer = resetPlayer;
exports.removePlayer = removePlayer;
exports.eatFood = eatFood;
exports.eatVirus = eatVirus;
exports.isAlive = isAlive;
exports.movePlayer = movePlayer;
exports.playerList = playerList;
