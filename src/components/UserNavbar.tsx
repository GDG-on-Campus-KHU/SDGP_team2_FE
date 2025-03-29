
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Coffee, BarChart3, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const UserNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isAuthenticated, userType } = useAuth();
  
  // 카페 관리자는 하단 네비게이션바를 표시하지 않음
  if (userType === 'cafe') {
    return null;
  }
  
  const navItems = [
    { path: '/', label: '홈', icon: <Home className="h-5 w-5" /> },
    { path: '/ai-solutions', label: 'AI 솔루션', icon: <Coffee className="h-5 w-5" /> },
    { path: '/eco-report', label: '환경 리포트', icon: <BarChart3 className="h-5 w-5" /> },
    { path: '/market', label: '마켓', icon: <ShoppingBag className="h-5 w-5" /> },
    { path: '/mypage', label: '마이페이지', icon: <User className="h-5 w-5" /> },
  ];
  
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-10 md:hidden">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center py-3 ${
              pathname === item.path 
                ? 'text-coffee bg-coffee-cream/30' 
                : 'text-gray-500 hover:text-coffee-dark hover:bg-coffee-cream/20'
            } transition-colors`}
          >
            {item.icon}
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default UserNavbar;
