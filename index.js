import http from 'http';
import express from 'express';
import morgan from 'morgan';
import faker from 'faker';
import randomColor from 'randomcolor';
import { Server } from 'socket.io';

const port = process.env.PORT || 3001;

const app = express();
const server = http.createServer(app);
app.use(morgan('dev'));

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const users = {};

const addUser = (socketId, users) => {
  users[socketId] = {
    id: socketId,
    name: faker.internet.userName(),
    color: randomColor(),
    messages: [],
  };

  return users[socketId];
};

const removeUser = (socketId, users) => {
  delete users[socketId];
  return users;
};

const addNewMessage = (msg) => {
  const { from } = msg;

  users[from].messages.push(msg);
};

app.get('/', (req, res) => {
  res.send('Welcome to Chatty App!');
});

io.on('connection', (socket) => {
  console.log(`connected: ${socket.id}`);

  const newUser = addUser(socket.id, users);
  console.log(users);

  socket.emit('init:user_info', newUser);

  socket.on('msg:incoming', (msg) => {
    addNewMessage(msg);
    console.log("Broadcasting msg")
    io.emit('msg:broadcast', msg);
  });

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);

    removeUser(socket.id, users);
    console.log(users);
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
