var util = require('./util.js');
var config = require('../config.json');
var playerfile = require('./player.js');
var virusfile = require('./virus.js');
var foodfile = require('./food.js')

var leaderboard = [];
var sockets = [];

function initGameBoard(){
    var numbers = numberOfFoodAndVirusToCreateOrRemove();
    foodfile.createFood(config.defaultFood - numbers.minusFood);
    virusfile.createVirus(config.defaultVirus - numbers.minusVirus);
}

function removeVirusAndFood(){
    var numbers = numberOfFoodAndVirusToCreateOrRemove();
    foodfile.removeFood(config.defaultFood - numbers.minusFood);
    virusfile.removeVirus(config.defaultVirus - numbers.minusVirus);
}

function numberOfFoodAndVirusToCreateOrRemove(){
    var len = playerfile.playerList.length;
    var defaultFood = config.defaultFood;
    var defaultVirus = config.defaultVirus;
    var minusFood = 0;
    var minusVirus = 0;
    var factor = 5;
    if (len >=factor && len < (2*factor)) {
        minusFood = defaultFood/factor;
        minusVirus = defaultVirus/factor;
    } else if (len >= (2*factor) && len < (3*factor)) {
        minusFood = 2* defaultFood/factor;
        minusVirus = 2* defaultVirus/factor;
    } else if (len >= (3*factor) && len < (4*factor)) {
        minusFood = 3* defaultFood/factor;
        minusVirus = 3* defaultVirus/factor;
    } else if (len >= (4*factor) && len < (5*factor)) {
        minusFood = 4* defaultFood/factor;
        minusVirus = 4* defaultVirus/factor;
    } else if (len >= (5*factor)) {
        minusFood = 5* defaultFood/factor;
        minusVirus = 5* defaultVirus/factor;
    }
    var res = {
        minusFood: minusFood,
        minusVirus: minusVirus
    }
    return res;
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
        var playerIndex = util.findIndex(playerfile.playerList, player.id);
        sockets[player.id].emit('draw', playerfile.playerList, foodfile.foodList, virusfile.virusList, playerIndex, config.gameWidth, config.gameHeight)
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
        });
        playerfile.playerList.forEach((other) =>{
            if(player.id != other.id){
                if(util.areInContact(player, other)){
                    res = true;
                    playerfile.eatPlayer(playerIndex, util.findIndex(playerfile.playerList, other.id));
                }
            }
        });
    });
    return res;
}

exports.initGameBoard = initGameBoard;
exports.removeVirusAndFood = removeVirusAndFood;
exports.updateGameBoard = updateGameBoard;
exports.gameLoop = gameLoop;
exports.sockets = sockets;