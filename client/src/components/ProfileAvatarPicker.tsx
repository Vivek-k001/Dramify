import React from 'react';
import { Check, Sparkles, X } from 'lucide-react';
import { STREAMING_AVATARS, ProfileAvatar } from '../data/avatars';
import { cn } from '../utils/cn';

interface ProfileAvatarPickerProps {
  selectedAvatarUrl: string;
  onSelectAvatar: (avatar: ProfileAvatar) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
  asModal?: boolean;
}

export const ProfileAvatarPicker: React.FC<ProfileAvatarPickerProps> = ({
  selectedAvatarUrl,
  onSelectAvatar,
  onClose,
  title = "Who's Watching?",
  subtitle = 'Choose a cinematic avatar for your Dramify profile',
  asModal = false,
}) => {
  const content = (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-semibold bg-crimson/15 text-rose-400 border border-crimson/25">
            <Sparkles size={11} />
            <span>Profile Identity</span>
          </div>
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400">
            {subtitle}
          </p>
        </div>
        {asModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center border border-white/10 transition-colors"
            aria-label="Close avatar picker"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Avatars Grid - 10 avatars */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {STREAMING_AVATARS.map((avatar) => {
          const isSelected = selectedAvatarUrl === avatar.url;

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelectAvatar(avatar)}
              className={cn(
                'group flex flex-col items-center p-3 rounded-2xl transition-all duration-300 relative text-center focus:outline-none',
                isSelected
                  ? 'bg-white/10 border-2 border-crimson shadow-xl shadow-crimson/20'
                  : 'bg-dramify-surface/70 hover:bg-white/5 border border-white/5 hover:border-white/20'
              )}
            >
              {/* Avatar circle with glow when selected */}
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 transition-transform duration-300 group-hover:scale-105">
                <img
                  src={avatar.url}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-crimson/20 flex items-center justify-center backdrop-blur-[1px]">
                    <div className="w-6 h-6 rounded-full bg-crimson text-white flex items-center justify-center shadow-lg">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  </div>
                )}
              </div>

              {/* Names and Role */}
              <span className="font-display font-bold text-xs text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                {avatar.name}
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                {avatar.role}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  if (!asModal) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-h-[90vh] overflow-y-auto w-full max-w-3xl relative shadow-2xl">
        {content}
      </div>
    </div>
  );
};
