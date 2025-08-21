import { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

interface User {
  id: number;
  name: string;
  email: string;
  username: string;
}

export const useAuth = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  const getToken = useCallback(() => {
    return localStorage.getItem("taskflow_token");
  }, []);

  const isAuthenticated = useCallback(() => {
    return !!getToken();
  }, [getToken]);

  const getUserInfo = useCallback(() => {
    const userJson = localStorage.getItem("taskflow_user");
    if (userJson) {
      return JSON.parse(userJson);
    }
    return null;
  }, []);

  const setUserInfo = useCallback((userData: User) => {
    localStorage.setItem("taskflow_user", JSON.stringify(userData));
    setUser(userData);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest("POST", "/api/auth/login", { email, password });
      
      localStorage.setItem("taskflow_token", data.token);
      setUserInfo(data.user);
      
      // Invalidate and refetch data
      queryClient.invalidateQueries();
      
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  }, [setUserInfo]);

  const signup = useCallback(async (name: string, email: string, username: string, password: string): Promise<boolean> => {
    try {
      const data = await apiRequest("POST", "/api/auth/signup", { 
        name, 
        email, 
        username, 
        password 
      });
      
      localStorage.setItem("taskflow_token", data.token);
      setUserInfo(data.user);
      
      // Invalidate and refetch data
      queryClient.invalidateQueries();
      
      return true;
    } catch (error: any) {
      console.error("Signup error:", error);
      
      // Check for specific error message indicating email already exists
      if (error.message && (
          error.message.includes("email already exists") || 
          error.message.includes("already in use") || 
          error.message.includes("duplicate")
        )) {
        throw new Error("An account with this email already exists.");
      }
      
      // Check for username already exists
      if (error.message && error.message.includes("username")) {
        throw new Error("This username is already taken. Please choose another.");
      }
      
      throw error; // Re-throw the error to be handled by the caller
    }
  }, [setUserInfo]);

  const logout = useCallback(() => {
    localStorage.removeItem("taskflow_token");
    localStorage.removeItem("taskflow_user");
    setUser(null);
    
    // Clear all queries from the cache
    queryClient.clear();
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }, [toast]);

  const checkAuthStatus = useCallback(() => {
    const token = getToken();
    const userData = getUserInfo();
    
    if (token && userData) {
      setUser(userData);
      return true;
    }
    
    return false;
  }, [getToken, getUserInfo]);

  return {
    user,
    isAuthenticated,
    login,
    signup,
    logout,
    getUserInfo,
    checkAuthStatus
  };
};
