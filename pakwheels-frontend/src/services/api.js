import axios from "axios";

// Live website par VITE_API_URL se backend ka address aata hai.
// Na likha ho to laptop wala address use hota hai.
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL,
});

// Har request ke sath token khud lag jayega (agar login hai)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;