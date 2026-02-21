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
        console.log("[AuthContext] Loading stored token...");
        const stored = await AsyncStorage.getItem("token");
        if (stored) {
          console.log("[AuthContext] Token found, setting token");
          setToken(stored);
          // Check if user has a birth profile
          try {
            console.log("[AuthContext] Fetching birth profile...");
            await getBirthProfile();
            console.log("[AuthContext] Birth profile found, hasProfile = true");
            setHasProfile(true);
          } catch (err) {
            console.log("[AuthContext] Birth profile not found or error:", err);
            console.error("[AuthContext] Birth profile error:", err);
            setHasProfile(false);
          }
        } else {
          console.log("[AuthContext] No stored token found");
        }
      } catch (err) {
        console.log("[AuthContext] Error loading stored token:", err);
        console.error("[AuthContext] Error loading stored token:", err);
      } finally {
        console.log("[AuthContext] Loading complete");
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log("[AuthContext] Login attempt for:", email);
      const { access_token } = await api.login(email, password);
      console.log("[AuthContext] Login API response received, token:", access_token);
      await AsyncStorage.setItem("token", access_token);
      console.log("[AuthContext] Token stored in AsyncStorage");
      setToken(access_token);
      console.log("[AuthContext] Login successful for:", email);

      try {
        console.log("[AuthContext] Fetching birth profile after login...");
        await getBirthProfile();
        console.log("[AuthContext] Birth profile fetched successfully");
        setHasProfile(true);
      } catch (profileError) {
        console.log("[AuthContext] Failed to fetch birth profile after login:", profileError);
        console.error("[AuthContext] Failed to fetch birth profile after login:", profileError);
        setHasProfile(false);
      }
    } catch (error) {
      console.log("[AuthContext] Login failed:", error);
      console.error("[AuthContext] Login failed:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      console.log("[AuthContext] Register attempt for:", email, "name:", name);
      const { access_token } = await api.register(email, password, name);
      console.log("[AuthContext] Register API response received, token:", access_token);
      await AsyncStorage.setItem("token", access_token);
      console.log("[AuthContext] Token stored in AsyncStorage");
      setToken(access_token);
      console.log("[AuthContext] Register successful for:", email);
      setHasProfile(false);
      } catch (error) {
        console.log("[AuthContext] Register failed:", error);
        console.error("[AuthContext] Register failed:", error);
        throw error;
      }
    };

    const logout = async () => {
      console.log("[AuthContext] Logout started");
      await AsyncStorage.removeItem("token");
      console.log("[AuthContext] Token removed from AsyncStorage");
      setToken(null);
      setHasProfile(false);
      console.log("[AuthContext] Logout complete");
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
