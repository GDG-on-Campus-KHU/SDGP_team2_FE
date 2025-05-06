import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
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
import GoogleOAuthCallback from "./pages/auth/GoogleOAuthCallback";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import CafeRegistrationPage from "./pages/cafe/CafeRegistrationPage";
import { useEffect } from "react";
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

// AppRoutes를 별도의 컴포넌트로 분리
const AppRoutes = () => {
  const {
    isAuthenticated,
    userType,
    isLoading,
    hasCafeRegistered,
    checkCafeRegistration,
  } = useAuth();
  const navigate = useNavigate();

  // 카페 등록 상태 확인
  useEffect(() => {
    const checkCafeStatus = async () => {
      if (userType === "cafe" && isAuthenticated && !hasCafeRegistered) {
        const isRegistered = await checkCafeRegistration();
        if (!isRegistered) {
          navigate("/cafe/register", { replace: true });
        }
      }
    };

    if (!isLoading) {
      checkCafeStatus();
    }
  }, [
    isAuthenticated,
    userType,
    isLoading,
    hasCafeRegistered,
    checkCafeRegistration,
    navigate,
  ]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />

      {/* 카페 등록 페이지 */}
      <Route
        path="/cafe/register"
        element={
          <ProtectedRoute requiredType="cafe">
            <CafeRegistrationPage />
          </ProtectedRoute>
        }
      />

      {/* 카페 마이페이지 */}
      <Route
        path="/cafe"
        element={
          <ProtectedRoute requiredType="cafe">
            <CafeManagementPage />
          </ProtectedRoute>
        }
      >
        {/* 루트 경로 리다이렉트 */}
        <Route index element={<Navigate to="/cafe/dashboard" replace />} />
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

// 메인 App 컴포넌트
const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster />
        <Sonner />
      </AuthProvider>
    </TooltipProvider>
  </BrowserRouter>
);

export default App;
