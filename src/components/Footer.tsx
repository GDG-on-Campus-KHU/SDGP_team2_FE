import React from 'react';
import { Coffee } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-coffee-dark text-white py-4">
      <div className="container mx-auto px-4 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Coffee className="h-5 w-5 text-coffee-cream" />
          <span className="text-md font-bold">커피 그라운드</span>
        </div>
        <p className="text-xs text-coffee-muted">
          © {new Date().getFullYear()} 커피 그라운드 모든 권리 보유.
        </p>
      </div>
    </footer>
  );
};

export default Footer;