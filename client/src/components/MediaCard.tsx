import React from 'react';
import { Link } from 'react-router-dom';
import { Tv, Film, Clock, Layers } from 'lucide-react';
import { MediaItem } from '../types/media';
import { RatingBadge } from './RatingBadge';
import { FavoriteButton } from './FavoriteButton';
import { WatchStatusButton } from './WatchStatusButton';
import { CinematicPoster } from './CinematicPoster';
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
  const isDrama = media.media_type === 'tv';

  return (
    <div
      className={cn(
        'group relative flex flex-col bg-[#12141B] rounded-2xl overflow-hidden border border-white/8 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-2xl',
        className
      )}
    >
      {/* Poster Image Container */}
      <Link
        to={`/media/${media.media_type}/${media.tmdb_id}`}
        className="relative aspect-[2/3] w-full overflow-hidden block bg-slate-950"
      >
        <CinematicPoster
          title={media.title}
          koreanTitle={media.korean_title}
          releaseYear={media.release_year}
          mediaType={media.media_type}
          primaryUrl={media.poster_path}
          fallbackUrls={[]}
          className="w-full h-full"
        />

        {/* Functional Bottom Vignette */}
        <div className="absolute inset-0 poster-fade opacity-80 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none" />

        {/* Top Badges (Rank or Category & Favorite button) */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10">
          <div className="flex items-center gap-1.5 pointer-events-auto">
            {rank !== undefined ? (
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full flex items-center justify-center font-mono font-bold text-[11px] shadow-md border backdrop-blur-md',
                  rank === 1 && 'bg-crimson text-white border-crimson/50',
                  rank === 2 && 'bg-white/15 text-white border-white/20',
                  rank === 3 && 'bg-white/10 text-slate-200 border-white/15',
                  rank > 3 && 'bg-black/80 text-slate-300 border-white/15'
                )}
              >
                #{rank}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-black/70 backdrop-blur-md text-white border border-white/10">
                {isDrama ? <Tv size={10} className="text-rose-400" /> : <Film size={10} className="text-amber-400" />}
                <span>{isDrama ? 'K-Drama' : 'K-Movie'}</span>
              </span>
            )}
          </div>

          {/* Quick Favorite Action */}
          <div className="pointer-events-auto">
            <FavoriteButton size="sm" />
          </div>
        </div>

        {/* Korean Hangul Badge */}
        {media.korean_title && (
          <div className="absolute bottom-2 left-2 pointer-events-none z-10">
            <span className="text-[10px] font-hangul text-white/90 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 font-medium">
              {media.korean_title}
            </span>
          </div>
        )}
      </Link>

      {/* Content Details */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-grow justify-between gap-2.5 bg-[#12141B]">
        <div>
          {/* Title */}
          <Link
            to={`/media/${media.media_type}/${media.tmdb_id}`}
            className="font-display font-bold text-xs sm:text-sm text-white hover:text-rose-400 transition-colors line-clamp-1 block"
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
  );
};
