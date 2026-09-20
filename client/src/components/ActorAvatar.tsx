import React, { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '../utils/cn';

interface ActorAvatarProps {
  name: string;
  character?: string;
  profilePath?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ActorAvatar: React.FC<ActorAvatarProps> = ({
  name,
  character,
  profilePath,
  size = 'md',
  className,
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const sizeDimensions = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 sm:w-16 sm:h-16 text-sm',
    lg: 'w-20 h-20 text-base',
  }[size];

  const hasImage = Boolean(profilePath && profilePath.trim().length > 0 && !hasError);

  return (
    <div className={cn('flex flex-col items-center text-center group', className)}>
      {/* Avatar Container */}
      <div
        className={cn(
          'relative rounded-full overflow-hidden bg-[#151821] border border-white/10 group-hover:border-white/25 transition-all duration-300 shadow-md flex-shrink-0',
          sizeDimensions
        )}
      >
        {hasImage ? (
          <>
            <img
              src={profilePath}
              alt={name}
              loading="lazy"
              onLoad={() => setIsLoaded(true)}
              onError={() => setHasError(true)}
              className={cn(
                'w-full h-full object-cover object-top transition-all duration-500 group-hover:scale-105',
                isLoaded ? 'opacity-100' : 'opacity-0'
              )}
            />
            {!isLoaded && (
              <div className="absolute inset-0 bg-[#141720] animate-pulse flex items-center justify-center">
                <User size={16} className="text-slate-600" />
              </div>
            )}
          </>
        ) : (
          /* Tasteful Monogram Fallback for unlisted stars */
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-[#1E222D] to-[#12141B] text-slate-300 font-display font-bold select-none">
            {name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name & Character labels */}
      {name && (
        <span className="font-display font-bold text-xs text-white group-hover:text-rose-400 transition-colors line-clamp-1 mt-2 max-w-[110px]">
          {name}
        </span>
      )}
      {character && (
        <span className="text-[11px] text-slate-400 line-clamp-1 max-w-[110px] mt-0.5">
          {character}
        </span>
      )}
    </div>
  );
};
