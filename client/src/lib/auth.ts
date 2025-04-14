import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { apiRequest } from "./queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  balance: number;
  phoneNumber: string;
  bankAccount?: string;
  bankName?: string;
  isActive: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: Partial<User>) => void;
}

interface RegisterData {
  username: string;
  password: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  bankAccount?: string;
  bankName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      fetchUserData(storedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUserData = async (authToken: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("authToken");
        setToken(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast({
        title: "Đã xảy ra lỗi",
        description: "Không thể tải thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await res.json();

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);

      toast({
        title: "Đăng nhập thành công",
        description: `Xin chào, ${data.user.fullName}`,
      });
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "Đăng nhập thất bại";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();

      localStorage.setItem("authToken", data.token);
      setToken(data.token);
      setUser(data.user);

      toast({
        title: "Đăng ký thành công",
        description: "Tài khoản của bạn đã được tạo thành công",
      });
    } catch (error) {
      console.error("Register error:", error);
      let errorMessage = "Đăng ký thất bại";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast({
        title: "Đăng ký thất bại",
        description: errorMessage,
        variant: "destructive",
      });

      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);

    toast({
      title: "Đã đăng xuất",
      description: "Bạn đã đăng xuất khỏi hệ thống",
    });
  };

  const updateUserData = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const isAdmin = user?.role === "admin";

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    updateUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}