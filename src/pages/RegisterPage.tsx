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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import axios from "axios";

// 프록시 사용을 위해 기본 URL을 제거하고 상대 경로 사용
// const API_BASE_URL = 'http://35.216.4.12:8080';

const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("USER");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    console.log("[디버깅] 폼 유효성 검사 시작...");
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!username.trim()) {
      newErrors.username = "사용자 이름을 입력해주세요.";
      valid = false;
      console.warn("[디버깅] 사용자 이름이 비어 있습니다.");
    }

    if (!email.trim()) {
      newErrors.email = "이메일을 입력해주세요.";
      valid = false;
      console.warn("[디버깅] 이메일이 비어 있습니다.");
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "유효한 이메일 주소를 입력해주세요.";
      valid = false;
      console.warn("[디버깅] 이메일 형식이 올바르지 않습니다:", email);
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요.";
      valid = false;
      console.warn("[디버깅] 비밀번호가 비어 있습니다.");
    } else if (password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다.";
      valid = false;
      console.warn("[디버깅] 비밀번호가 너무 짧습니다:", password.length);
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
      valid = false;
      console.warn("[디버깅] 비밀번호 확인이 일치하지 않습니다.");
    }

    if (!termsAccepted || !privacyAccepted) {
      toast({
        title: "약관 동의 필요",
        description: "서비스 이용을 위해 모든 약관에 동의해주세요.",
        variant: "destructive",
      });
      valid = false;
      console.warn("[디버깅] 약관 동의가 누락되었습니다:", {
        termsAccepted,
        privacyAccepted,
      });
    }

    setErrors(newErrors);
    console.log("[디버깅] 폼 유효성 검사 결과:", { valid, errors: newErrors });
    return valid;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("\n[디버깅] ===== 회원가입 시도 시작 =====");
    console.log("[디버깅] 시간:", new Date().toISOString());

    if (!validateForm()) {
      console.warn("[디버깅] 폼 유효성 검사 실패로 회원가입 중단");
      return;
    }

    setIsLoading(true);
    console.log("[디버깅] 로딩 상태 설정: true");

    // role 값이 'USER' 또는 'CAFE'인지 확인
    const role = userType === "USER" ? "USER" : "CAFE";

    const registerData = {
      username: username.trim(),
      password: password,
      email: email.trim(),
      role: role,
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
    };

    console.log("[디버깅] 회원가입 요청 데이터:", {
      ...registerData,
      password: "********",
    });

    try {
      console.log("[디버깅] 회원가입 API 요청 시작...");
      console.log("[디버깅] 요청 URL: /api/auth/register");
      console.log("[디버깅] 요청 메서드: POST");

      const startTime = new Date().getTime();

      const response = await axios.post(
        "http://34.64.59.141:8080/api/auth/register",
        registerData
      );

      const endTime = new Date().getTime();
      console.log(`[디버깅] API 응답 시간: ${endTime - startTime}ms`);

      console.log("[디버깅] 회원가입 API 응답 성공:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });

      if (response.status === 201 || response.status === 200) {
        toast({
          title: "회원가입 성공",
          description:
            "회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.",
          duration: 3000,
        });

        console.log("[디버깅] 회원가입 성공, 로그인 페이지로 이동");
        navigate("/login");
      }
    } catch (error: any) {
      console.error("\n[디버깅] ===== 회원가입 API 요청 실패 =====");
      console.error("[디버깅] 시간:", new Date().toISOString());

      let errorMessage = "회원가입 중 오류가 발생했습니다.";
      let errorDetail = "";

      if (error.response) {
        const statusCode = error.response.status;

        console.error("[디버깅] 응답 상태 코드:", statusCode);
        console.error("[디버깅] 응답 헤더:", error.response.headers);
        console.error("[디버깅] 응답 데이터:", error.response.data);

        errorDetail = `상태 코드: ${statusCode}`;

        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
          errorDetail += `, 메시지: ${errorMessage}`;
        } else if (statusCode === 409) {
          errorMessage = "이미 사용 중인 사용자 이름이나 이메일입니다.";
          errorDetail += `, 추정 오류: 중복된 사용자 정보`;
        } else if (statusCode === 400) {
          errorMessage =
            "입력값이 유효하지 않습니다. 입력 내용을 확인해주세요.";
          errorDetail += `, 추정 오류: 잘못된 입력값`;
        } else if (statusCode === 500) {
          errorMessage =
            "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
          errorDetail += `, 추정 오류: 서버 내부 오류`;
        }
      } else if (error.request) {
        console.error("[디버깅] 요청 정보:", error.request);
        console.error(
          "[디버깅] 요청은 전송되었으나 응답이 없음 (네트워크 문제 또는 서버 다운)"
        );

        errorMessage =
          "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
        errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
      } else {
        console.error("[디버깅] 오류 메시지:", error.message);
        errorDetail = `오류 메시지: ${error.message}`;
      }

      toast({
        title: "회원가입 실패",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });

      console.error("\n[디버깅] ========== 회원가입 실패 요약 ==========");
      console.error("[디버깅] 시간:", new Date().toISOString());
      console.error("[디버깅] 오류 메시지:", errorMessage);
      console.error("[디버깅] 오류 상세:", errorDetail);
      console.error("[디버깅] 입력한 사용자 이름:", username);
      console.error("[디버깅] 입력한 이메일:", email);
      console.error("[디버깅] =========================================\n");
    } finally {
      setIsLoading(false);
      console.log("[디버깅] 로딩 상태 설정: false");
      console.log("[디버깅] ===== 회원가입 시도 종료 =====\n");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-coffee-light bg-opacity-30">
        <Card className="w-full max-w-md animate-fade-in">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold text-coffee-dark">
              회원가입
            </CardTitle>
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
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username}</p>
                )}
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
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
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
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
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
                {errors.confirmPassword && (
                  <p className="text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">사용자 유형</Label>
                <Select value={userType} onValueChange={setUserType}>
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
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked as boolean)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    <span>이용약관에 동의합니다.</span>{" "}
                    <Link
                      to="/terms"
                      className="text-coffee hover:underline"
                      target="_blank"
                    >
                      보기
                    </Link>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) =>
                      setPrivacyAccepted(checked as boolean)
                    }
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    <span>개인정보 처리방침에 동의합니다.</span>{" "}
                    <Link
                      to="/privacy"
                      className="text-coffee hover:underline"
                      target="_blank"
                    >
                      보기
                    </Link>
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
                {isLoading ? "처리 중..." : "가입하기"}
              </Button>
            </CardFooter>
          </form>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-sm text-muted-foreground">
              이미 계정이 있으신가요?{" "}
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
