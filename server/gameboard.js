var util = require('./util.js');
var config = require('../config.json');
var playerfile = require('./player.js');
var virusfile = require('./virus.js');
var foodfile = require('./food.js')

var leaderboard = [];

function initGameBoard(){
    foodfile.createFood(config.defaultFood);
    virusfile.createVirus(config.defaultVirus);
}

function refreshBoard(socket) {
    setInterval(() => {
        virusfile.moveVirus();
        socket.emit('draw', playerfile.playerList, foodfile.foodList, virusfile.virusList);   
    }, 1000 / 60)
}

function interaction(playerId){
    var interaction = false;
    var playerIndex = playerfile.getPlayerIndex(playerId);
    var player = playerfile.playerList[playerIndex];

    foodfile.foodList.forEach((food) => {
        if (util.isInteracting(food, player)) {
            interaction = true;
            playerfile.eatFood(playerIndex, foodfile.foodList.indexOf(food));
        }
    });
    virusfile.virusList.forEach((virus) => {
        if (util.isInteracting(virus, player)) {
            interaction = true;
            playerfile.eatVirus(playerIndex, virusfile.virusList.indexOf(virus));
        }
    })
    return interaction;
}

function updateLeaderboard() {
    playerListSorted = playerfile.playerList.sort((a, b) => (a.mass > b.mass) ? 1 : -1);
    leaderboard = playerListSorted.slice(0, 5);
}

exports.initGameBoard = initGameBoard;
exports.refreshBoard = refreshBoard;
exports.interaction = interaction;
exports.updateLeaderboard = updateLeaderboard;