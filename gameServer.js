// include express
var express = require('express');
// initialise an app with express;
var app = express();
// include http server ?
var http = require('http');
// create http server
http = http.createServer(app);
// app.router
var router = express.Router();
// path object used for directory
var path = require('path');
// include socket.io and create an io object?
var io = require('socket.io')(http);



var links = {
	PC: null,
	player: [],
};
io.on('connection', function(socket) {
	socket.on('create a game', function(msg){
		links.PC = socket;
		links.player = [];
		console.log('create a new game.');
	});
	socket.on('disconnect', function(){
  		socket.broadcast.emit('user exit');
	});
	socket.on('select', function(){
		console.log(links.player.indexOf(socket))
		if(links.player.indexOf(socket) < 0){
			links.player.push(socket);
		}
		console.log('select');

		if(links.player.length == 2) {
			console.log('game starts')
			links.PC.emit('gameStart');
		}
	});

	socket.on('up', function(){
		var player = links.player.indexOf(socket);
		console.log('up')
		links.PC.emit('up',player);
	});
	socket.on('down', function(){
		var player = links.player.indexOf(socket);
		console.log('down')
		links.PC.emit('down',player);
	});
	socket.on('left', function(){
		var player = links.player.indexOf(socket);
		console.log('left')
		links.PC.emit('left',player);
	});
	socket.on('right', function(){
		var player = links.player.indexOf(socket);
		console.log('right')
		links.PC.emit('right',player);
	});
	socket.on('end right', function(){
		var player = links.player.indexOf(socket);
		console.log('end right')
		links.PC.emit('endRight',player);
	});
	socket.on('end up', function(msg){
		var player = links.player.indexOf(socket);
		console.log('end up');
		console.log(msg);
		links.PC.emit('endUp',player);
	});
	socket.on('end down', function(){
		var player = links.player.indexOf(socket);
		console.log('end down')
		links.PC.emit('endDown',player);
	});
	socket.on('end left', function(){
		var player = links.player.indexOf(socket);
		console.log('end left')
		links.PC.emit('endLeft',player);
	});
	socket.on('end X', function(){
		console.log('end X');
	});
	socket.on('end Y', function(){
		console.log('end Y');
	});
	socket.on('end A', function(){
		console.log('end A');
		var player = links.player.indexOf(socket);
		links.PC.emit('shoot',player);
	});
	socket.on('end B', function(){
		console.log('end B');
	});
	socket.on('X', function(){
		console.log('X');
	});
	socket.on('Y', function(){
		console.log('Y');
	});
	socket.on('A', function(){
		console.log('A');
	});
	socket.on('B', function(){
		console.log('B');
	});
	socket.on('end start', function(){
		console.log('end start');
	});
	socket.on('end select', function(){
		console.log('end select');
	});
	socket.on('start', function(){
		console.log('start');
	});
});

app.use(require('express').static(__dirname + '/'));
app.get('/game/', function(req, res) {
	res.sendFile(__dirname + '/game/index.html');
});
app.get('/gamepad/', function(req, res) {
	res.sendFile(__dirname + '/gamepad/gamepad.html');
});
http.listen(3100, function() {
	console.log('listening on *:3100');
});