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

const LoginPage = () => {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userType, setUserType] = useState<'user' | 'cafe'>('user');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Google OAuth 로그인 관련 설정
  const GOOGLE_CLIENT_ID = 'your-google-client-id'; // 실제 구현 시 환경변수로 설정
  const GOOGLE_REDIRECT_URI = window.location.origin + '/oauth/google/callback';
  
  // Google 로그인
  const handleGoogleLogin = () => {
    // Google OAuth URL 생성
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${GOOGLE_REDIRECT_URI}&response_type=code&scope=email profile`;
    
    // 새 창에서 Google 로그인 페이지 열기
    window.location.href = googleAuthUrl;
  };

  // 일반 로그인 처리
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
      const response = await axios.post('/api/auth/login', {
        username,
        password
      });
      
      if (response.data && response.data.data) {
        const userData = response.data.data;
        
        // AuthContext의 로그인 함수 호출
        login({
          id: userData.userId,
          name: userData.username,
          email: '',  // 백엔드가 이메일을 반환하지 않아 빈 문자열로 설정
          userType: userData.role === 'USER' ? 'user' : 'cafe',
          avatar: userData.profileImage
        });
        
        // JWT 토큰 로컬 스토리지에 저장
        localStorage.setItem('accessToken', userData.accessToken);
        localStorage.setItem('refreshToken', userData.refreshToken);
        
        toast({
          title: "로그인 성공",
          description: `${userData.role === 'USER' ? '일반 사용자' : '카페 운영자'}로 로그인되었습니다.`,
          duration: 3000,
        });
        
        // 사용자 유형에 따라 다른 페이지로 리다이렉트
        if (userData.role === 'USER') {
          navigate('/'); // 일반 사용자는 메인 페이지로
        } else {
          navigate('/cafe/dashboard'); // 카페 운영자는 대시보드로
        }
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      
      if (error.response && error.response.data && error.response.data.message) {
        toast({
          title: "로그인 실패",
          description: error.response.data.message,
          variant: "destructive",
          duration: 3000,
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "로그인 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 소셜 로그인 완료 처리
  const completeSignup = () => {
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "약관 동의 필요",
        description: "서비스 이용을 위해 모든 약관에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }
    
    // 모의 사용자 데이터 생성 (실제로는 OAuth 응답에서 받음)
    const mockUser = {
      id: Math.random().toString(36).substring(2, 9),
      name: userType === 'user' ? '김커피' : '스타벅스',
      email: `${userType === 'user' ? 'user' : 'cafe'}@example.com`,
      userType: userType,
      avatar: userType === 'user' 
        ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' 
        : 'https://api.dicebear.com/7.x/avataaars/svg?seed=cafe'
    };
    
    // 로그인 처리 (AuthContext의 login 메서드 호출)
    login(mockUser);
    
    // 모의 JWT 토큰 저장 (실제로는 OAuth 응답에서 받음)
    localStorage.setItem('accessToken', 'mock-access-token');
    localStorage.setItem('refreshToken', 'mock-refresh-token');
    
    toast({
      title: "로그인 성공",
      description: `${userType === 'user' ? '일반 사용자' : '카페 운영자'}로 로그인되었습니다.`,
      duration: 3000,
    });
    
    // 사용자 유형에 따라 다른 페이지로 리다이렉트
    if (userType === 'user') {
      navigate('/'); // 일반 사용자는 메인 페이지로
    } else {
      navigate('/cafe/dashboard'); // 카페 운영자는 대시보드로
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
              {!isFirstLogin 
                ? '계정 정보를 입력하여 로그인하세요' 
                : '소셜 로그인을 위한 추가 정보를 입력해주세요'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFirstLogin ? (
              <>
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
              </>
            ) : (
              <div className="space-y-6 py-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">사용자 유형 선택</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <Button 
                      variant={userType === 'user' ? 'default' : 'outline'} 
                      className={`w-full ${userType === 'user' ? 'bg-coffee text-white' : 'border-coffee text-coffee-dark'}`}
                      onClick={() => setUserType('user')}
                    >
                      일반 사용자
                    </Button>
                    <Button 
                      variant={userType === 'cafe' ? 'default' : 'outline'} 
                      className={`w-full ${userType === 'cafe' ? 'bg-coffee text-white' : 'border-coffee text-coffee-dark'}`}
                      onClick={() => setUserType('cafe')}
                    >
                      카페 운영자
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-lg font-medium">약관 동의</h3>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="terms" 
                      checked={termsAccepted} 
                      onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
                    />
                    <Label htmlFor="terms" className="text-sm">
                      <span>이용약관에 동의합니다.</span>{' '}
                      <Link to="/terms" className="text-coffee hover:underline" target="_blank">보기</Link>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="privacy" 
                      checked={privacyAccepted} 
                      onCheckedChange={(checked) => setPrivacyAccepted(checked as boolean)} 
                    />
                    <Label htmlFor="privacy" className="text-sm">
                      <span>개인정보 처리방침에 동의합니다.</span>{' '}
                      <Link to="/privacy" className="text-coffee hover:underline" target="_blank">보기</Link>
                    </Label>
                  </div>
                </div>
                
                <Button 
                  className="w-full bg-coffee hover:bg-coffee-dark transition-colors"
                  disabled={!termsAccepted || !privacyAccepted}
                  onClick={completeSignup}
                >
                  시작하기
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {isFirstLogin ? (
                <Button variant="link" className="p-0 text-coffee" onClick={() => setIsFirstLogin(false)}>
                  뒤로 가기
                </Button>
              ) : (
                <>
                  아직 계정이 없으신가요?{' '}
                  <Link to="/register" className="text-coffee hover:underline">
                    회원가입
                  </Link>
                </>
              )}
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;