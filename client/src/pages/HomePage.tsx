import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Flame, Award, Heart, Sparkles, ArrowRight, Play, Star, Shuffle } from 'lucide-react';
import { MOCK_MEDIA, MOCK_REVIEWS } from '../data/mockMedia';
import { MediaItem } from '../types/media';
import { MediaCard } from '../components/MediaCard';
import { RatingBadge } from '../components/RatingBadge';
import { FavoriteButton } from '../components/FavoriteButton';
import { WatchStatusButton } from '../components/WatchStatusButton';
import { CinematicPoster } from '../components/CinematicPoster';

// Fisher-Yates array randomizer
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // Randomly shuffled trending dramas on each page refresh
  const [trendingDramas, setTrendingDramas] = useState<MediaItem[]>(() => {
    const allDramas = MOCK_MEDIA.filter((m) => m.media_type === 'tv');
    return shuffleArray(allDramas).slice(0, 5);
  });

  // Randomly shuffled popular movies on each page refresh
  const [popularMovies, setPopularMovies] = useState<MediaItem[]>(() => {
    const allMovies = MOCK_MEDIA.filter((m) => m.media_type === 'movie');
    return shuffleArray(allMovies).slice(0, 5);
  });

  // Dynamic featured spotlight selected from top-rated dramas (>= 8.9)
  const [featuredMedia] = useState<MediaItem>(() => {
    const topDramas = MOCK_MEDIA.filter((m) => m.media_type === 'tv' && m.dramify_community_rating >= 8.9);
    return topDramas[Math.floor(Math.random() * topDramas.length)] || MOCK_MEDIA[0];
  });

  const communityFavorites = [...MOCK_MEDIA]
    .sort((a, b) => b.dramify_community_rating - a.dramify_community_rating)
    .slice(0, 4);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const genres = [
    'Romance',
    'Revenge Thriller',
    'Melodrama',
    'Mystery & Crime',
    'Slice of Life',
    'Historical (Sageuk)',
    'Action',
  ];

  return (
    <div className="space-y-16 sm:space-y-24 pb-20">
      {/* 1. CINEMATIC HERO SECTION (Netflix / Cineby Content-First Experience) */}
      <section className="relative px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#101217] shadow-2xl p-6 sm:p-10 lg:p-14">
          {/* Functional subtle vignette */}
          <div className="absolute inset-0 cinema-vignette opacity-80 pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Restrained Pill Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold bg-crimson/15 text-rose-300 border border-crimson/25">
                <Sparkles size={12} className="text-rose-400" />
                <span>Korean Cinema & Television Hub</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Track what you watch. <br />
                <span className="text-slate-300 font-bold">
                  Curate your K-Drama world.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-slate-400 text-sm sm:text-base max-w-xl leading-relaxed">
                Log watched series, curate your personal Top 3 podium, compare TMDB and community scores, and explore verified Korean releases.
              </p>

              {/* Functional Search Bar */}
              <form onSubmit={handleHeroSearchSubmit} className="max-w-xl">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search by English or Hangul title, actor, or genre..."
                    className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-full bg-[#161922] border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-crimson shadow-inner transition-all"
                  />
                  <Search size={18} className="absolute left-4 text-slate-500 pointer-events-none" />
                  <button
                    type="submit"
                    className="absolute right-1.5 sm:right-2 px-5 py-2.5 rounded-full bg-crimson hover:bg-crimsonHover text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 group"
                  >
                    <span>Search</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Quick Genre Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Genres:</span>
                {genres.slice(0, 5).map((genre) => (
                  <Link
                    key={genre}
                    to={`/search?genre=${encodeURIComponent(genre)}`}
                    className="text-xs px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/8 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Featured Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#141620] shadow-2xl group">
                {/* Poster / Backdrop Banner */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-950">
                  <CinematicPoster
                    title={featuredMedia.title}
                    koreanTitle={featuredMedia.korean_title}
                    releaseYear={featuredMedia.release_year}
                    mediaType={featuredMedia.media_type}
                    primaryUrl={featuredMedia.backdrop_path || featuredMedia.poster_path}
                    aspectRatio="backdrop"
                    className="w-full h-full"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141620] via-transparent to-black/30 pointer-events-none" />

                  {/* Spotlight Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-crimson text-white text-[10px] font-bold shadow-md">
                    <Flame size={12} />
                    <span>FEATURED SPOTLIGHT</span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <FavoriteButton size="sm" />
                  </div>
                </div>

                {/* Spotlight Info */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-hangul text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-medium">
                        {featuredMedia.korean_title}
                      </span>
                      <span className="text-xs text-slate-400">
                        {featuredMedia.release_year} &bull; {featuredMedia.number_of_episodes || 16} eps
                      </span>
                    </div>
                    <RatingBadge
                      tmdbRating={featuredMedia.vote_average}
                      dramifyRating={featuredMedia.dramify_community_rating}
                    />
                  </div>

                  <Link
                    to={`/media/${featuredMedia.media_type}/${featuredMedia.tmdb_id}`}
                    className="block font-display font-extrabold text-xl text-white hover:text-rose-400 transition-colors"
                  >
                    {featuredMedia.title}
                  </Link>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {featuredMedia.overview}
                  </p>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                    <WatchStatusButton size="sm" />
                    <Link
                      to={`/media/${featuredMedia.media_type}/${featuredMedia.tmdb_id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                    >
                      <Play size={12} className="fill-current" />
                      <span>Details & Cast</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. TRENDING K-DRAMAS */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Flame size={18} className="text-crimson" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Trending K-Dramas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              The most discussed and tracked Korean series right now
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allDramas = MOCK_MEDIA.filter((m) => m.media_type === 'tv');
                setTrendingDramas(shuffleArray(allDramas).slice(0, 5));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer group"
              title="Shuffle Trending K-Dramas"
            >
              <Shuffle size={13} className="text-rose-400 group-hover:rotate-180 transition-transform duration-300" />
              <span>Shuffle</span>
            </button>
            <Link
              to="/discover?type=tv"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors group"
            >
              <span>See All</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {trendingDramas.map((media, idx) => (
            <MediaCard key={media.id} media={media} rank={idx + 1} />
          ))}
        </div>
      </section>

      {/* 3. POPULAR K-MOVIES */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Critically Acclaimed K-Movies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Korean cinematic masterpieces and box office thrillers
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const allMovies = MOCK_MEDIA.filter((m) => m.media_type === 'movie');
                setPopularMovies(shuffleArray(allMovies).slice(0, 5));
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer group"
              title="Shuffle K-Movies"
            >
              <Shuffle size={13} className="text-amber-400 group-hover:rotate-180 transition-transform duration-300" />
              <span>Shuffle</span>
            </button>
            <Link
              to="/discover?type=movie"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
            >
              <span>See All</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {popularMovies.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      </section>

      {/* 4. COMMUNITY FAVORITES & REVIEWS */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="p-6 sm:p-10 rounded-3xl bg-[#101217] border border-white/8 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Community Top Rated Picks */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-crimson fill-crimson" />
                <h3 className="font-display font-bold text-xl text-white">
                  Community Favorites
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Titles rated highest by Dramify community members.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {communityFavorites.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            </div>

            {/* Right: Recent Reviews */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Recent Critiques</span>
                </h3>
                <span className="text-[11px] text-slate-500">Community Feed</span>
              </div>

              <div className="space-y-3">
                {MOCK_REVIEWS.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#141620] border border-white/5 space-y-2 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatarUrl}
                          alt={rev.displayName}
                          className="w-8 h-8 rounded-full object-cover border border-white/10"
                        />
                        <div>
                          <span className="font-display font-bold text-xs text-white block">
                            {rev.displayName}
                          </span>
                          <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star size={13} className="fill-current" />
                        <span>{rev.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
