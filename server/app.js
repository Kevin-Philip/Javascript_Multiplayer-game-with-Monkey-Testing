var app = require('express')();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
const port = process.env.PORT || 3000;
var usercount = 0;

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

io.on('connect', (socket) => {
  socket.username = 'User'+ usercount;
  usercount ++;
  
  socket.emit('message', 'You are ' + socket.username);
  io.emit('message', socket.username + ' joined the channel.');
  
  socket.on('message', (msg) => {
    io.emit('message', socket.username + ' said : '+ msg);
  });
  
  socket.on('disconnect', function() {
    usercount --;
    io.emit('message', socket.username + ' left the channel.');
  });
});

http.listen(port, function(){
  console.log('listening on *: ' +port);
});