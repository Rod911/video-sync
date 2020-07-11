const express = require('express');
const path = require('path');
const port = process.env.PORT || 3000;
const app = express();
const http = require('http');
const socketIO = require('socket.io');

// serve static assets normally
app.use(express.static(__dirname + '/dist'));
app.use(express.static('static'));

// handle every other route with index.html, which will contain
// a script tag to your application's JavaScript file(s).
app.get('/', function (request, response) {
	response.sendFile(path.resolve(__dirname, 'static', 'index.html'))
});

const server = http.createServer(app);

const io = socketIO(server).listen(server);

const rooms = [{ id: "test_room", name: "Test Room", owner: "dsk07639" }];

io.on('connection', (socket) => {
	console.log(socket.id + ' connected');
	socket.on('disconnect', () => {
		console.log(socket.id + ' disconnected')
	});
	socket.on('join', (data) => {
		const userroom = rooms.find(room => {
			return room.id === data.room;
		});
		if (userroom) {
			socket.join(data.room);
			io.to(socket.id).emit('joined', userroom);
			console.log(socket.id + ' joined', userroom);
		} else{
			io.to(socket.id).emit('joined', false);
			console.log(socket.id + ' tried to join', data.room);
		}

		// socket.join(rooms[0].id);
		// io.to(socket.id).emit('joined', rooms[0]);
		// console.log(socket.id + ' joined', rooms[0]);
	});
	socket.on('create', (data) => {
		console.log(data['user'] + ' created room ' + socket.id + ' as ' + data['name']);
		const newRoom = {
			id: socket.id,
			name: data['name'],
			owner: data['user']
		}
		rooms.push(newRoom);
		io.to(socket.id).emit('joined', newRoom)
	});

	socket.on('pause', (data) => {
		io.to(data.room).emit('paused', data.state)
	});

	socket.on('progress', (data) => {
		io.to(data.room).emit('progress-change', data.time);
	})
});

server.listen(port, app.get('port'), () => {
	console.log("server started on port http://localhost:" + port)
});