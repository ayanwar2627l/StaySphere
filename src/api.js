import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ss_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If server returns 401, clear stale auth and let the UI handle it
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ss_token");
      localStorage.removeItem("ss_user");
    }
    return Promise.reject(err);
  }
);

export default api;