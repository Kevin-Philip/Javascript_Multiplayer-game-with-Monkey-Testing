function massToRadius(mass) {
    return 20;
}

function randomPosition(radius) {
    var position = {
        x: 5 + radius,
        y: 5 + radius
    };
    return position;
}

exports.massToRadius = massToRadius
exports.randomPosition = randomPosition