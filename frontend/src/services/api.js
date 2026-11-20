import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${baseUrl}/api`,
});

export default api;