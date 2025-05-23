import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "lucide-react";
import apiClient, { processGoogleAuthCode } from "@/api/apiClient";

// API 기본 URL 정의

const GoogleOAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processOAuthCallback = async () => {
      console.log("\n[디버깅] ===== Google OAuth 콜백 처리 시작 =====");
      console.log("[디버깅] 시간:", new Date().toISOString());
      console.log("[디버깅] 현재 URL 경로:", location.pathname);
      console.log("[디버깅] 쿼리 파라미터:", location.search);

      // URL에서 토큰 정보 추출
      const urlParams = new URLSearchParams(location.search);
      const accessToken = urlParams.get("accessToken");
      const refreshToken = urlParams.get("refreshToken");
      const username = urlParams.get("username");
      const code = urlParams.get("code"); // 구글에서 반환하는 인증 코드

      // 인증 코드가 있지만 토큰이 없는 경우 - 백엔드에 토큰 교환 요청 필요
      if (code && (!accessToken || !refreshToken)) {
        console.log(
          "[디버깅] 인증 코드 감지, 토큰 교환 시도",
          code.substring(0, 10) + "..."
        );

        try {
          // 백엔드에 코드 전송하여 토큰 받기
          const response = await processGoogleAuthCode(code);

          if (response.data && response.data.data) {
            const tokenData = response.data.data;

            // 토큰 저장
            localStorage.setItem("accessToken", tokenData.accessToken);
            localStorage.setItem("refreshToken", tokenData.refreshToken);

            // 사용자 정보로 로그인 처리
            login({
              id: tokenData.userId || "google-user",
              name: tokenData.username || "구글 사용자",
              email: tokenData.email || "",
              userType: tokenData.role === "CAFE" ? "cafe" : "user",
              avatar:
                tokenData.profileImage ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${tokenData.username}`,
            });

            toast({
              title: "구글 로그인 성공",
              description: "구글 계정으로 로그인되었습니다.",
              duration: 3000,
            });

            if (tokenData.role === "CAFE") {
              navigate("/cafe/dashboard");
            } else {
              navigate("/");
            }
            return;
          } else {
            throw new Error("토큰 데이터가 올바르지 않습니다.");
          }
        } catch (error: any) {
          console.error("[디버깅] 토큰 교환 실패:", error);
          setError(`구글 인증 처리 중 오류: ${error.message}`);
          setIsProcessing(false);
          return;
        }
      }

      if (!accessToken || !refreshToken) {
        setError("인증 정보를 찾을 수 없습니다. 다시 로그인해주세요.");
        setIsProcessing(false);
        console.error("[디버깅] 인증 토큰이 URL에 없음");
        return;
      }

      console.log("[디버깅] Google OAuth 토큰 정보 획득 완료");

      try {
        // 토큰 저장
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // 사용자 정보 결정 - 실제 역할(role) 정보가 URL에 포함되어 있지 않으므로 기본값 사용
        const userType = "user"; // 기본값으로 일반 사용자 설정

        // 사용자 정보 설정 및 로그인 처리
        login({
          id: "google-user", // 임시 ID, 백엔드에서 실제 사용자 ID를 전달해야 함
          name: username || "Google 사용자",
          email: "",
          userType: userType as "user" | "cafe",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
        });

        toast({
          title: "구글 로그인 성공",
          description: "구글 계정으로 로그인되었습니다.",
          duration: 3000,
        });

        // 사용자 유형에 따른 리디렉션
        if (userType === "user") {
          console.log("[디버깅] 일반 사용자로 로그인 성공, 메인 페이지로 이동");
          navigate("/");
        } else {
          console.log("[디버깅] 카페 운영자로 로그인 성공, 대시보드로 이동");
          navigate("/cafe/dashboard");
        }
      } catch (err: any) {
        console.error("\n[디버깅] ===== Google OAuth 처리 중 오류 발생 =====");
        console.error("[디버깅] 시간:", new Date().toISOString());

        const errorMessage = "구글 로그인 처리 중 오류가 발생했습니다.";
        let errorDetail = "";

        if (err.message) {
          errorDetail = `오류 메시지: ${err.message}`;
        }

        setError(errorMessage);

        console.error(
          "\n[디버깅] ========== Google 로그인 실패 요약 =========="
        );
        console.error("[디버깅] 시간:", new Date().toISOString());
        console.error("[디버깅] 오류 메시지:", errorMessage);
        console.error("[디버깅] 오류 상세:", errorDetail);
        console.error("[디버깅] =========================================\n");

        toast({
          title: "로그인 실패",
          description: errorMessage,
          variant: "destructive",
          duration: 3000,
        });
      } finally {
        setIsProcessing(false);
        console.log("[디버깅] OAuth 처리 완료, 로딩 상태 해제");
        console.log("[디버깅] ===== Google OAuth 콜백 처리 종료 =====\n");
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
          onClick={() => navigate("/login")}
        >
          로그인 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Loader className="w-10 h-10 text-coffee animate-spin mb-4" />
      <p className="text-gray-600 mb-2">
        구글 로그인 처리 중입니다. 잠시만 기다려주세요...
      </p>
      {isProcessing && (
        <p className="text-xs text-gray-400">서버 응답을 기다리는 중입니다.</p>
      )}
    </div>
  );
};

export default GoogleOAuthCallback;
