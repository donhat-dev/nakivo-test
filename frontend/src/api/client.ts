import axios from "axios";
import { clearAuthSession, redirectToLogin } from "../lib/auth-session";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "/api";

export const client = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      redirectToLogin();
    }
    return Promise.reject(error);
  },
);
