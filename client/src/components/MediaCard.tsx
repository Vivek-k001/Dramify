import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tv, Film, Clock, Layers } from 'lucide-react';
import { MediaItem } from '../types/media';
import { RatingBadge } from './RatingBadge';
import { FavoriteButton } from './FavoriteButton';
import { WatchStatusButton } from './WatchStatusButton';
import { cn } from '../utils/cn';

interface MediaCardProps {
  media: MediaItem;
  className?: string;
  rank?: number; // e.g. for Top 3 or Trending lists
}

export const MediaCard: React.FC<MediaCardProps> = ({
  media,
  className,
  rank,
}) => {
  const [imageError, setImageError] = useState(false);
  const isDrama = media.media_type === 'tv';

  return (
    <div className={cn('double-bezel group relative transition-all duration-500', className)}>
      <div className="double-bezel-inner relative bg-dramify-card flex flex-col h-full overflow-hidden">
        {/* Poster Image Container */}
        <Link
          to={`/media/${media.media_type}/${media.tmdb_id}`}
          className="relative aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-slate-900 via-dramify-surface to-slate-950 block"
        >
          {!imageError && media.poster_path ? (
            <img
              src={media.poster_path}
              alt={media.title}
              loading="lazy"
              onError={() => setImageError(true)}
              className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
          ) : (
            /* Elegant Fallback Poster */
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-dramify-surface via-slate-900 to-black relative">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400 mb-3 shadow-inner">
                {isDrama ? <Tv size={22} /> : <Film size={22} />}
              </div>
              <span className="font-hangul font-bold text-xs text-rose-300/80 mb-1">
                {media.korean_title}
              </span>
              <span className="font-display font-bold text-xs text-white line-clamp-2 px-1">
                {media.title}
              </span>
              <span className="text-[10px] text-slate-500 mt-2">
                {media.release_year} &bull; {isDrama ? 'Series' : 'Film'}
              </span>
            </div>
          )}

          {/* Vignette Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-dramify-card via-transparent to-black/40 opacity-80 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none" />

          {/* Top Rank Badge or Media Type Badge */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-1.5 pointer-events-auto">
              {rank !== undefined ? (
                <span
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center font-display font-bold text-xs shadow-md border',
                    rank === 1 && 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/20',
                    rank === 2 && 'bg-slate-300 text-slate-950 border-white shadow-slate-400/20',
                    rank === 3 && 'bg-amber-700 text-amber-50 border-amber-600 shadow-amber-800/20',
                    rank > 3 && 'bg-black/60 text-white border-white/20 backdrop-blur-md'
                  )}
                >
                  #{rank}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {isDrama ? <Tv size={11} className="text-rose-400" /> : <Film size={11} className="text-cyan-400" />}
                  <span>{isDrama ? 'K-Drama' : 'K-Movie'}</span>
                </span>
              )}
            </div>

            {/* Quick Favorite Action */}
            <div className="pointer-events-auto">
              <FavoriteButton size="sm" />
            </div>
          </div>

          {/* Korean Hangul Badge (Subtle watermarked tag) */}
          {media.korean_title && (
            <div className="absolute bottom-2.5 left-2.5">
              <span className="text-[11px] font-hangul text-white/80 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10">
                {media.korean_title}
              </span>
            </div>
          )}
        </Link>

        {/* Content Details */}
        <div className="p-3.5 flex flex-col flex-grow justify-between gap-2.5 bg-dramify-card">
          <div>
            {/* Title */}
            <Link
              to={`/media/${media.media_type}/${media.tmdb_id}`}
              className="font-display font-bold text-sm sm:text-base text-white hover:text-rose-400 transition-colors line-clamp-1 group-hover:text-rose-400"
            >
              {media.title}
            </Link>

            {/* Meta Row: Year + Episodes / Runtime */}
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>{media.release_year}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              {isDrama ? (
                <span className="inline-flex items-center gap-1">
                  <Layers size={11} className="text-slate-500" />
                  {media.number_of_episodes ? `${media.number_of_episodes} eps` : 'Series'}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} className="text-slate-500" />
                  {media.runtime ? `${media.runtime}m` : 'Feature'}
                </span>
              )}
              {media.network && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="text-rose-400/90 font-medium">{media.network}</span>
                </>
              )}
            </div>
          </div>

          {/* Ratings & Quick Watch Status Action */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
            <RatingBadge
              tmdbRating={media.vote_average}
              dramifyRating={media.dramify_community_rating}
              size="sm"
            />

            <WatchStatusButton size="sm" />
          </div>
        </div>
      </div>
    </div>
  );
};
