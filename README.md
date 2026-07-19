# Job Tracker

Ứng dụng fullstack theo dõi quá trình ứng tuyển việc làm — hỗ trợ quản lý đơn ứng tuyển dạng Kanban board, thông báo real-time, thống kê trực quan.

🔗 **Demo**: [job-tracker-frontend-azure.vercel.app](https://job-tracker-frontend-azure.vercel.app)

## Kiến trúc hệ thống

Dự án áp dụng kiến trúc đa dịch vụ (polyglot microservices):

- **backend/** — Spring Boot (Java): Authentication, Task & Job Application CRUD
- **notification/** — Node.js + Socket.io: Real-time notification
- **frontend/** — React: Kanban board, thống kê, dark mode

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java, Spring Boot, Spring Security, Spring Data MongoDB, Bean Validation |
| Real-time service | Node.js, Express, Socket.io |
| Frontend | React, Vite, Tailwind CSS, React Router, @dnd-kit, Recharts, Axios |
| Database | MongoDB Atlas |
| Deploy | Render (backend + notification), Vercel (frontend) |

## Tính năng chính

- Đăng ký / đăng nhập, mã hóa mật khẩu (BCrypt)
- Quản lý đơn ứng tuyển dạng Kanban board (kéo-thả đổi trạng thái)
- Task con gắn với từng đơn ứng tuyển
- Tìm kiếm, lọc, sắp xếp
- Nhắc nhở deadline sắp đến hạn / quá hạn
- Thông báo real-time khi tạo công việc mới (Socket.io)
- Trang thống kê: tỷ lệ phản hồi, tỷ lệ offer, biểu đồ phân bố trạng thái
- Dark mode
- Quản lý hồ sơ cá nhân (đổi tên, đổi mật khẩu)
- Validate dữ liệu và xử lý lỗi tập trung ở backend

## Chạy dự án ở local

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Yêu cầu biến môi trường `SPRING_MONGODB_URI` trỏ tới MongoDB Atlas.

### Notification (Node.js)

```bash
cd notification
npm install
npm run dev
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```