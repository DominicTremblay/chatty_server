import http from 'http';
import express from 'express';
import morgan from 'morgan';
import faker from 'faker';
import randomColor from 'randomcolor';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

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
const messageHistory = [];

const createAvatar = () => {
  const avatars = {
    Female: [
      'https://i.imgur.com/nlhLi3I.png',
      'https://i.imgur.com/z5LNkkB.png',
      'https://i.imgur.com/v0JXau2.png',
      'https://i.imgur.com/lRUnDgU.png',
      'https://i.imgur.com/3GvwNBf.png',
    ],
    Male: [
      'https://i.imgur.com/73hZDYK.png',
      'https://i.imgur.com/5fUVPRP.png',
      'https://i.imgur.com/DVpDmdR.png',
      'https://i.imgur.com/2WZtOD6.png',
      'https://i.imgur.com/ilT4JDe.png',
    ],
  };
  const gender = Math.floor(Math.random() * 2) + 1 === 0 ? 'Female' : 'Male';
  console.log({ gender });
  const avatarArray = avatars[gender];
  const userAvatar =
    avatarArray[Math.floor(Math.random() * avatarArray.length)];

  return userAvatar;
};

const addUser = (socketId, users) => {
  users[socketId] = {
    socketId,
    avatar: createAvatar(),
    username: faker.internet.userName(),
    color: randomColor(),
  };

  console.log(users[socketId]);

  return users[socketId];
};

const removeUser = (socketId, users) => {
  delete users[socketId];
  return users;
};

const addNewMessage = (msg) => {

  msg.id = uuidv4();
  msg.time = new Date();

  messageHistory.push(msg);

  return msg;
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
    const newMsg = addNewMessage(msg);
    console.log('Broadcasting msg');
    io.emit('msg:broadcast', newMsg);
  });

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);

    removeUser(socket.id, users);
    console.log(users);
  });
});

server.listen(port, () => console.log(`Server running on port ${port}`));
