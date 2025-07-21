import { useState, useEffect } from "react";
import { apiRequest } from "./queryClient";

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  businessId: number;
  isActive: boolean | null;
  createdAt: Date | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  login: (credentials: { username: string; businessId: number }) => Promise<void>;
  register: (data: any) => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await apiRequest("GET", "/api/me");
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (credentials: { username: string; businessId: number }) => {
    setIsLoggingIn(true);
    try {
      const response = await apiRequest("POST", "/api/login", {
        username: credentials.username,
        businessId: credentials.businessId
      });
      if (response.ok) {
        await checkAuth(); // Refresh user data
        window.location.href = "/"; // Redirect to home
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Login failed. Please check your username and business ID.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsRegistering(true);
    try {
      const response = await apiRequest("POST", "/api/register", data);
      if (response.ok) {
        await checkAuth(); // Refresh user data
        window.location.href = "/"; // Redirect to home
      } else {
        throw new Error("Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Registration failed. Please try again.");
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isLoggingIn,
    isRegistering,
    login: handleLogin,
    register: handleRegister,
  };
}

export async function login(username: string, password: string): Promise<boolean> {
  try {
    const response = await apiRequest("POST", "/api/login", {
      username,
      password,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

export async function logout(): Promise<void> {
  try {
    await apiRequest("POST", "/api/logout");
  } catch (error) {
    // Handle logout error if needed
  }
}