import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const RootLayout: React.FC = () => {
  const { pathname } = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-dramify-bg text-slate-100 selection:bg-rose-500 selection:text-white">
      <Navbar />
      <main className="flex-grow pt-24 sm:pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
