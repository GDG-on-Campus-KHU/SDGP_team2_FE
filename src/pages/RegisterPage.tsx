import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import axios from 'axios';

const API_BASE_URL = 'http://35.216.4.12:8080';

const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('USER'); 
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    
    if (!username.trim()) {
      newErrors.username = '사용자 이름을 입력해주세요.';
      valid = false;
    }
    
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요.';
      valid = false;
    }
    
    if (!password) {
      newErrors.password = '비밀번호를 입력해주세요.';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
      valid = false;
    }
    
    if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
      valid = false;
    }
    
    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "약관 동의 필요",
        description: "서비스 이용을 위해 모든 약관에 동의해주세요.",
        variant: "destructive"
      });
      valid = false;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    const registerData = {
      username: username,
      password: password,
      email: email,
      role: userType,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    };
    
    console.log('회원가입 요청 데이터:', registerData);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/register`, registerData);
      
      console.log('회원가입 응답:', response);
      
      if (response.status === 201 || response.status === 200) {
        toast({
          title: "회원가입 성공",
          description: "회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.",
          duration: 3000,
        });
        
        navigate('/login');
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error);
      
      if (error.response) {
        console.error('응답 오류:', error.response.data);
        console.error('응답 상태:', error.response.status);
        console.error('응답 헤더:', error.response.headers);
        
        const errorMessage = error.response.data?.message || '회원가입 중 오류가 발생했습니다.';
        toast({
          title: "회원가입 실패",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      } else if (error.request) {
        console.error('요청 오류 (응답 없음):', error.request);
        toast({
          title: "회원가입 실패",
          description: "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.",
          variant: "destructive",
          duration: 3000,
        });
      } else {
        console.error('설정 오류:', error.message);
        toast({
          title: "회원가입 실패",
          description: "요청 설정 중 오류가 발생했습니다. 다시 시도해주세요.",
          variant: "destructive",
          duration: 3000,
        });
      }
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
            <CardTitle className="text-2xl font-bold text-coffee-dark">회원가입</CardTitle>
            <CardDescription>
              에코빈 서비스 이용을 위한 계정을 생성해주세요
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">사용자 이름</Label>
                <Input 
                  id="username" 
                  placeholder="사용자 이름을 입력하세요" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                {errors.username && <p className="text-xs text-red-500">{errors.username}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="이메일을 입력하세요" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="비밀번호를 입력하세요" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="비밀번호를 다시 입력하세요" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="userType">사용자 유형</Label>
                <Select 
                  value={userType} 
                  onValueChange={setUserType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="사용자 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">일반 사용자</SelectItem>
                    <SelectItem value="CAFE">카페 운영자</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
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
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                className="w-full bg-coffee hover:bg-coffee-dark" 
                disabled={isLoading}
              >
                {isLoading ? '처리 중...' : '가입하기'}
              </Button>
            </CardFooter>
          </form>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-coffee hover:underline">
                로그인
              </Link>
            </p>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;