
import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Instagram, Facebook, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-coffee-dark text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-white rounded-full p-1">
                <Coffee className="h-6 w-6 text-coffee" />
              </div>
              <span className="text-lg font-bold">커피 그라운드</span>
            </div>
            <p className="text-sm text-coffee-cream max-w-md">
              우리는 커피 찌꺼기를 재활용하여 환경을 보호하는 데 앞장서고 있습니다. 
              함께 더 지속 가능한 미래를 만들어 가요.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase text-coffee-cream">회사</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-coffee-muted hover:text-white transition">회사소개</Link></li>
                <li><Link to="/contact" className="text-coffee-muted hover:text-white transition">문의하기</Link></li>
                <li><Link to="/careers" className="text-coffee-muted hover:text-white transition">채용정보</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold mb-4 uppercase text-coffee-cream">법적 정보</h3>
              <ul className="space-y-2">
                <li><Link to="/terms" className="text-coffee-muted hover:text-white transition">이용약관</Link></li>
                <li><Link to="/privacy" className="text-coffee-muted hover:text-white transition">개인정보처리방침</Link></li>
                <li><Link to="/cookies" className="text-coffee-muted hover:text-white transition">쿠키 정책</Link></li>
              </ul>
            </div>
            
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-sm font-semibold mb-4 uppercase text-coffee-cream">소셜 미디어</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-coffee-muted hover:text-white transition bg-coffee hover:bg-coffee-light rounded-full p-2">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-coffee-muted hover:text-white transition bg-coffee hover:bg-coffee-light rounded-full p-2">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-coffee-muted hover:text-white transition bg-coffee hover:bg-coffee-light rounded-full p-2">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-coffee mt-8 pt-6 text-center md:text-left text-sm text-coffee-muted">
          <p>&copy; {new Date().getFullYear()} 커피 그라운드 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
