import http from 'http';
import express from 'express';
import morgan from 'morgan';
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

app.get('/', (req, res) => {
  res.send('Welcome to Chatty App!');
});

io.on('connection', (socket) => {
  console.log(`connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`disconnected: ${socket.id}`);
  })
});

server.listen(port, () => console.log(`Server running on port ${port}`));
