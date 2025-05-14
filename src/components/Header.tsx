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

const Header = () => {
  const { isAuthenticated, user, logout, userType } = useAuth();
  const navigate = useNavigate();

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
          {/* AI 솔루션 버튼 추가 */}
          <Button
            onClick={() => navigate("/ai-solutions")}
            className="bg-eco hover:bg-eco-dark text-white"
          >
            <Sparkles className="mr-2 h-4 w-4" />
            AI upcycling guide
          </Button>
          {isAuthenticated ? (
            <>
              {/* 사용자 유형에 따른 링크 */}
              {userType === "cafe" && (
                <Button
                  variant="outline"
                  className="border-coffee text-coffee hover:bg-coffee-cream mr-2"
                  onClick={() => navigate("/cafe/dashboard")}
                >
                  카페 관리
                </Button>
              )}

              {/* 사용자 프로필 드롭다운 */}
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
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/mypage")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>마이페이지</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-500" onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>로그아웃</span>
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
                  로그인
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-coffee text-white hover:bg-coffee-dark">
                  회원가입
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
