
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CafeSidebar from '../components/CafeSidebar';

const CafeManagementPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1">
        <CafeSidebar />
        <main className="flex-1 p-6 bg-background">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default CafeManagementPage;
