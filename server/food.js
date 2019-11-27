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

exports.createFood = createFood;
exports.foodList = foodList;