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
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
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