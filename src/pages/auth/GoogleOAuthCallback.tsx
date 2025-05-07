import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader } from 'lucide-react';

const GoogleOAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log('\n[디버깅] ===== Google OAuth 콜백 처리 시작 =====');
      console.log('[디버깅] 시간:', new Date().toISOString());
      
      // URL에서 토큰 정보 추출
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get('accessToken');
      const refreshToken = urlParams.get('refreshToken');
      const username = urlParams.get('username');
      
      if (!accessToken || !refreshToken) {
        setError('인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
        setIsProcessing(false);
        console.error('[디버깅] 인증 토큰이 URL에 없음');
        return;
      }
      
      console.log('[디버깅] Google OAuth 토큰 정보 획득 완료');
      
      try {
        // 토큰 저장
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        
        // 사용자 정보 결정 - 실제 역할(role) 정보가 URL에 포함되어 있지 않으므로 기본값 사용
        // 실제 환경에서는 백엔드에서 역할 정보도 함께 전달하거나, 토큰으로 사용자 정보를 조회하는 추가 API 호출 필요
        const userType = 'user'; // 기본값으로 일반 사용자 설정
        
        // 사용자 정보 설정 및 로그인 처리
        login({
          id: "google-user", // 임시 ID, 백엔드에서 실제 사용자 ID를 전달해야 함
          name: username || "Google 사용자",
          email: '', 
          userType: userType as 'user' | 'cafe',
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
        });
        
        toast({
          title: "구글 로그인 성공",
          description: "구글 계정으로 로그인되었습니다.",
          duration: 3000,
        });
        
        // 사용자 유형에 따른 리디렉션
        if (userType === 'user') {
          console.log('[디버깅] 일반 사용자로 로그인 성공, 메인 페이지로 이동');
          navigate('/');
        } else {
          console.log('[디버깅] 카페 운영자로 로그인 성공, 대시보드로 이동');
          navigate('/cafe/dashboard');
        }
      } catch (err: any) {
        console.error('\n[디버깅] ===== Google OAuth 처리 중 오류 발생 =====');
        console.error('[디버깅] 시간:', new Date().toISOString());
        
        let errorMessage = '구글 로그인 처리 중 오류가 발생했습니다.';
        let errorDetail = '';
        
        if (err.message) {
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
    
    processOAuthCallback();
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