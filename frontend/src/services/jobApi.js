import api from './api';

export const getJobApplications = (userId) =>
  api.get(`/job-applications/user/${userId}`);

export const createJobApplication = (data) =>
  api.post('/job-applications', data);

export const updateJobApplication = (id, data) =>
  api.put(`/job-applications/${id}`, data);

export const updateJobStatus = (id, status) =>
  api.patch(`/job-applications/${id}/status`, { status });

export const deleteJobApplication = (id) =>
  api.delete(`/job-applications/${id}`);

export const getJobStats = (userId) =>
  api.get(`/job-applications/user/${userId}/stats`);