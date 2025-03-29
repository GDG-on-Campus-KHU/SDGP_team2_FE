
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<AuthUser | null>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const isAuthenticated = !!user;
  const userType = user?.userType || null;

  // 로그인 함수
  const login = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
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
    localStorage.removeItem('user');
    toast({
      title: "로그아웃 완료",
      description: "정상적으로 로그아웃되었습니다.",
      duration: 2000,
    });
    navigate('/');
  };

  // 사용자 상태 로딩 완료
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // 사용자 상태 변경 감지
  useEffect(() => {
    const handleStorageChange = () => {
      const savedUser = localStorage.getItem('user');
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
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
