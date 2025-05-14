import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import MapComponent from "../components/MapComponent";
import UserNavbar from "../components/UserNavbar";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow pb-16 md:pb-0">
        {" "}
        {/* 추가된 pb-16은 모바일에서 하단 네비게이션바 공간 확보용 */}
        <MapComponent />
        {/* AI 솔루션 플로팅 버튼 */}
        <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-20">
          <Button
            onClick={() => navigate("/ai-solutions")}
            className="bg-eco hover:bg-eco-dark text-white font-bold shadow-lg px-5 py-5 h-auto rounded-full"
          >
            <Sparkles className="h-5 w-5 mr-2" />
            <span>AI 솔루션</span>
          </Button>
        </div>
      </main>
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default Index;
