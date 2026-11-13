import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, X, UserPlus, Bookmark } from 'lucide-react';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  title = 'Sign In Required',
  description = 'Do you want to sign in? You need an account to track your watch status, create custom lists, and curate your personal Korean drama library.',
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSignIn = () => {
    onClose();
    navigate('/login');
  };

  const handleSignUp = () => {
    onClose();
    navigate('/register');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-[#101217] border border-white/10 shadow-2xl text-center space-y-6 animate-scale-in"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Icon Pill */}
        <div className="mx-auto w-14 h-14 rounded-2xl bg-crimson/15 border border-rose-500/30 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/40">
          <Bookmark size={26} className="text-rose-400" />
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            <Sparkles size={11} />
            <span>Curator Account</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl text-white">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={handleSignIn}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-crimson hover:bg-crimson/90 text-white text-xs sm:text-sm font-bold shadow-lg shadow-crimson/30 transition-all hover:scale-[1.02]"
          >
            <LogIn size={16} />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-semibold border border-white/10 transition-all hover:scale-[1.02]"
          >
            <UserPlus size={16} />
            <span>Create Account</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Free forever. Takes only 15 seconds to create.
        </p>
      </div>
    </div>
  );
};

