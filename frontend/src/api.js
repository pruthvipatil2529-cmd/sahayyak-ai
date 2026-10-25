import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach JWT token to requests if authenticated
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahayyak_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Calm, friendly error handling (PRD Section 27)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let friendlyMessage = 'Sorry, something went wrong. Please try again.';
    if (error.response) {
      if (error.response.status === 401) {
        friendlyMessage = 'Please log in to continue.';
      } else if (error.response.data && error.response.data.detail) {
        friendlyMessage = error.response.data.detail;
      }
    } else if (error.request) {
      friendlyMessage = 'Could not reach Sahayyak server. Please make sure the backend is running.';
    }
    return Promise.reject(new Error(friendlyMessage));
  }
);

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/users/me');
    return res.data;
  },
  updateMe: async (userData) => {
    const res = await api.put('/users/me', userData);
    return res.data;
  },
};

export const categoriesAPI = {
  getCategories: async () => {
    const res = await api.get('/categories');
    return res.data;
  },
};

export const guidesAPI = {
  getGuides: async (params = {}) => {
    const res = await api.get('/guides', { params });
    return res.data;
  },
  getGuideById: async (id) => {
    const res = await api.get(`/guides/${id}`);
    return res.data;
  },
  createGuide: async (guideData) => {
    const res = await api.post('/guides', guideData);
    return res.data;
  },
  updateGuide: async (id, guideData) => {
    const res = await api.put(`/guides/${id}`, guideData);
    return res.data;
  },
  deleteGuide: async (id) => {
    const res = await api.delete(`/guides/${id}`);
    return res.data;
  },
};

export const savedGuidesAPI = {
  getSavedGuides: async () => {
    const res = await api.get('/saved-guides');
    return res.data;
  },
  saveGuide: async (guideId) => {
    const res = await api.post(`/saved-guides/${guideId}`);
    return res.data;
  },
  removeSavedGuide: async (guideId) => {
    const res = await api.delete(`/saved-guides/${guideId}`);
    return res.data;
  },
};

export const aiAPI = {
  chat: async (message, language = 'en', conversationId = null, conversationHistory = []) => {
    const res = await api.post('/ai/chat', {
      message,
      language,
      conversation_id: conversationId,
      conversation_history: conversationHistory,
    });
    return res.data;
  },
};

export const conversationsAPI = {
  getConversations: async () => {
    const res = await api.get('/conversations');
    return res.data;
  },
  getConversation: async (id) => {
    const res = await api.get(`/conversations/${id}`);
    return res.data;
  },
  deleteConversation: async (id) => {
    const res = await api.delete(`/conversations/${id}`);
    return res.data;
  },
};

export default api;
