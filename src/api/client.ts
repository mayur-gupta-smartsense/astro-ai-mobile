import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Point mobile app to remote backend
// Production URL for all native builds (APK/IPA) and web production
// Only use localhost for web development mode
const BASE_URL = (Platform.OS === 'web' && typeof __DEV__ !== 'undefined' && __DEV__)
  ? "http://localhost:8000"
  : "https://astroai.duckdns.org";

console.log('[DEBUG] API Configuration:', {
  __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined',
  Platform: Platform.OS,
  BASE_URL: BASE_URL,
  isWeb: Platform.OS === 'web',
  isDev: typeof __DEV__ !== 'undefined' && __DEV__
});

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Add JWT token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default client;
