
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [userType, setUserType] = useState<'user' | 'cafe'>('user');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const { login } = useAuth();

  const handleKakaoLogin = () => {
    console.log('Kakao login clicked');
    // 실제 구현에서는 카카오 SDK를 연동하여 OAuth 로그인 처리
    setIsFirstLogin(true);
  };

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
    // 실제 구현에서는 Google OAuth 클라이언트를 연동
    setIsFirstLogin(true);
  };

  const completeSignup = () => {
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
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-coffee-light bg-opacity-30">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-coffee-dark">로그인</CardTitle>
            <CardDescription>
              소셜 로그인을 통해 간편하게 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isFirstLogin ? (
              <>
                <Button 
                  className="w-full bg-yellow-400 hover:bg-yellow-500 font-semibold"
                  onClick={handleKakaoLogin}
                >
                  카카오로 시작하기
                </Button>
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
