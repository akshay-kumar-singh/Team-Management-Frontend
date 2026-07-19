import axios from "axios";
import { auth } from "./firebase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    // getIdToken() returns the cached token and only refreshes it when expired;
    // forcing a refresh here would add a network round-trip to every request
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || "Something went wrong";
    console.error("API Error:", message);
    const err = new Error(message);
    // Machine-readable reason (ORG_SUSPENDED, PLAN_LIMIT_MEMBERS, ...) when the API sends one
    err.code = error.response?.data?.code;
    err.status = error.response?.status;
    return Promise.reject(err);
  }
);

export default api;
