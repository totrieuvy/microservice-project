import axios from "axios";
import type { InternalAxiosRequestConfig, AxiosError } from "axios";

const baseURL = "http://localhost:8090/api";

const api = axios.create({
  baseURL,
  timeout: 300000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = sessionStorage.getItem("token")?.replaceAll('"', "");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

export default api;
