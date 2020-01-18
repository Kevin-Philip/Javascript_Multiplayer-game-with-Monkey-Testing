const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const messages = [];

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - 41; // -41 pour laisser l'emplacement du chat chat
}

// resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);
resizeCanvas();

const socket = this.io();

socket.on('reset', (leaderboardAtTheEnd, x) => {
  this.music.pause();
  this.music.currentTime = 0;
  this.diedSound.pause();
  this.diedSound.currentTime = 0;
  this.gameStop.play();
  this.music.volume = 0.5;
  console.log('reset');
  const ctx = canvas.getContext('2d');
  let decalage = canvas.height / 3;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'Gray';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  leaderboardAtTheEnd.forEach((player) => {
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'white';
    let mass = player.mass < 10 ? 10 : player.mass;
    mass = player.oldMass > mass ? player.oldMass : mass;
    ctx.fillText(`${player.id} : ${mass}`, canvas.width / 2, decalage);
    decalage += 70;
  });
  decalage += 200;
  ctx.font = '20px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'red';
  ctx.fillText(`${x} seconds`, canvas.width / 2, decalage);
  ctx.textAlign = 'left';
});

// Quand le joueur meurt
socket.on('died', () => {
  this.music.pause();
  this.diedSound.play();
  console.log('died');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'Gray';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = '50px Arial';
  ctx.textAlign = 'center';
  ctx.fillStyle = 'red';
  ctx.fillText('YOU DIED !', canvas.width / 2, canvas.height / 2);
  ctx.textAlign = 'left';
});

// Quand le joueur est touché par un virus
socket.on('damage', () => {
  this.damageSound.play();
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
});

// Quand le joueur mange
socket.on('eat', () => {
  this.eatSound.play();
});

// Quand le joueur obtient le bonus d'accélération
socket.on('speedUp', () => {
  this.music.playbackRate = 1.5;
  setTimeout(() => {
    this.music.playbackRate = 1;
  }, 5000);
});

// Affiche le timer
/* function drawTimer(ctx, timer) {

} */

// Affiche le chat
function drawChat(ctx, height) {
  let decalage = 12;
  ctx.font = '12px Arial';
  ctx.fillStyle = 'white';
  const reversedMessages = [...messages];
  const messageSize = 40;
  const minHeight = Math.min(canvas.height, height);
  let partSize = 0;
  reversedMessages.reverse().slice(0, 5).forEach((message) => {
    while (message.length > 0) {
      partSize = (message.length % messageSize) === 0
        ? messageSize : (message.length % messageSize);
      ctx.fillText(message.substring(message.length - partSize, message.length).trim(),
        10, minHeight - decalage);
      decalage += 15;
      message = message.substring(0, message.length - partSize);
    }
    decalage += 5;
  });
  context.fillStyle = '#FFFFFF';
  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(0, minHeight - decalage, 300, minHeight);
}

// Affiche le leaderboard
function drawLeaderboard(ctx, width, leaderboard) {
  let decalage = 35;
  const minWidth = Math.min(canvas.width, width);
  const largeurLeaderboard = 315;
  ctx.font = '30px Arial';
  ctx.fillStyle = 'white';
  ctx.fillText('Leaderboard', minWidth - largeurLeaderboard + 25, decalage);
  decalage += 40;
  leaderboard.forEach((player) => {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    let mass = player.mass < 10 ? 10 : player.mass;
    mass = player.oldMass > mass ? player.oldMass : mass;
    ctx.fillText(`${player.id} : ${mass}`, minWidth - largeurLeaderboard + 10, decalage);
    decalage += 25;
  });
  context.fillStyle = '#FFFFFF';
  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.fillRect(minWidth - largeurLeaderboard, 0, minWidth, decalage);
}

// Dessine l'écran de jeu
socket.on('draw', (players, food, virus, playerIndex, width, height, leaderboard, timer) => {
  this.gameStop.pause();
  this.gameStop.currentTime = 0;
  this.music.play();
  this.music.volume = 0.2;
  const xPlayer = players[playerIndex].x;
  const yPlayer = players[playerIndex].y;
  const ctx = canvas.getContext('2d');
  let xCamera = 0;
  let yCamera = 0;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  // Centre la camera sur le joueur
  if (canvas.width < width) {
    if (xPlayer > canvas.width / 2 && xPlayer + canvas.width / 2 < width) {
      xCamera = xPlayer - canvas.width / 2;
    } else if (xPlayer + canvas.width / 2 >= width) {
      xCamera = width - canvas.width;
    }
    ctx.translate(-xCamera, 0);
  }
  if (canvas.height < height) {
    if (yPlayer > canvas.height / 2 && yPlayer + canvas.height / 2 < height) {
      yCamera = yPlayer - canvas.height / 2;
    } else if (yPlayer + canvas.height / 2 >= height) {
      yCamera = height - canvas.height;
    }
    ctx.translate(0, -yCamera);
  }
  // Affiche le terrain de jeu
  ctx.fillStyle = 'LightGray';
  ctx.fillRect(0, 0, width, height);
  // Affiche chaque joueur
  players.forEach((player) => {
    if (player.alive && player.x >= xCamera && player.x <= xCamera + canvas.width
        && player.y >= yCamera && player.y <= yCamera + canvas.height) {
      ctx.beginPath();
      ctx.arc(player.x, player.y, player.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'blue';
      ctx.fill();
      ctx.font = '10px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(player.mass, player.x - player.radius / 2, player.y + player.radius / 3);
      ctx.closePath();
    }
  });
  // Affiche chaque nourriture
  food.forEach((currentFood) => {
    if (currentFood.x >= xCamera && currentFood.x <= xCamera + canvas.width
        && currentFood.y >= yCamera && currentFood.y <= yCamera + canvas.height) {
      ctx.fillStyle = 'green';
      if (currentFood.magic) {
        ctx.fillStyle = 'purple';
      }
      ctx.beginPath();
      ctx.arc(currentFood.x, currentFood.y, currentFood.radius, 0, 2 * Math.PI, false);
      ctx.fill();
      ctx.closePath();
    }
  });
  // Affiche chaque virus
  virus.forEach((currentVirus) => {
    if (currentVirus.x >= xCamera && currentVirus.x <= xCamera + canvas.width
        && currentVirus.y >= yCamera && currentVirus.y <= yCamera + canvas.height) {
      ctx.beginPath();
      ctx.arc(currentVirus.x, currentVirus.y, currentVirus.radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = 'red';
      ctx.fill();
      ctx.closePath();
    }
  });
  ctx.restore();
  // Affiche le Leaderboard
  drawLeaderboard(ctx, width, leaderboard);
  // Affiche le chat
  drawChat(ctx, height);
  // Affiche le timer
  // drawTimer(ctx, timer);
});

// Gestion des mouvements du joueur
const playerMovement = {
  up: false,
  down: false,
  left: false,
  right: false,
};

setInterval(() => {
  socket.emit('movement', playerMovement);
}, 1000 / 60);

document.addEventListener('keydown', (event) => {
  switch (event.keyCode) {
    case 81: // Q
      playerMovement.left = true;
      break;
    case 90: // Z
      playerMovement.up = true;
      break;
    case 68: // D
      playerMovement.right = true;
      break;
    case 83: // S
      playerMovement.down = true;
      break;
    default:
        // do nothing
  }
});
document.addEventListener('keyup', (event) => {
  switch (event.keyCode) {
    case 81: // Q
      playerMovement.left = false;
      break;
    case 90: // Z
      playerMovement.up = false;
      break;
    case 68: // D
      playerMovement.right = false;
      break;
    case 83: // S
      playerMovement.down = false;
      break;
    default:
        // do nothing
  }
});

// Système de chat
this.$('form').submit(() => {
  const msg = this.$('#m').val();
  if (msg.trim().length > 0) {
    socket.emit('message', msg);
  }
  this.$('#m').val('');
  return false;
});

socket.on('message', (msg) => {
  messages.push(msg);
});
