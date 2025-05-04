import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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

const queryClient = new QueryClient();

// 인증이 필요한 라우트를 보호하는 컴포넌트
const ProtectedRoute = ({ children, requiredType }: { children: JSX.Element, requiredType?: 'user' | 'cafe' }) => {
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/oauth/google/callback" element={<GoogleOAuthCallback />} />
      
      {/* 카페 관리자 라우트 */}
      <Route path="/cafe" element={
        <ProtectedRoute requiredType="cafe">
          <CafeManagementPage />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<CafeDashboard />} />
        <Route path="beans" element={<CafeBeansPage />} />
        <Route path="grounds" element={<CafeGroundsPage />} />
        <Route path="requests" element={<CafeRequestsPage />} />
        <Route path="settings" element={<CafeSettingsPage />} />
      </Route>
      
      {/* 사용자 라우트 */}
      <Route path="/mypage" element={
        <ProtectedRoute requiredType="user">
          <UserMyPage />
        </ProtectedRoute>
      } />
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
        <AuthProvider>{/* 추가된 Provider */}
          <AppRoutes />
          <Toaster />
          <Sonner />
        </AuthProvider>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;