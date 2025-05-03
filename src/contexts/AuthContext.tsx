import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

export type UserType = 'user' | 'cafe' | null;

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// 인증 관련 상수
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user;
  const userType = user?.userType || null;

  // API 요청 인터셉터 설정
  useEffect(() => {
    // 요청 인터셉터
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        if (accessToken) {
          config.headers['Authorization'] = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 응답 인터셉터
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // 401 에러이고, 토큰 만료이고, 재시도하지 않은 요청인 경우
        if (error.response.status === 401 && 
            error.response.data.code === 'AUTH404' && 
            !originalRequest._retry) {
          
          originalRequest._retry = true;
          
          try {
            // 토큰 갱신 시도
            const refreshed = await refreshToken();
            
            if (refreshed) {
              // 토큰 갱신 성공 시 원래 요청 재시도
              const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
              originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
              return axios(originalRequest);
            }
          } catch (refreshError) {
            // 토큰 갱신 실패 시 로그아웃 처리
            logout();
            return Promise.reject(refreshError);
          }
        }
        
        return Promise.reject(error);
      }
    );

    // 클린업 함수에서 인터셉터 제거
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // 처음 로딩 시 토큰 유효성 확인
  useEffect(() => {
    const verifyAuth = async () => {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      
      if (!accessToken || !refreshToken) {
        setIsLoading(false);
        return;
      }
      
      // TODO: 실제 환경에서는 토큰 유효성을 서버에 확인하는 API 호출 추가
      // 여기서는 로컬 스토리지에 있는 사용자 정보를 신뢰
      
      setIsLoading(false);
    };
    
    verifyAuth();
  }, []);

  // 로그인 함수
  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    
    toast({
      title: "로그인 성공",
      description: `${userData.userType === 'user' ? '일반 사용자' : '카페 운영자'}로 로그인되었습니다.`,
      duration: 3000,
    });
    
    // 사용자 유형에 따라 다른 페이지로 리다이렉트
    if (userData.userType === 'user') {
      navigate('/'); // 일반 사용자는 메인 페이지로
    } else {
      navigate('/cafe/dashboard'); // 카페 운영자는 대시보드로
    }
  };

  // 로그아웃 함수
  const logout = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    
    toast({
      title: "로그아웃 완료",
      description: "정상적으로 로그아웃되었습니다.",
      duration: 2000,
    });
    
    navigate('/');
  };

  // 토큰 갱신 함수
  const refreshToken = async (): Promise<boolean> => {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await axios.post('/api/auth/refresh', {
        refreshToken
      });
      
      if (response.data && response.data.data) {
        // 새로운 액세스 토큰 저장
        const newAccessToken = response.data.data;
        localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('토큰 갱신 오류:', error);
      return false;
    }
  };

  // 사용자 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem(USER_KEY);
      setUser(savedUser ? JSON.parse(savedUser) : null);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value = {
    user,
    isAuthenticated,
    userType,
    login,
    logout,
    isLoading,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};