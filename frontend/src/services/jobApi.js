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

export const getJobActivity = (jobId) =>
  api.get(`/job-applications/${jobId}/activity`);

export const generateMockInterview = (jobId, jobDescription) =>
  api.post(`/job-applications/${jobId}/mock-interview`, { jobDescription });

export const getInterviewNotes = (jobId) =>
  api.get(`/interview-notes/job/${jobId}`);

export const createInterviewNote = (data) =>
  api.post('/interview-notes', data);

export const deleteInterviewNote = (id) =>
  api.delete(`/interview-notes/${id}`);

export const getInterviewNotesByUser = (userId) =>
  api.get(`/interview-notes/user/${userId}`);

export const uploadResume = (jobId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/job-applications/${jobId}/resume`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteResume = (jobId) =>
  api.delete(`/job-applications/${jobId}/resume`);