import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = 'http://35.216.4.12:8080';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}/api/auth/google/login`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "로그인 실패",
        description: "사용자 이름과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      });
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        
        login({
          id: userData.userId,
          name: userData.username,
          email: '', 
          userType: userData.role === 'USER' ? 'user' : 'cafe',
          avatar: userData.profileImage
        });
        
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        
        toast({
          title: "로그인 성공",
          description: `${userData.role === 'USER' ? '일반 사용자' : '카페 운영자'}로 로그인되었습니다.`,
          duration: 3000,
        });
        
        if (userData.role === 'USER') {
          navigate('/');
        } else {
          navigate('/cafe/dashboard');
        }
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      const errorMessage = error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      
      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-coffee-light bg-opacity-30">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-coffee-dark">로그인</CardTitle>
            <CardDescription>
              계정 정보를 입력하여 로그인하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 일반 로그인 폼 */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input 
                  id="username" 
                  placeholder="사용자 이름을 입력하세요" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="비밀번호를 입력하세요" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-coffee hover:bg-coffee-dark"
                disabled={isLoading}
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </Button>
            </form>
            
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400">또는</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
            
            <Button 
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              onClick={handleGoogleLogin}
            >
              구글로 시작하기
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              아직 계정이 없으신가요?{' '}
              <Link to="/register" className="text-coffee hover:underline">
                회원가입
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;