import axios, { AxiosInstance } from "axios";
import Cookies from "js-cookie";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api: AxiosInstance = axios.create({
  baseURL: `${BASE}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      Cookies.remove("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
