import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// 프록시 사용을 위해 기본 URL 제거
// const API_BASE_URL = 'http://35.216.4.12:8080';

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      console.log("[디버깅] Google 로그인 시도 시작");
      // 상대 경로 사용 (프록시 적용)
      const response = await axios.get("/api/auth/google/callback");

      // 백엔드가 리디렉션 URL을 반환하는 경우
      if (response.data) {
        console.log("[디버깅] Google 로그인 URL 획득 성공:", response.data);
        window.location.href = response.data;
      }
    } catch (error: unknown) {
      console.error("[디버깅] Google 로그인 초기화 오류:", error);

      // 백엔드 엔드포인트가 존재하지 않는 경우 대체 방법
      // 실제 프로덕션에서는 이 방법은 피해야 합니다 (클라이언트 ID 노출 위험)
      toast({
        title: "Google 로그인 오류",
        description:
          "Google 로그인을 시작하는 중 오류가 발생했습니다. 일반 로그인을 시도해주세요.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("\n[디버깅] ===== 로그인 시도 시작 =====");
    console.log("[디버깅] 시간:", new Date().toISOString());

    // 입력값 검증
    if (!username.trim() || !password) {
      toast({
        title: "로그인 실패",
        description: "사용자 이름과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      console.warn(
        "[디버깅] 폼 유효성 검사 실패: 사용자 이름 또는 비밀번호 누락"
      );
      return;
    }

    setIsLoading(true);
    console.log("[디버깅] 로딩 상태 설정: true");

    try {
      console.log("[디버깅] 로그인 API 요청 시작...");
      console.log("[디버깅] 요청 URL: /api/auth/login");
      console.log("[디버깅] 요청 메서드: POST");
      console.log("[디버깅] 요청 데이터:", {
        username: username.trim(),
        password: "********",
      });

      // 요청 시작 전 타임스탬프
      const startTime = new Date().getTime();

      // 상대 경로 사용 (프록시 적용)
      const response = await axios.post(
        "http://34.64.59.141:8080/api/auth/login",
        {
          username: username.trim(),
          password: password,
        }
      );

      // 요청 완료 후 타임스탬프
      const endTime = new Date().getTime();
      console.log(`[디버깅] API 응답 시간: ${endTime - startTime}ms`);

      console.log("[디버깅] 로그인 API 응답 성공:", {
        status: response.status,
        statusText: response.statusText,
        // 토큰 정보는 보안을 위해 마스킹
        data: response.data
          ? {
              ...response.data,
              data: response.data.data
                ? {
                    ...response.data.data,
                    accessToken: "****",
                    refreshToken: "****",
                  }
                : null,
            }
          : null,
      });

      if (response.data && response.data.data) {
        const userData = response.data.data;

        // 로그인 정보 저장
        login({
          id: userData.userId.toString(),
          name: userData.username,
          email: "",
          userType: userData.role === "USER" ? "user" : "cafe",
          avatar:
            userData.profileImage ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
        });

        // 토큰 저장
        localStorage.setItem("accessToken", userData.accessToken);
        localStorage.setItem("refreshToken", userData.refreshToken);

        toast({
          title: "로그인 성공",
          description: `${
            userData.role === "USER" ? "일반 사용자" : "카페 운영자"
          }로 로그인되었습니다.`,
          duration: 3000,
        });

        // 사용자 유형에 따른 리디렉션
        if (userData.role === "USER") {
          console.log("[디버깅] 일반 사용자로 로그인 성공, 메인 페이지로 이동");
          navigate("/");
        } else {
          console.log("[디버깅] 카페 운영자로 로그인 성공, 대시보드로 이동");
          navigate("/cafe/dashboard");
        }
      }
    } catch (error: any) {
      console.error("\n[디버깅] ===== 로그인 API 요청 실패 =====");
      console.error("[디버깅] 시간:", new Date().toISOString());

      let errorMessage = "로그인 중 오류가 발생했습니다.";
      let errorDetail = "";

      if (error.response) {
        // 서버가 응답을 반환한 경우
        const statusCode = error.response.status;

        console.error("[디버깅] 응답 상태 코드:", statusCode);
        console.error("[디버깅] 응답 헤더:", error.response.headers);
        console.error("[디버깅] 응답 데이터:", error.response.data);

        errorDetail = `상태 코드: ${statusCode}`;

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
          errorDetail += `, 메시지: ${errorMessage}`;
        } else if (statusCode === 401) {
          errorMessage = "사용자 이름 또는 비밀번호가 올바르지 않습니다.";
          errorDetail += `, 추정 오류: 인증 실패`;
        } else if (statusCode === 404) {
          errorMessage = "사용자를 찾을 수 없습니다.";
          errorDetail += `, 추정 오류: 사용자 없음`;
        } else if (statusCode === 500) {
          errorMessage =
            "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          errorDetail += `, 추정 오류: 서버 내부 오류`;
        }
      } else if (error.request) {
        // 요청은 보냈지만 응답을 받지 못한 경우
        console.error("[디버깅] 요청 정보:", error.request);
        console.error(
          "[디버깅] 요청은 전송되었으나 응답이 없음 (네트워크 문제 또는 서버 다운)"
        );

        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
      } else {
        // 요청 설정 중 오류가 발생한 경우
        console.error("[디버깅] 오류 메시지:", error.message);
        errorDetail = `오류 메시지: ${error.message}`;
      }

      toast({
        title: "로그인 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });

      // 터미널에 명확한 오류 메시지 출력
      console.error("\n[디버깅] ========== 로그인 실패 요약 ==========");
      console.error("[디버깅] 시간:", new Date().toISOString());
      console.error("[디버깅] 오류 메시지:", errorMessage);
      console.error("[디버깅] 오류 상세:", errorDetail);
      console.error("[디버깅] 입력한 사용자 이름:", username);
      console.error("[디버깅] =========================================\n");
    } finally {
      setIsLoading(false);
      console.log("[디버깅] 로딩 상태 설정: false");
      console.log("[디버깅] ===== 로그인 시도 종료 =====\n");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-coffee-light bg-opacity-30">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-coffee-dark">
              로그인
            </CardTitle>
            <CardDescription>계정 정보를 입력하여 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                {isLoading ? "로그인 중..." : "로그인"}
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
              아직 계정이 없으신가요?{" "}
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
