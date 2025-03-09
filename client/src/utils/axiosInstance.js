import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL; // Backend URL

// ✅ Create an Axios Instance with Default Settings
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Add Axios Request Interceptor (Automatically Adds Token)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = process.env.REACT_APP_API_TOKEN;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Add Axios Response Interceptor (Handles Errors Globally)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default axiosInstance;
