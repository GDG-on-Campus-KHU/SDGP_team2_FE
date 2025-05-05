import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Loader } from 'lucide-react';

const GoogleOAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCode = async () => {
      console.log('\n[디버깅] ===== Google OAuth 콜백 처리 시작 =====');
      console.log('[디버깅] 시간:', new Date().toISOString());
      
      // URL에서 인증 코드 추출
      const urlParams = new URLSearchParams(location.search);
      const code = urlParams.get('code');
      
      if (!code) {
        setError('인증 코드를 찾을 수 없습니다. 다시 로그인해주세요.');
        setIsProcessing(false);
        console.error('[디버깅] 인증 코드가 URL에 없음');
        return;
      }
      
      console.log('[디버깅] Google 인증 코드 획득:', code.substring(0, 10) + '...');
      
      try {
        console.log('[디버깅] Google OAuth 백엔드 콜백 요청 시작...');
        
        // 백엔드 콜백 엔드포인트로 요청 (GET 방식으로 변경)
        const response = await axios.get(`/api/auth/google/callback?code=${code}`);
        
        console.log('[디버깅] Google OAuth 백엔드 콜백 응답 성공:', {
          status: response.status,
          statusText: response.statusText,
          // 토큰 정보는 보안을 위해 마스킹
          data: response.data ? { 
            ...response.data,
            data: response.data.data ? {
              ...response.data.data,
              accessToken: '****',
              refreshToken: '****'
            } : null
          } : null
        });
        
        if (response.data && response.data.data) {
          const userData = response.data.data;
          
          // 토큰 저장
          localStorage.setItem('accessToken', userData.accessToken);
          localStorage.setItem('refreshToken', userData.refreshToken);
          
          // 사용자 정보 설정
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
          
          // 사용자 유형에 따른 리디렉션
          if (userData.role === 'USER') {
            console.log('[디버깅] 일반 사용자로 로그인 성공, 메인 페이지로 이동');
            navigate('/');
          } else {
            console.log('[디버깅] 카페 운영자로 로그인 성공, 대시보드로 이동');
            navigate('/cafe/dashboard');
          }
        }
      } catch (err: any) {
        console.error('\n[디버깅] ===== Google OAuth 백엔드 콜백 요청 실패 =====');
        console.error('[디버깅] 시간:', new Date().toISOString());
        
        let errorMessage = '구글 로그인 처리 중 오류가 발생했습니다.';
        let errorDetail = '';
        
        if (err.response) {
          const statusCode = err.response.status;
          
          console.error('[디버깅] 응답 상태 코드:', statusCode);
          console.error('[디버깅] 응답 헤더:', err.response.headers);
          console.error('[디버깅] 응답 데이터:', err.response.data);
          
          errorDetail = `상태 코드: ${statusCode}`;
          
          if (err.response.data?.message) {
            errorMessage = err.response.data.message;
            errorDetail += `, 메시지: ${errorMessage}`;
          }
        } else if (err.request) {
          console.error('[디버깅] 요청 정보:', err.request);
          console.error('[디버깅] 요청은 전송되었으나 응답이 없음 (네트워크 문제 또는 서버 다운)');
          
          errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
          errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
        } else {
          console.error('[디버깅] 오류 메시지:', err.message);
          errorDetail = `오류 메시지: ${err.message}`;
        }
        
        setError(errorMessage);
        
        console.error('\n[디버깅] ========== Google 로그인 실패 요약 ==========');
        console.error('[디버깅] 시간:', new Date().toISOString());
        console.error('[디버깅] 오류 메시지:', errorMessage);
        console.error('[디버깅] 오류 상세:', errorDetail);
        console.error('[디버깅] =========================================\n');
        
        toast({
          title: "로그인 실패",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsProcessing(false);
        console.log('[디버깅] OAuth 처리 완료, 로딩 상태 해제');
        console.log('[디버깅] ===== Google OAuth 콜백 처리 종료 =====\n');
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
      <p className="text-gray-600 mb-2">구글 로그인 처리 중입니다. 잠시만 기다려주세요...</p>
      {isProcessing && <p className="text-xs text-gray-400">서버 응답을 기다리는 중입니다.</p>}
    </div>
  );
};

export default GoogleOAuthCallback;