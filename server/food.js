var util = require('./util.js');
var config = require('../config.json');

var foodList = [];

function createFood(numberToCreate) {
    var radius = util.massToRadius(config.foodMass);
    while (numberToCreate > 0) {
        var position = util.randomPosition(radius);
        foodList.push({
            id: ((new Date()).getTime() + '' + foodList.length) >>> 0,
            x: position.x,
            y: position.y,
            radius: radius,
            mass: config.foodMass,
        });
        numberToCreate--;
    }
}

function removeFood(numberToRemove){
    for (i = 0; i < numberToRemove; i++){
        foodList.pop();
    }
}

exports.createFood = createFood;
exports.removeFood = removeFood;
exports.foodList = foodList;