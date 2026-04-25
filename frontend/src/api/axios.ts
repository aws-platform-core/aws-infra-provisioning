import axios from "axios";
import { fetchAuthSession } from "aws-amplify/auth";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use(async (config) => {
  try {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error("Failed to attach token", err);
  }
  return config;
});

export default api;