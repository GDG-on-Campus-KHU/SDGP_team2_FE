import React, { useState, useRef } from "react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Upload, Camera, X } from "lucide-react";
import apiClient from "@/api/apiClient";
import { useTranslation } from "react-i18next";

// 프로필 이미지 업로드 컴포넌트
const ProfileImageUpload = ({ username, profileImage, onChange }) => {
  // 기본 아바타 URL (Dicebear API 사용)
  const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${
    username || "user"
  }`;
  const { t } = useTranslation();

  // 상태 관리
  const [avatar, setAvatar] = useState(profileImage || defaultAvatar);
  const [isHovering, setIsHovering] = useState(false);

  // 파일 입력 참조
  const fileInputRef = useRef(null);

  // 파일 선택 핸들러
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert(t("auth.image_size_limit"));
      return;
    }

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      alert(t("auth.image_size_limit"));
      return;
    }

    // 파일을 Base64로 변환
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setAvatar(base64String);
      onChange(base64String);
    };
    reader.readAsDataURL(file);
  };

  // 기본 아바타로 재설정
  const resetToDefaultAvatar = () => {
    setAvatar(defaultAvatar);
    onChange(defaultAvatar);
  };

  // 파일 선택 다이얼로그 열기
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Label
        htmlFor="profile-image"
        className="text-sm font-medium text-center mb-1"
      >
        {t("auth.profile_image")}
      </Label>

      <div
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Avatar className="h-24 w-24 border-2 border-coffee/30 cursor-pointer">
          <AvatarImage src={avatar} alt="profile_image" />
          <AvatarFallback className="bg-coffee-cream text-coffee">
            <User size={32} />
          </AvatarFallback>
        </Avatar>

        {/* 오버레이 컨트롤 */}
        {isHovering && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                onClick={triggerFileInput}
              >
                <Camera size={16} />
              </Button>
              {avatar !== defaultAvatar && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20 rounded-full"
                  onClick={resetToDefaultAvatar}
                >
                  <X size={16} />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        id="profile-image"
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="text-xs flex items-center"
        onClick={triggerFileInput}
      >
        <Upload className="mr-1 h-3.5 w-3.5" />
        {t("auth.upload_image")}
      </Button>

      <p className="text-xs text-muted-foreground">
        {t("auth.image_size_limit")}
      </p>
    </div>
  );
};

// 회원가입 페이지 컴포넌트
const RegisterPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("USER");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    if (!username.trim()) {
      newErrors.username = t("auth.enter_username");
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = t("auth.enter_email");
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "enter valid email";
      valid = false;
    }

    if (!password) {
      newErrors.password = t("auth.enter_password");
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "The password must be at least 6 characters long.";
      valid = false;
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "wrong confirm password";
      valid = false;
    }

    if (!termsAccepted || !privacyAccepted) {
      // toast({
      //   title: "약관 동의 필요",
      //   description: "서비스 이용을 위해 모든 약관에 동의해주세요.",
      //   variant: "destructive",
      // });
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  // 프로필 이미지가 변경될 때 호출되는 핸들러
  const handleProfileImageChange = (imageData) => {
    setProfileImage(imageData);
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // role 값이 'USER' 또는 'CAFE'인지 확인
    const role = userType === "USER" ? "USER" : "CAFE";

    // 프로필 이미지가 설정되지 않은 경우 기본 이미지를 사용
    const finalProfileImage =
      profileImage ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

    const registerData = {
      username: username.trim(),
      password: password,
      email: email.trim(),
      role: role,
      profileImage: finalProfileImage,
    };

    try {
      const startTime = new Date().getTime();

      const response = await apiClient.post("api/auth/register", registerData);

      const endTime = new Date().getTime();

      if (response.status === 201 || response.status === 200) {
        toast({
          title: t("auth.register_success"),
          description:
            "Sign-up completed successfully. Redirecting to the login page.",
          duration: 3000,
        });

        navigate("/login");
      }
    } catch (error) {
      // let errorMessage = "회원가입 중 오류가 발생했습니다.";
      // let errorDetail = "";
      // if (error.response) {
      //   const statusCode = error.response.status;
      //   errorDetail = `상태 코드: ${statusCode}`;
      //   if (error.response.data?.message) {
      //     errorMessage = error.response.data.message;
      //     errorDetail += `, 메시지: ${errorMessage}`;
      //   } else if (statusCode === 409) {
      //     errorMessage = "이미 사용 중인 사용자 이름이나 이메일입니다.";
      //     errorDetail += `, 추정 오류: 중복된 사용자 정보`;
      //   } else if (statusCode === 400) {
      //     errorMessage =
      //       "입력값이 유효하지 않습니다. 입력 내용을 확인해주세요.";
      //     errorDetail += `, 추정 오류: 잘못된 입력값`;
      //   } else if (statusCode === 500) {
      //     errorMessage =
      //       "서버 내부 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      //     errorDetail += `, 추정 오류: 서버 내부 오류`;
      //   }
      // } else if (error.request) {
      //   errorMessage =
      //     "서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.";
      //   errorDetail = "응답 없음, 네트워크 문제 또는 서버 다운";
      // } else {
      //   errorDetail = `오류 메시지: ${error.message}`;
      // }
      // toast({
      //   title: "회원가입 실패",
      //   description: errorMessage,
      //   variant: "destructive",
      //   duration: 3000,
      // });
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
              {t("common.register")}
            </CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              {/* 프로필 이미지 업로드 컴포넌트 */}
              <div className="mb-6 flex justify-center">
                <ProfileImageUpload
                  username={username}
                  profileImage={profileImage}
                  onChange={handleProfileImageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username"> {t("auth.username")}</Label>
                <Input
                  id="username"
                  placeholder={t("auth.enter_username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                {errors.username && (
                  <p className="text-xs text-red-500">{errors.username}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("auth.enter_email")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.enter_password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                {errors.password && (
                  <p className="text-xs text-red-500">{errors.password}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.confirm_password")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("auth.enter_password")}
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
                <Label htmlFor="userType">{t("auth.user_type")}</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="enter user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">
                      {t("auth.regular_user")}
                    </SelectItem>
                    <SelectItem value="CAFE">{t("auth.cafe_owner")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={termsAccepted}
                    onCheckedChange={(checked) =>
                      setTermsAccepted(checked === true)
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    <span>{t("auth.terms_agree")}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={privacyAccepted}
                    onCheckedChange={(checked) =>
                      setPrivacyAccepted(checked === true)
                    }
                  />
                  <Label htmlFor="privacy" className="text-sm">
                    <span>{t("auth.privacy_agree")}</span>
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
                {isLoading ? t("common.loading") : t("common.register")}
              </Button>
            </CardFooter>
          </form>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-sm text-muted-foreground">
              {t("auth.have_account")}
              <Link to="/login" className="text-coffee hover:underline">
                {t("common.login")}
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
