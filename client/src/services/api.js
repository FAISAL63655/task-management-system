import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Services
export const authService = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  }
};

// Task Services
export const taskService = {
  getAllTasks: async (filters = {}) => {
    const response = await api.get('/api/tasks', { params: filters });
    return response.data;
  },
  getTaskById: async (id) => {
    const response = await api.get(`/api/tasks/${id}`);
    return response.data;
  },
  createTask: async (taskData) => {
    const response = await api.post('/api/tasks', taskData);
    return response.data;
  },
  updateTask: async (id, taskData) => {
    const response = await api.put(`/api/tasks/${id}`, taskData);
    return response.data;
  },
  deleteTask: async (id) => {
    const response = await api.delete(`/api/tasks/${id}`);
    return response.data;
  },
  addComment: async (taskId, comment) => {
    const response = await api.post(`/api/tasks/${taskId}/comment`, { text: comment });
    return response.data;
  }
};

export default api;
