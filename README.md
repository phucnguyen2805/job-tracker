# Job Tracker

Ứng dụng fullstack theo dõi quá trình ứng tuyển việc làm — quản lý đơn ứng tuyển dạng Kanban board, nhắc nhở deadline, tạo câu hỏi phỏng vấn bằng AI, và nhiều tính năng khác.

🔗 **Demo**: [job-tracker-frontend-azure.vercel.app](https://job-tracker-frontend-azure.vercel.app)

## Kiến trúc hệ thống

Dự án áp dụng kiến trúc đa dịch vụ (polyglot microservices):

- **backend/** — Spring Boot (Java): Authentication (JWT + Google OAuth), Task & Job Application CRUD, AI Mock Interview, xử lý CV upload
- **notification/** — Node.js + Socket.io: Real-time notification, email nhắc nhở deadline
- **frontend/** — React: Kanban board, Calendar, thống kê, tìm kiếm toàn cục, dark mode

## Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java, Spring Boot, Spring Security, JWT, Spring Data MongoDB, Bean Validation |
| Real-time & Email | Node.js, Express, Socket.io, Resend API |
| Frontend | React, Vite, Tailwind CSS, React Router, @dnd-kit, Recharts, date-fns |
| Database | MongoDB Atlas |
| Dịch vụ ngoài | Google Gemini API (AI), Google OAuth 2.0, Cloudinary (lưu trữ file) |
| DevOps | Docker, GitHub Actions (CI/CD), Render, Vercel |
| Testing | JUnit, Mockito |

## Tính năng chính

**Authentication & Bảo mật**
- Đăng ký / đăng nhập, đăng nhập bằng Google
- JWT Authentication bảo vệ toàn bộ API
- Rate limiting chống spam/brute-force
- Mã hóa mật khẩu (BCrypt)

**Quản lý ứng tuyển**
- Kanban board kéo-thả đổi trạng thái
- Task con gắn với từng đơn ứng tuyển, tự động tạo task mẫu
- Ghi nhận kết quả phỏng vấn (đánh giá sao, ghi chú)
- Lưu trữ CV/file đính kèm cho từng đơn
- Cảnh báo trùng lặp công ty
- Tìm kiếm, lọc, sắp xếp, tìm kiếm toàn cục (Global Search)
- Lịch sử thao tác (timeline)

**Nhắc nhở & Lịch**
- Banner cảnh báo deadline sắp đến hạn / quá hạn
- Email nhắc nhở tự động hàng ngày
- Calendar View xem deadline và lịch phỏng vấn theo tháng

**AI**
- Tạo câu hỏi phỏng vấn mô phỏng (Mock Interview) bằng Gemini AI, giới hạn theo user

**Thống kê & Báo cáo**
- Tỷ lệ phản hồi, tỷ lệ nhận offer, biểu đồ phân bố trạng thái
- Xuất báo cáo PDF/Excel

**Trải nghiệm người dùng**
- Dark mode, responsive mobile
- Onboarding tour cho người dùng lần đầu
- Loading skeleton, toast thông báo
- Thông báo real-time (Socket.io)

## Chạy dự án ở local

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Cần cấu hình các biến môi trường trong `application.properties`: `spring.mongodb.uri`, `jwt.secret`, `gemini.api.key`, `cloudinary.*`.

### Notification (Node.js)

```bash
cd notification
npm install
npm run dev
```

Cần file `.env` với: `MONGODB_URI`, `CLIENT_URL`, `RESEND_API_KEY`.

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Cần file `.env` với: `VITE_API_URL`, `VITE_SOCKET_URL`, `VITE_GOOGLE_CLIENT_ID`.

## CI/CD

Cả backend và frontend đều có pipeline GitHub Actions tự động build và test khi push code lên nhánh `main`.
