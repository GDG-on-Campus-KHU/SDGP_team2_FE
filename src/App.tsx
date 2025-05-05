import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage"; // 새 회원가입 페이지 추가
import NotFound from "./pages/NotFound";
import CafeManagementPage from "./pages/CafeManagementPage";
import CafeDashboard from "./pages/cafe/CafeDashboard";
import CafeBeansPage from "./pages/cafe/CafeBeansPage";
import CafeGroundsPage from "./pages/cafe/CafeGroundsPage";
import CafeRequestsPage from "./pages/cafe/CafeRequestsPage";
import CafeSettingsPage from "./pages/cafe/CafeSettingsPage";
import UserMyPage from "./pages/user/UserMyPage";
import AISolutionsPage from "./pages/AISolutionsPage";
import MarketPage from "./pages/MarketPage";
import GoogleOAuthCallback from "./pages/auth/GoogleOAuthCallback"; // 구글 OAuth 콜백 추가
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CafeRegistrationPage from "./pages/cafe/CafeRegistrationPage";
import { useEffect } from "react";

const queryClient = new QueryClient();

// 인증이 필요한 라우트를 보호하는 컴포넌트
const ProtectedRoute = ({
  children,
  requiredType,
}: {
  children: JSX.Element;
  requiredType?: "user" | "cafe";
}) => {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredType && userType !== requiredType) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// 카페 등록 체크
const CafeRegistrationCheck = ({ children }) => {
  const { userType, hasCafeRegistered, checkCafeRegistration } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (userType === "cafe") {
      const checkRegistration = async () => {
        const isRegistered = await checkCafeRegistration();
        if (!isRegistered) {
          navigate("/cafe/register", { replace: true });
        }
      };

      checkRegistration();
    }
  }, [userType, checkCafeRegistration, navigate]);

  return <>{children}</>;
};

const AppRoutes = () => {
  const { isAuthenticated, userType, isLoading, hasCafeRegistered } = useAuth();
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />{" "}
      {/* 새 회원가입 페이지로 변경 */}
      <Route
        path="/oauth/google/callback"
        element={<GoogleOAuthCallback />}
      />{" "}
      {/* 구글 OAuth 콜백 추가 */}
      {/* 카페 등록 페이지 */}
      {/* 카페 등록 페이지 - 카페 유저만 접근 가능 */}
      {/* 카페 등록 페이지 - 카페 유저만 접근 가능 */}
      <Route
        path="/cafe/register"
        element={
          <ProtectedRoute requiredType="cafe">
            <CafeRegistrationPage />
          </ProtectedRoute>
        }
      />
      {/* 카페 관련 모든 페이지에 등록 상태 체크 적용 */}
      <Route
        path="/cafe"
        element={
          <ProtectedRoute requiredType="cafe">
            <CafeRegistrationCheck>
              <CafeManagementPage />
            </CafeRegistrationCheck>
          </ProtectedRoute>
        }
      >
        {/* 루트 경로 리다이렉트 */}
        <Route index element={<Navigate to="/cafe/dashboard" replace />} />
        {/* 하위 라우트들 */}
        <Route path="dashboard" element={<CafeDashboard />} />
        <Route path="beans" element={<CafeBeansPage />} />
        <Route path="grounds" element={<CafeGroundsPage />} />
        <Route path="requests" element={<CafeRequestsPage />} />
        <Route path="settings" element={<CafeSettingsPage />} />
      </Route>
      {/* 사용자 라우트 */}
      <Route
        path="/mypage"
        element={
          <ProtectedRoute requiredType="user">
            <UserMyPage />
          </ProtectedRoute>
        }
      />
      <Route path="/ai-solutions" element={<AISolutionsPage />} />
      <Route path="/market" element={<MarketPage />} />
      {/* 404 페이지 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider>
        <AuthProvider>
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
