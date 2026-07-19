const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

// Route test
app.get('/', (req, res) => {
  res.send('Job Tracker Notification Service is running!');
});

// API để Spring Boot gọi sang khi có sự kiện task
app.post('/api/notify', (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'Thiếu userId hoặc message' });
  }

  io.to(userId).emit('notification', { message });

  console.log(`Đã gửi thông báo tới user ${userId}: ${message}`);
  res.json({ success: true });
});

// Xử lý kết nối Socket.io
io.on('connection', (socket) => {
  console.log('Client kết nối:', socket.id);

  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`Socket ${socket.id} đã join room: ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client ngắt kết nối:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Notification service đang chạy tại http://localhost:${PORT}`);
});