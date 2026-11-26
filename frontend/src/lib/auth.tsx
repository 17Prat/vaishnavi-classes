"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, UserRole } from "@/types";
import { apiFetch } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<User>;
  registerUser: (data: {
    full_name: string;
    phone: string;
    email?: string;
    role?: string;
    password: string;
    course_interest?: string;
  }) => Promise<User>;
  forgotPassword: (
    loginIdOrPhone: string,
    newPassword?: string
  ) => Promise<{ message: string; login_id?: string; reset: boolean }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Validate / refresh from localStorage after client mounts
    const savedToken = localStorage.getItem("vaishnavi_token") || localStorage.getItem("feeflow_token");
    const savedUser = localStorage.getItem("vaishnavi_user") || localStorage.getItem("feeflow_user");

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("feeflow_token");
        localStorage.removeItem("feeflow_user");
        localStorage.removeItem("vaishnavi_token");
        localStorage.removeItem("vaishnavi_user");
        setToken(null);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (loginId: string, password: string): Promise<User> => {
    const res = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ login_id: loginId, password }),
    });

    const accessToken = res.access_token;
    const userData = res.user;

    localStorage.setItem("feeflow_token", accessToken);
    localStorage.setItem("feeflow_user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const registerUser = async (data: {
    full_name: string;
    phone: string;
    email?: string;
    role?: string;
    password: string;
    course_interest?: string;
  }): Promise<User> => {
    const res = await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    const accessToken = res.access_token;
    const userData = res.user;

    localStorage.setItem("feeflow_token", accessToken);
    localStorage.setItem("feeflow_user", JSON.stringify(userData));

    setToken(accessToken);
    setUser(userData);
    return userData;
  };

  const forgotPassword = async (
    loginIdOrPhone: string,
    newPassword?: string
  ): Promise<{ message: string; login_id?: string; reset: boolean }> => {
    return await apiFetch("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        login_id_or_phone: loginIdOrPhone,
        new_password: newPassword,
      }),
    });
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem("feeflow_token");
    localStorage.removeItem("feeflow_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  const refreshUser = async () => {
    try {
      const u = await apiFetch("/auth/me");
      setUser(u);
      localStorage.setItem("feeflow_user", JSON.stringify(u));
    } catch {
      // Ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        registerUser,
        forgotPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
