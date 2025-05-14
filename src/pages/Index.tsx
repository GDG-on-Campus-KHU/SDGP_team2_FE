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
      </main>
      <UserNavbar />
      <Footer />
    </div>
  );
};

export default Index;
