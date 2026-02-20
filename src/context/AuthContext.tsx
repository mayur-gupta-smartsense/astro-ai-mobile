import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as api from "../api/endpoints";
import { getBirthProfile } from "../api/endpoints";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasProfile: boolean;
  setHasProfile: (v: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  token: null,
  isAuthenticated: false,
  loading: true,
  hasProfile: false,
  setHasProfile: () => {},
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // Load stored token on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("token");
        if (stored) {
          setToken(stored);
          // Check if user has a birth profile
          try {
            await getBirthProfile();
            setHasProfile(true);
          } catch {
            setHasProfile(false);
          }
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    await AsyncStorage.setItem("token", access_token);
    setToken(access_token);

    try {
      await getBirthProfile();
      setHasProfile(true);
    } catch {
      setHasProfile(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    const { access_token } = await api.register(email, password, name);
    await AsyncStorage.setItem("token", access_token);
    setToken(access_token);
    setHasProfile(false);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
    setHasProfile(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        loading,
        hasProfile,
        setHasProfile,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
