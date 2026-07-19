import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chuẩn hóa lỗi trả về từ backend thành 1 dạng thống nhất
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const data = error.response?.data;

    if (data?.fieldErrors) {
      // Lỗi validate — gộp các message lại
      error.friendlyMessage = Object.values(data.fieldErrors).join(', ');
      error.fieldErrors = data.fieldErrors;
    } else if (data?.error) {
      // Lỗi nghiệp vụ (email trùng, sai mật khẩu...)
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