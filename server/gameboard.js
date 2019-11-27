var util = require('./util.js');
var config = require('../config.json');
var playerfile = require('./player.js');
var virusfile = require('./virus.js');
var foodfile = require('./food.js')

var leaderboard = [];
var sockets = [];

function initGameBoard(){
    foodfile.createFood(config.defaultFood);
    virusfile.createVirus(config.defaultVirus);
}

function updateGameBoard() {
    virusfile.moveVirus();
    var interactionHappend = interaction();

    // Si une interaction a eu lieu, on vérifie que tous les joueurs soient en vie
    if (interactionHappend) {
        playerfile.playerList.forEach((player) => {
            if(!playerfile.isAlive(player.id)){
                sockets[player.id].emit('message', 'You died !');
                playerfile.respawnPlayer(player.id);
            }
        });

        // On met à jour le leaderboard
        playerListSorted = playerfile.playerList.sort((a, b) => (a.mass > b.mass) ? 1 : -1);
        leaderboard = playerListSorted.slice(0, 5);
    }
}

function gameLoop(){
    playerfile.playerList.forEach((player) => {
        sockets[player.id].emit('draw', playerfile.playerList, foodfile.foodList, virusfile.virusList)
    });
}

function interaction(){
    var res = false;
    playerfile.playerList.forEach((player) => {
        var playerIndex = util.findIndex(playerfile.playerList, player.id);
        foodfile.foodList.forEach((food) => {
            if (util.areInContact(food, player)) {
                res = true;
                playerfile.eatFood(playerIndex, util.findIndex(foodfile.foodList, food.id));
            }
        });
        virusfile.virusList.forEach((virus) => {
            if (util.areInContact(virus, player)) {
                res = true;
                playerfile.eatVirus(playerIndex, util.findIndex(virusfile.virusList, virus.id));
            }
        })
    });
    return res;
}

exports.initGameBoard = initGameBoard;
exports.updateGameBoard = updateGameBoard;
exports.gameLoop = gameLoop;
exports.sockets = sockets;