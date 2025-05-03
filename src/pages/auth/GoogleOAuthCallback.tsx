import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { Loader } from 'lucide-react';

// 프록시 사용을 위해 기본 URL 제거
// const API_BASE_URL = 'http://35.216.4.12:8080';

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
        console.log('[디버깅] Google 로그인 API 요청 시작...');
        console.log('[디버깅] 요청 URL: /api/auth/login/google');
        console.log('[디버깅] 요청 메서드: POST');
        console.log('[디버깅] 요청 데이터:', { authorizationCode: code.substring(0, 10) + '...' });
        
        // 요청 시작 전 타임스탬프
        const startTime = new Date().getTime();
        
        // 상대 경로 사용 (프록시 적용)
        const response = await axios.post('/api/auth/login/google', {
          authorizationCode: code
        });
        
        // 요청 완료 후 타임스탬프
        const endTime = new Date().getTime();
        console.log(`[디버깅] API 응답 시간: ${endTime - startTime}ms`);
        
        console.log('[디버깅] Google 로그인 API 응답 성공:', {
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
        console.error('\n[디버깅] ===== Google 로그인 API 요청 실패 =====');
        console.error('[디버깅] 시간:', new Date().toISOString());
        
        let errorMessage = '구글 로그인 처리 중 오류가 발생했습니다.';
        let errorDetail = '';
        
        if (err.response) {
          // 서버가 응답을 반환한 경우
          const statusCode = err.response.status;
          
          console.error('[디버깅] 응답 상태 코드:', statusCode);
          console.error('[디버깅] 응답 헤더:', err.response.headers);
          console.error('[디버깅] 응답 데이터:', err.response.data);
          
          errorDetail = `상태 코드: ${statusCode}`;
          
          if (err.response.data?.message) {
            errorMessage = err.response.data.message;
            errorDetail += `, 메시지: ${errorMessage}`;
          } else if (statusCode === 401) {
            errorMessage = "Google 계정 인증에 실패했습니다.";
            errorDetail += `, 추정 오류: 인증 실패`;
          } else if (statusCode === 403) {
            errorMessage = "접근 권한이 없습니다. 백엔드 API 설정을 확인해주세요.";
            errorDetail += `, 추정 오류: 권한 없음`;
          } else if (statusCode === 404) {
            errorMessage = "API 엔드포인트를 찾을 수 없습니다.";
            errorDetail += `, 추정 오류: 엔드포인트 없음`;
          } else if (statusCode === 500) {
            errorMessage = "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
            errorDetail += `, 추정 오류: 서버 내부 오류`;
          }
        } else if (err.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          console.error('[디버깅] 요청 정보:', err.request);
          console.error('[디버깅] 요청은 전송되었으나 응답이 없음 (네트워크 문제 또는 서버 다운)');
          
          errorMessage = "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
          errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
        } else {
          // 요청 설정 중 오류가 발생한 경우
          console.error('[디버깅] 오류 메시지:', err.message);
          errorDetail = `오류 메시지: ${err.message}`;
        }
        
        setError(errorMessage);
        
        // 터미널에 명확한 오류 메시지 출력
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