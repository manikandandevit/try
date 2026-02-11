import axios from "axios";
import { CONFIG } from "./config";

const API = axios.create({
  baseURL: CONFIG.BASE_URL,
  withCredentials: true, //  allow cookies
});

// Attach access token
API.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem("accessToken");
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    error ? p.reject(error) : p.resolve(token);
  });
  failedQueue = [];
};

// Auto refresh
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return API(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await API.post("/refresh-token");
        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return API(originalRequest);

      } catch (err) {
        processQueue(err);
        localStorage.removeItem("accessToken");
        window.location.href = "/";
        return Promise.reject(err);

      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
