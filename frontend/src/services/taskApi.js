import api from './api';

export const getTasksByJob = (jobApplicationId) =>
  api.get(`/tasks/job/${jobApplicationId}`);

export const createTask = (data) => api.post('/tasks', data);

export const updateTask = (id, data) => api.put(`/tasks/${id}`, data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`);