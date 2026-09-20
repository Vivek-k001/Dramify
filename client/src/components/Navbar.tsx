import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, Compass, Film, Bookmark, Menu, X, Sparkles } from 'lucide-react';
import { getSavedAvatar } from '../data/avatars';
import { cn } from '../utils/cn';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => getSavedAvatar());
  const location = useLocation();

  useEffect(() => {
    // Keep avatar updated if changed elsewhere
    const handleStorage = () => {
      setAvatarUrl(getSavedAvatar());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home', icon: <Film size={15} /> },
    { to: '/discover', label: 'Discover', icon: <Compass size={15} /> },
    { to: '/search', label: 'Search', icon: <Search size={15} /> },
    { to: '/library', label: 'My Library', icon: <Bookmark size={15} /> },
  ];

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 px-3 sm:px-6 pointer-events-none">
      <div className="max-w-6xl mx-auto flex items-center justify-between pointer-events-auto">
        {/* Detached Floating Island Shell */}
        <nav className="glass-pill w-full px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-full flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-crimson flex items-center justify-center text-white font-bold text-sm shadow-md shadow-crimson/30 group-hover:scale-105 transition-transform">
              D
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base sm:text-lg tracking-tight text-white flex items-center gap-1.5">
                DRAMIFY
                <span className="text-[10px] font-hangul font-normal tracking-widest text-rose-400 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                  드라마
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                    isActive
                      ? 'bg-white/15 text-white font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className={cn(isActive ? 'text-crimson' : 'text-slate-400')}>{link.icon}</span>
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Right Actions: Quick Search + User Profile CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Search Button */}
            <Link
              to="/search"
              aria-label="Quick Search"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 flex items-center justify-center transition-all"
            >
              <Search size={15} />
            </Link>

            {/* Profile Avatar CTA */}
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/10 hover:bg-[#1A1D27] text-white text-xs font-semibold border border-white/15 transition-all duration-200 group"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="hidden sm:inline">Profile</span>
              <Sparkles size={11} className="text-rose-400 group-hover:text-white transition-colors" />
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-8 h-8 rounded-full bg-white/5 text-slate-200 hover:text-white flex items-center justify-center border border-white/10"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={17} /> : <Menu size={17} />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-6xl mx-auto pointer-events-auto">
          <div className="glass-panel p-4 rounded-3xl animate-scale-in flex flex-col gap-2 border border-white/15 bg-[#101217]">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-crimson text-white font-semibold'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}

            <div className="border-t border-white/10 pt-3 mt-1 flex items-center justify-between px-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs text-slate-300 hover:text-white py-1"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-xs font-semibold px-4 py-1.5 rounded-full bg-crimson text-white"
              >
                Join Dramify
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
