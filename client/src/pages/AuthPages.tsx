import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, Film, AlertCircle, Check } from 'lucide-react';
import { authApi, setToken } from '../services/api';
import { STREAMING_AVATARS, getSavedAvatar, saveAvatar } from '../data/avatars';
import { cn } from '../utils/cn';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login({ login, password });
      setToken(res.token);
      if (res.user?.avatarUrl) {
        saveAvatar(res.user.avatarUrl);
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl bg-[#101217] border border-white/10 shadow-2xl space-y-7 relative overflow-hidden">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group mb-1">
            <div className="w-8 h-8 rounded-full bg-crimson flex items-center justify-center text-white font-bold text-sm shadow-md">
              D
            </div>
          </Link>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-400">
            Sign in to track your K-Dramas and access your Top 3.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email or Username</label>
            <div className="relative flex items-center">
              <input
                type="text"
                required
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="you@example.com or username"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
              />
              <Mail size={15} className="absolute left-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">Password</label>
              <a href="#forgot" className="text-[11px] text-rose-400 hover:underline">
                Forgot?
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
              />
              <Lock size={15} className="absolute left-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-crimson hover:bg-crimsonHover disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/8">
          <p className="text-xs text-slate-400">
            Don&apos;t have an account yet?{' '}
            <Link to="/register" className="font-semibold text-rose-400 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(() => getSavedAvatar());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.register({
        username,
        displayName,
        email,
        password,
      });
      setToken(res.token);
      saveAvatar(selectedAvatarUrl);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl p-8 sm:p-10 rounded-3xl bg-[#101217] border border-white/10 shadow-2xl space-y-7 relative overflow-hidden">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-crimson/15 text-rose-300 border border-crimson/25">
            <Sparkles size={12} />
            <span>Join the Dramify Community</span>
          </div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Create Your Profile
          </h1>
          <p className="text-xs text-slate-400">
            Pick your streaming avatar and start tracking Korean dramas & films.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="flex-shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 10 Profile Avatars Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300">
                Choose Profile Avatar (10 Choices)
              </label>
              <span className="text-[11px] text-rose-400 font-medium">
                {STREAMING_AVATARS.find(a => a.url === selectedAvatarUrl)?.role || 'Cinematic Profile'}
              </span>
            </div>

            {/* Avatars Carousel / Row */}
            <div className="grid grid-cols-5 gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/8">
              {STREAMING_AVATARS.map((avatar) => {
                const isSelected = selectedAvatarUrl === avatar.url;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => setSelectedAvatarUrl(avatar.url)}
                    className={cn(
                      'relative aspect-square rounded-full overflow-hidden border-2 transition-all p-0.5 focus:outline-none group',
                      isSelected
                        ? 'border-crimson scale-105 shadow-md shadow-crimson/30'
                        : 'border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                    )}
                    title={`${avatar.name} (${avatar.role})`}
                  >
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-crimson/25 rounded-full flex items-center justify-center">
                        <Check size={12} strokeWidth={3} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Username</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="kdrama_fanatic"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
                />
                <User size={14} className="absolute left-3.5 text-slate-400" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Display Name</label>
              <div className="relative flex items-center">
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Min-ho"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
                />
                <Film size={14} className="absolute left-3.5 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Email Address</label>
            <div className="relative flex items-center">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
              />
              <Mail size={14} className="absolute left-3.5 text-slate-400" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-crimson"
              />
              <Lock size={14} className="absolute left-3.5 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-crimson hover:bg-crimsonHover disabled:opacity-50 text-white font-bold text-xs tracking-wide transition-all shadow-lg flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-white/8">
          <p className="text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-rose-400 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
