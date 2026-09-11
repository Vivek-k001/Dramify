import React from 'react';
import { Star, Sparkles } from 'lucide-react';

interface RatingBadgeProps {
  tmdbRating?: number;
  dramifyRating?: number;
  showLabels?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const RatingBadge: React.FC<RatingBadgeProps> = ({
  tmdbRating,
  dramifyRating,
  showLabels = false,
  size = 'sm',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {/* TMDB Rating */}
      {tmdbRating !== undefined && (
        <div
          title={`TMDB Rating: ${tmdbRating.toFixed(1)} / 10`}
          className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20 backdrop-blur-sm ${sizeClasses[size]}`}
        >
          <Star size={iconSizes[size]} className="fill-amber-400 text-amber-400" />
          <span>{tmdbRating.toFixed(1)}</span>
          {showLabels && <span className="text-[10px] text-amber-400/70 font-normal">TMDB</span>}
        </div>
      )}

      {/* Dramify Community Rating */}
      {dramifyRating !== undefined && (
        <div
          title={`Dramify Community: ${dramifyRating.toFixed(1)} / 10`}
          className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20 backdrop-blur-sm ${sizeClasses[size]}`}
        >
          <Sparkles size={iconSizes[size]} className="fill-rose-400 text-rose-400" />
          <span>{dramifyRating.toFixed(1)}</span>
          {showLabels && <span className="text-[10px] text-rose-400/70 font-normal">Dramify</span>}
        </div>
      )}
    </div>
  );
};
