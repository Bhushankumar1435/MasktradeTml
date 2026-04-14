import axios from "axios";

const api = axios.create({
  // baseURL: "http://192.168.1.10:8000/api",
  // baseURL: "http://10.124.73.216:8000/api",
  //  baseURL: "http://13.202.144.49:8000/api",
   baseURL: "https://api.robofict.mail-go.site/api"

});

//  Token auto attach
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  401 handle and Global Error JSON Parsing
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      window.location.href = "/login";
    }

    // Attempt to globally parse stringified JSON error messages (e.g. Binance errors)
    if (err.response && err.response.data && typeof err.response.data.message === "string") {
      try {
        const parsed = JSON.parse(err.response.data.message);
        if (parsed.msg) {
          err.response.data.message = parsed.msg;
        } else if (parsed.message) {
          err.response.data.message = parsed.message;
        }
      } catch (e) {
        // Not a JSON string, leave it unaltered
      }
    }

    return Promise.reject(err);
  }
);

export default api;