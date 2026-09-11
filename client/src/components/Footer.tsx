import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 bg-dramify-surface/40 mt-24 py-16 px-4 sm:px-6 relative overflow-hidden">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-rose-600/5 blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Brand & Tagline */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <Link to="/" className="flex items-center gap-2 group mb-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-rose-900/40">
              D
            </div>
            <span className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              DRAMIFY
              <span className="text-[10px] font-hangul text-rose-400/90 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20">
                드라마
              </span>
            </span>
          </Link>
          <p className="text-xs text-slate-400 max-w-sm">
            The social tracking and discovery platform for K-Drama & K-Movie devotees.
          </p>
          <p className="text-[11px] font-semibold text-rose-400 mt-1 tracking-wider uppercase">
            Track. Rate. Discover. Repeat.
          </p>
        </div>

        {/* Quick Links */}
        <div className="flex items-center gap-6 text-xs text-slate-400">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <Link to="/discover" className="hover:text-white transition-colors">Discover</Link>
          <Link to="/search" className="hover:text-white transition-colors">Search</Link>
          <Link to="/library" className="hover:text-white transition-colors">My Library</Link>
          <Link to="/profile" className="hover:text-white transition-colors">Profile</Link>
        </div>

        {/* TMDB Attribution & Copyright */}
        <div className="flex flex-col items-center md:items-end text-center md:text-right gap-1 text-[11px] text-slate-500">
          <p className="flex items-center gap-1">
            Crafted with <Heart size={12} className="text-rose-500 fill-rose-500" /> for Hallyu fans worldwide
          </p>
          <p className="max-w-xs text-[10px] text-slate-600">
            This product uses the TMDB API but is not endorsed or certified by TMDB.
          </p>
          <p className="text-[10px] text-slate-600">
            &copy; {new Date().getFullYear()} Dramify. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
