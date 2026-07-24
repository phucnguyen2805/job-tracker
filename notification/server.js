const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const { Resend } = require('resend');
const cron = require('node-cron');
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

// ===== Kết nối MongoDB =====
let db;
MongoClient.connect(process.env.MONGODB_URI)
  .then((client) => {
    db = client.db();
    console.log('Đã kết nối MongoDB (notification service)');
  })
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// ===== Cấu hình gửi email =====
const resend = new Resend(process.env.RESEND_API_KEY);

function isUpcoming(deadline) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(deadline);
  const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

function isOverdue(deadline) {
  if (!deadline) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(deadline) < today;
}

// ===== Hàm chính: kiểm tra deadline và gửi email =====
async function checkAndSendReminders() {
  if (!db) {
    console.log('Chưa kết nối MongoDB, bỏ qua lần kiểm tra này');
    return { sent: 0 };
  }

  const jobs = await db.collection('job_applications')
    .find({ status: { $ne: 'REJECTED' } })
    .toArray();

  const relevant = jobs.filter((j) => isUpcoming(j.deadline) || isOverdue(j.deadline));

  // Gom theo userId
  const byUser = {};
  relevant.forEach((job) => {
    if (!byUser[job.userId]) byUser[job.userId] = [];
    byUser[job.userId].push(job);
  });

  let sentCount = 0;

  const { ObjectId } = require('mongodb');

  for (const userId of Object.keys(byUser)) {
    // Bỏ qua nếu userId không đúng định dạng ObjectId hợp lệ
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.log(`Bỏ qua userId không hợp lệ: ${userId}`);
      continue;
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    if (!user || !user.email) continue;

    const jobList = byUser[userId];
    const overdueList = jobList.filter((j) => isOverdue(j.deadline));
    const upcomingList = jobList.filter((j) => isUpcoming(j.deadline));

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color: #4f46e5;">Nhắc nhở ứng tuyển - Job Tracker</h2>
        <p>Xin chào ${user.username},</p>
        ${overdueList.length > 0 ? `
          <h3 style="color: #ef4444;">⚠️ Đã quá hạn (${overdueList.length})</h3>
          <ul>${overdueList.map((j) => `<li><b>${j.company}</b> - ${j.position} (hạn: ${j.deadline})</li>`).join('')}</ul>
        ` : ''}
        ${upcomingList.length > 0 ? `
          <h3 style="color: #f59e0b;">🔔 Sắp đến hạn (${upcomingList.length})</h3>
          <ul>${upcomingList.map((j) => `<li><b>${j.company}</b> - ${j.position} (hạn: ${j.deadline})</li>`).join('')}</ul>
        ` : ''}
        <p style="margin-top: 20px;">
          <a href="${process.env.CLIENT_URL}/jobs" style="background: #4f46e5; color: white; padding: 10px 16px; border-radius: 8px; text-decoration: none;">
            Xem chi tiết
          </a>
        </p>
      </div>
    `;

    try {
      await resend.emails.send({
        from: 'Job Tracker <onboarding@resend.dev>',
        to: user.email,
        subject: `Bạn có ${jobList.length} đơn ứng tuyển cần chú ý`,
        html: htmlContent,
      });
      sentCount++;
      console.log(`Đã gửi email nhắc nhở tới ${user.email}`);
    } catch (err) {
      console.error(`Lỗi gửi email tới ${user.email}:`, err.message);
    }
  }

  return { sent: sentCount };
}

// ===== Chạy tự động mỗi ngày lúc 8h sáng =====
cron.schedule('0 8 * * *', () => {
  console.log('Đang chạy kiểm tra nhắc nhở deadline (lịch tự động)...');
  checkAndSendReminders();
});

// ===== Endpoint test thủ công (gọi tay để demo ngay lập tức) =====
app.get('/api/test-send-reminders', async (req, res) => {
  const result = await checkAndSendReminders();
  res.json({ message: `Đã gửi ${result.sent} email nhắc nhở`, ...result });
});

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