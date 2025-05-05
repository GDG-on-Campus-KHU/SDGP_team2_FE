import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import apiClient from "@/api/apiClient";

export type UserType = "user" | "cafe" | null;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  userType: UserType;
  avatar?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  userType: UserType;
  login: (userData: AuthUser) => void;
  logout: () => void;
  isLoading: boolean;
  refreshToken: () => Promise<boolean>;
  hasCafeRegistered: boolean;
  checkCafeRegistration: () => Promise<boolean>;
  setCafeRegistered: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Auth constants
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const CAFE_REGISTERED_KEY = "hasCafeRegistered";

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // 카페 등록 여부 저장
  const [hasCafeRegistered, setHasCafeRegistered] = useState<boolean>(() => {
    const saved = localStorage.getItem(CAFE_REGISTERED_KEY);
    return saved === "true";
  });

  // 카페 저장
  const setCafeRegistered = (value: boolean) => {
    setHasCafeRegistered(value);
    localStorage.setItem(CAFE_REGISTERED_KEY, value.toString());
  };

  const isAuthenticated = !!user;
  const userType = user?.userType || null;

  useEffect(() => {
    const verifyAuth = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(false);

        // 카페 유저인 경우 등록 상태 확인
        if (user && user.userType === "cafe") {
          checkCafeRegistration();
        }
      } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setUser(null);
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));

    // Reset cafe registration status on login
    if (userData.userType === "cafe") {
      // We'll set this to false initially and then check with the API
      setCafeRegistered(false);

      // Check if the cafe is already registered
      checkCafeRegistration();
    }

    toast({
      title: "로그인 성공",
      description: `${
        userData.userType === "user" ? "일반 사용자" : "카페 운영자"
      }로 로그인되었습니다.`,
      duration: 3000,
    });

    if (userData.userType === "user") {
      navigate("/");
    } else {
      // For cafe users, we'll let the route handling redirect them
      navigate("/cafe/dashboard");
    }
  };

  // 카페 등록 상태 확인 함수 - /api/cafes/me/exists API 사용
  const checkCafeRegistration = async (): Promise<boolean> => {
    try {
      // 새로운 API 엔드포인트 사용
      const response = await apiClient.get("/api/cafes/me/exists");

      // response.data.data 값이 true/false 인지 확인
      const isRegistered = response.data.data === true;
      setCafeRegistered(isRegistered);
      return isRegistered;
    } catch (error) {
      console.error("Error checking cafe registration:", error);
      setCafeRegistered(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(CAFE_REGISTERED_KEY);
    setHasCafeRegistered(false);

    toast({
      title: "로그아웃 완료",
      description: "정상적으로 로그아웃되었습니다.",
      duration: 2000,
    });

    navigate("/");
  };

  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await apiClient.post("/api/auth/refresh", {
        refreshToken,
      });

      if (response.data && response.data.data) {
        const newAccessToken = response.data.data;
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      return false;
    }
  };

  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem(USER_KEY);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  useEffect(() => {
    // If user is a cafe, check registration status on component mount
    if (user && user.userType === "cafe") {
      checkCafeRegistration();
    }
  }, [user]);

  const value = {
    user,
    isAuthenticated,
    userType,
    login,
    logout,
    isLoading,
    refreshToken,
    hasCafeRegistered,
    checkCafeRegistration,
    setCafeRegistered,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
