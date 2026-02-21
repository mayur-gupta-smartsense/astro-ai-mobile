import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Point mobile app to remote backend
// Production URL for all native builds (APK/IPA) and web production
// Only use localhost for web development mode
const BASE_URL = (Platform.OS === 'web' && typeof __DEV__ !== 'undefined' && __DEV__)
  ? "http://localhost:8000"
  : "http://65.2.140.123:8000";

// #region agent log
console.log('[DEBUG] API Configuration:', {
  __DEV__: typeof __DEV__ !== 'undefined' ? __DEV__ : 'undefined',
  Platform: Platform.OS,
  BASE_URL: BASE_URL,
  isWeb: Platform.OS === 'web',
  isDev: typeof __DEV__ !== 'undefined' && __DEV__
});
// #endregion

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Add JWT token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("token");
  // #region agent log
  if (config.url?.includes('/charts/me')) {
    fetch('http://127.0.0.1:7243/ingest/1a821131-c13f-410e-9d5e-7fdce8be9550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:16',message:'Request interceptor for charts/me',data:{url:config.url,hasToken:!!token,tokenLength:token?.length||0,baseURL:config.baseURL,timestamp:Date.now()},timestamp:Date.now(),runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  }
  // #endregion
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 — clear token
client.interceptors.response.use(
  (response) => {
    // #region agent log
    if (response.config.url?.includes('/charts/me')) {
      fetch('http://127.0.0.1:7243/ingest/1a821131-c13f-410e-9d5e-7fdce8be9550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:25',message:'Response interceptor success for charts/me',data:{status:response.status,hasData:!!response.data,timestamp:Date.now()},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    return response;
  },
  async (error) => {
    // #region agent log
    if (error.config?.url?.includes('/charts/me')) {
      fetch('http://127.0.0.1:7243/ingest/1a821131-c13f-410e-9d5e-7fdce8be9550',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'client.ts:30',message:'Response interceptor error for charts/me',data:{status:error.response?.status,statusText:error.response?.statusText,errorData:error.response?.data,hasResponse:!!error.response,isNetworkError:!error.response,message:error.message,timestamp:Date.now()},timestamp:Date.now(),runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default client;
