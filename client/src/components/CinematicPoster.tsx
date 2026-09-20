import React, { useState } from 'react';
import { Tv, Film } from 'lucide-react';
import { cn } from '../utils/cn';

interface CinematicPosterProps {
  title: string;
  koreanTitle?: string;
  releaseYear?: number | string;
  mediaType?: 'tv' | 'movie';
  primaryUrl?: string;
  fallbackUrls?: string[];
  alt?: string;
  className?: string;
  aspectRatio?: 'poster' | 'backdrop';
}

export const CinematicPoster: React.FC<CinematicPosterProps> = ({
  title,
  koreanTitle,
  releaseYear,
  mediaType = 'tv',
  primaryUrl,
  fallbackUrls = [],
  alt,
  className,
  aspectRatio = 'poster',
}) => {
  // Collect all potential URLs in order: primary first, then verified fallbacks
  const candidateUrls = [primaryUrl, ...fallbackUrls].filter(
    (url): url is string => Boolean(url && url.trim().length > 0)
  );

  const [attemptIndex, setAttemptIndex] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const currentUrl = candidateUrls[attemptIndex];
  const isExhausted = !currentUrl || attemptIndex >= candidateUrls.length;
  const isDrama = mediaType === 'tv';

  const handleImageError = () => {
    // Try the next configured fallback URL for THIS title only
    setAttemptIndex((prev) => prev + 1);
  };

  const handleImageLoad = () => {
    setHasLoaded(true);
  };

  const aspectClass =
    aspectRatio === 'poster' ? 'aspect-[2/3]' : 'aspect-[16/10]';

  return (
    <div
      className={cn(
        'relative w-full overflow-hidden bg-slate-950 select-none',
        aspectClass,
        className
      )}
    >
      {!isExhausted ? (
        <>
          <img
            src={currentUrl}
            alt={alt || title}
            loading="lazy"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={cn(
              'w-full h-full object-cover transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
              hasLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
          />
          {/* Subtle loading placeholder until current image loads */}
          {!hasLoaded && (
            <div className="absolute inset-0 bg-[#12141A] animate-pulse flex items-center justify-center">
              <span className="text-xs font-semibold text-slate-500">Loading...</span>
            </div>
          )}
        </>
      ) : (
        /* Title-Based Authentic Cinematic Fallback Card (Strictly title-isolated) */
        <div className="w-full h-full flex flex-col justify-between p-4 sm:p-5 bg-gradient-to-b from-[#161922] via-[#101217] to-[#08090C] border border-white/5 text-left relative overflow-hidden">
          {/* Subtle watermark badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 text-slate-300 border border-white/10">
              {isDrama ? <Tv size={10} className="text-rose-400" /> : <Film size={10} className="text-amber-400" />}
              <span>{isDrama ? 'K-Drama' : 'K-Movie'}</span>
            </span>
            {releaseYear && (
              <span className="text-[10px] font-mono text-slate-400 font-medium">
                {releaseYear}
              </span>
            )}
          </div>

          {/* Centered Korean Hangul + English Title */}
          <div className="my-auto py-2 space-y-1">
            {koreanTitle && (
              <p className="font-hangul font-bold text-xs sm:text-sm text-rose-400/90 tracking-wide line-clamp-1">
                {koreanTitle}
              </p>
            )}
            <h3 className="font-display font-extrabold text-sm sm:text-base text-white leading-snug line-clamp-2">
              {title}
            </h3>
          </div>

          {/* Bottom subtle branding */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-white/5 pt-2">
            <span className="font-display font-semibold tracking-wider text-slate-300">DRAMIFY</span>
            <span>Archive</span>
          </div>
        </div>
      )}
    </div>
  );
};
