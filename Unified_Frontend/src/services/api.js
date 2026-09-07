import axios from "axios";

const BASE = (import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:3010/api").replace(/\/+$/, "");

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
