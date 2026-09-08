import axios from "axios";
import { getBackendBaseUrl } from "../utils/apiConfig";

const api = axios.create();

api.interceptors.request.use((config) => {
  if (!config.baseURL) {
    config.baseURL = getBackendBaseUrl();
  }
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
