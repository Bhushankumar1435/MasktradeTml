import axios from "axios";

const api = axios.create({
  // baseURL: "http://192.168.1.10:8000/api",
  // baseURL: "http://10.174.92.7:8000/api",
  //  baseURL: "http://13.202.144.49:8000/api",
   baseURL: "https://api.robofict.mail-go.site/api"

});

// 🔐 Token auto attach
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🚫 401 handle
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;