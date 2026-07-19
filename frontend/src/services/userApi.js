import api from './api';

export const updateProfile = (userId, data) =>
  api.put(`/users/${userId}/profile`, data);

export const changePassword = (userId, data) =>
  api.put(`/users/${userId}/password`, data);