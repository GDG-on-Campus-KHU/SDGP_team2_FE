import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Loader } from 'lucide-react';

const API_BASE_URL = 'http://35.216.4.12:8080';

const GoogleOAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processOAuthCode = async () => {
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        setError('인증 코드를 찾을 수 없습니다.');
        return;
      }
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/login/google`, {
          authorizationCode: code
        });
        
        if (response.data && response.data.data) {
          const userData = response.data.data;
          
          localStorage.setItem('accessToken', userData.accessToken);
          localStorage.setItem('refreshToken', userData.refreshToken);
          
          login({
            id: userData.userId.toString(),
            name: userData.username,
            email: '', 
            userType: userData.role === 'USER' ? 'user' : 'cafe',
            avatar: userData.profileImage || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
          });
          
          toast({
            title: "구글 로그인 성공",
            description: "구글 계정으로 로그인되었습니다.",
            duration: 3000,
          });
          

          if (userData.role === 'USER') {
            navigate('/');
          } else {
            navigate('/cafe/dashboard');
          }
        }
      } catch (err: any) {
        console.error('구글 로그인 오류:', err);
        
        let errorMessage = '구글 로그인 처리 중 오류가 발생했습니다.';
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }
        
        setError(errorMessage);
        
        toast({
          title: "로그인 실패",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      }
    };
    
    processOAuthCode();
  }, [location, login, navigate, toast]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-red-500 text-xl font-bold mb-4">오류 발생</div>
        <p className="text-gray-600 mb-6">{error}</p>
        <button 
          className="px-4 py-2 bg-coffee text-white rounded hover:bg-coffee-dark transition-colors"
          onClick={() => navigate('/login')}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader className="w-10 h-10 text-coffee animate-spin mb-4" />
      <p className="text-gray-600">구글 로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default GoogleOAuthCallback;