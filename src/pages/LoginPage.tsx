// src/pages/LoginPage.tsx (Modified with i18n)
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
import apiClient from "@/api/apiClient";
import { useTranslation } from "react-i18next";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoogleLogin = async () => {
    try {
      console.log("[디버깅] Google 로그인 시도 시작");

      // 리다이렉트 URL을 명시적으로 지정 (우리 앱의 콜백 경로로)
      const redirectUri = `${window.location.origin}/oauth/google/callback`;

      // URL 파라미터에 리다이렉트 URI 추가
      const authUrl = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/auth/login/google?redirect_uri=${encodeURIComponent(redirectUri)}`;

      window.location.href = authUrl;
    } catch (error: any) {
      toast({
        title: t("auth.login_failure"),
        description: t("auth.login_failure"),
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // 입력값 검증
    if (!username.trim() || !password) {
      toast({
        title: t("auth.login_failure"),
        description: "사용자 이름과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });

      return;
    }

    setIsLoading(true);
    try {
      // 요청 시작 전 타임스탬프
      const startTime = new Date().getTime();

      // apiClient 사용
      const response = await apiClient.post("/api/auth/login", {
        username: username.trim(),
        password: password,
      });

      // 요청 완료 후 타임스탬프
      const endTime = new Date().getTime();

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
          title: t("auth.login_success"),
          description: `${
            userData.role === "USER"
              ? t("auth.regular_user")
              : t("auth.cafe_owner")
          } ${t("auth.login_success")}`,
          duration: 3000,
        });

        // 사용자 유형에 따른 리디렉션
        if (userData.role === "USER") {
          navigate("/");
        } else {
          navigate("/cafe/dashboard");
        }
      }
    } catch (error: any) {
      let errorMessage = t("auth.login_failure");
      let errorDetail = "";

      if (error.response) {
        // 서버가 응답을 반환한 경우
        const statusCode = error.response.status;

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

        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
      } else {
        // 요청 설정 중 오류가 발생한 경우

        errorDetail = `오류 메시지: ${error.message}`;
      }

      toast({
        title: t("auth.login_failure"),
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
            <CardTitle className="text-2xl font-bold text-coffee-dark">
              {t("common.login")}
            </CardTitle>
            <CardDescription>{t("auth.enter_username")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">{t("auth.username")}</Label>
                <Input
                  id="username"
                  placeholder={t("auth.enter_username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.enter_password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-coffee hover:bg-coffee-dark"
                disabled={isLoading}
              >
                {isLoading ? t("common.loading") : t("common.login")}
              </Button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400">
                {t("common.or")}
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <Button
              className="w-full bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
              onClick={handleGoogleLogin}
            >
              {t("auth.start_with_google")}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              {t("auth.no_account")}{" "}
              <Link to="/register" className="text-coffee hover:underline">
                {t("common.register")}
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
