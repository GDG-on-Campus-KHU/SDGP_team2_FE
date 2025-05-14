import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Coffee, BarChart3, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

const UserNavbar = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const { isAuthenticated, userType } = useAuth();
  const { t } = useTranslation();

  // Don't show the bottom navbar for cafe administrators
  if (userType === "cafe") {
    return null;
  }

  const navItems = [
    { path: "/", label: t("common.home"), icon: <Home className="h-5 w-5" /> },
    {
      path: "/ai-solutions",
      label: t("header.ai_solutions"),
      icon: <Coffee className="h-5 w-5" />,
    },
    {
      path: "/eco-report",
      label: t("mypage.view_eco_report"),
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      path: "/market",
      label: t("header.market"),
      icon: <ShoppingBag className="h-5 w-5" />,
    },
    {
      path: "/mypage",
      label: t("common.mypage"),
      icon: <User className="h-5 w-5" />,
    },
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
                ? "text-coffee bg-coffee-cream/30"
                : "text-gray-500 hover:text-coffee-dark hover:bg-coffee-cream/20"
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
