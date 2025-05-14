import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, Leaf, LogOut, Sparkles, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Logo from "@/assets/logo.png";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { isAuthenticated, user, logout, userType } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm h-16 sticky top-0 z-20">
      <div className="container mx-auto h-full flex items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex items-center bg-coffee-cream rounded-full p-1.0">
            <img src={Logo} width={36} height={36} />
          </div>
          <span className="text-xl font-bold text-coffee-dark">Eco-Bean</span>
        </Link>

        <div className="flex items-center space-x-3">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* AI Solution Button */}
          <Button
            onClick={() => navigate("/ai-solutions")}
            className="bg-eco hover:bg-eco-dark text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            {t("header.ai_solutions")}
          </Button>

          {isAuthenticated ? (
            <>
              {/* User Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10 border border-coffee/30">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-coffee-cream text-coffee">
                        {user?.name?.substring(0, 2) || <User size={18} />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>{t("common.mypage")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userType === "user" && (
                    <>
                      <DropdownMenuItem onClick={() => navigate("/mypage")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>{t("common.mypage")}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {userType === "cafe" && (
                    <DropdownMenuItem
                      onClick={() => navigate("/cafe/dashboard")}
                    >
                      <span>{t("header.cafe_management")}</span>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem className="text-red-500" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("common.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="outline"
                  className="border-coffee text-coffee hover:bg-coffee-cream"
                >
                  {t("common.login")}
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-coffee text-white hover:bg-coffee-dark">
                  {t("common.register")}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
