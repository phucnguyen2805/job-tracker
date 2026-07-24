import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tự động đính kèm token vào mọi request
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Chuẩn hóa lỗi trả về từ backend + tự động đăng xuất nếu token hết hạn
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;
    const status = error.response?.status;

    // Token hết hạn hoặc không hợp lệ -> tự động đăng xuất
    if (status === 403 || status === 401) {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }

    if (data?.fieldErrors) {
      error.friendlyMessage = Object.values(data.fieldErrors).join(', ');
      error.fieldErrors = data.fieldErrors;
    } else if (data?.error) {
      error.friendlyMessage = data.error;
    } else if (error.message === 'Network Error') {
      error.friendlyMessage = 'Không thể kết nối tới server. Kiểm tra lại kết nối mạng.';
    } else {
      error.friendlyMessage = 'Đã có lỗi xảy ra, vui lòng thử lại.';
    }

    return Promise.reject(error);
  }
);

export default api;