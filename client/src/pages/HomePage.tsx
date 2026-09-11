import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Flame, Award, Heart, Sparkles, ArrowRight, Play, Star } from 'lucide-react';
import { MOCK_MEDIA, MOCK_REVIEWS } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { RatingBadge } from '../components/RatingBadge';
import { FavoriteButton } from '../components/FavoriteButton';
import { WatchStatusButton } from '../components/WatchStatusButton';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroSearchQuery, setHeroSearchQuery] = useState('');

  // Featured Drama for the Hero Spotlight: Moving
  const featuredMedia = MOCK_MEDIA[0];

  // Sections
  const trendingDramas = MOCK_MEDIA.filter((m) => m.media_type === 'tv').slice(0, 5);
  const popularMovies = MOCK_MEDIA.filter((m) => m.media_type === 'movie').slice(0, 5);
  const communityFavorites = [...MOCK_MEDIA].sort((a, b) => b.dramify_community_rating - a.dramify_community_rating).slice(0, 4);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(heroSearchQuery.trim())}`);
    }
  };

  const genres = [
    'Romance', 'Revenge Thriller', 'Melodrama', 'Mystery & Crime', 'Slice of Life', 'Historical (Sageuk)', 'Sci-Fi & Fantasy'
  ];

  return (
    <div className="space-y-20 sm:space-y-28 pb-16">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="relative rounded-4xl overflow-hidden border border-white/10 bg-gradient-to-b from-dramify-surface to-dramify-bg shadow-2xl p-6 sm:p-12 lg:p-16">
          {/* Subtle Ambient Backdrop Glow */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center relative z-10">
            {/* Left Narrative Column */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25 backdrop-blur-md">
                <Sparkles size={13} className="text-rose-400" />
                <span>The Social Home for Korean Entertainment</span>
              </div>

              {/* Main Headline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Your K-Drama world, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-rose-400">
                  all in one place.
                </span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-slate-300 text-sm sm:text-base max-w-xl leading-relaxed">
                Track what you watch. Rate what you love. Curate your personal Top 3 podium, compare taste matches, and discover your next obsession.
              </p>

              {/* Prominent Search Bar */}
              <form onSubmit={handleHeroSearchSubmit} className="max-w-xl">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={heroSearchQuery}
                    onChange={(e) => setHeroSearchQuery(e.target.value)}
                    placeholder="Search K-Dramas, K-Movies, actors, or genres..."
                    className="w-full pl-12 pr-28 py-3.5 sm:py-4 rounded-full bg-dramify-surface/90 border border-white/15 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 shadow-inner transition-all"
                  />
                  <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
                  <button
                    type="submit"
                    className="absolute right-1.5 sm:right-2 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-all shadow-md shadow-rose-950/50 flex items-center gap-1.5 group"
                  >
                    <span>Explore</span>
                    <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Quick Genre Pills */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">Quick Tags:</span>
                {genres.slice(0, 4).map((genre) => (
                  <Link
                    key={genre}
                    to={`/search?genre=${encodeURIComponent(genre)}`}
                    className="text-xs px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right Column: Featured Spotlight Card */}
            <div className="lg:col-span-5">
              <div className="double-bezel relative">
                <div className="double-bezel-inner relative bg-dramify-card rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  {/* Backdrop banner */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <img
                      src={featuredMedia.backdrop_path}
                      alt={featuredMedia.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dramify-card via-black/40 to-transparent" />

                    {/* Spotlight Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600/90 text-white text-[11px] font-bold backdrop-blur-md shadow-md">
                      <Flame size={12} />
                      <span>SPOTLIGHT OF THE WEEK</span>
                    </div>

                    <div className="absolute top-3 right-3">
                      <FavoriteButton size="sm" />
                    </div>
                  </div>

                  {/* Spotlight Info */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-hangul text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          {featuredMedia.korean_title}
                        </span>
                        <span className="text-xs text-slate-400">{featuredMedia.release_year} &bull; {featuredMedia.number_of_episodes} eps</span>
                      </div>
                      <RatingBadge tmdbRating={featuredMedia.vote_average} dramifyRating={featuredMedia.dramify_community_rating} />
                    </div>

                    <Link
                      to={`/media/${featuredMedia.media_type}/${featuredMedia.tmdb_id}`}
                      className="block font-display font-extrabold text-xl text-white hover:text-rose-400 transition-colors"
                    >
                      {featuredMedia.title}
                    </Link>

                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {featuredMedia.overview}
                    </p>

                    <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-3">
                      <WatchStatusButton size="sm" />
                      <Link
                        to={`/media/${featuredMedia.media_type}/${featuredMedia.tmdb_id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
                      >
                        <Play size={12} className="fill-current" />
                        <span>View Details</span>
                      </Link>
                    </div>
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
              <Flame size={18} className="text-rose-500" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Trending K-Dramas
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              The most discussed and tracked Korean series right now
            </p>
          </div>
          <Link
            to="/discover?type=tv"
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors group"
          >
            <span>See All</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
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
              <Award size={18} className="text-cyan-400" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Critically Acclaimed K-Movies
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Award-winning Korean cinematic masterpieces and box office thrillers
            </p>
          </div>
          <Link
            to="/discover?type=movie"
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group"
          >
            <span>See All</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {popularMovies.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      </section>

      {/* 4. COMMUNITY FAVORITES & PULSE */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto space-y-8">
        <div className="p-6 sm:p-10 rounded-4xl bg-gradient-to-b from-dramify-surface/70 to-dramify-card/70 border border-white/10 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Community Top Rated Picks */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-rose-500 fill-rose-500" />
                <h3 className="font-display font-bold text-xl text-white">
                  Community Favorites
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                Titles rated highest by registered Dramify users with authentic reviews.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {communityFavorites.map((media) => (
                  <MediaCard key={media.id} media={media} />
                ))}
              </div>
            </div>

            {/* Right: Recent Reviews / Community Activity Feed */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>Recent Community Reviews</span>
                </h3>
                <span className="text-[11px] text-slate-400">Live Pulse</span>
              </div>

              <div className="space-y-3">
                {MOCK_REVIEWS.slice(0, 3).map((review) => {
                  const mediaItem = MOCK_MEDIA.find((m) => m.tmdb_id === review.tmdb_id);
                  return (
                    <div
                      key={review.id}
                      className="p-4 rounded-2xl bg-dramify-bg/80 border border-white/5 space-y-2.5 hover:border-white/15 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={review.avatarUrl}
                            alt={review.displayName}
                            className="w-7 h-7 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <Link to={`/u/${review.username}`} className="font-semibold text-xs text-white hover:underline block">
                              {review.displayName}
                            </Link>
                            <span className="text-[10px] text-slate-400">@{review.username}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                          <Star size={11} className="fill-amber-400" />
                          <span>{review.rating}/10</span>
                        </div>
                      </div>

                      {mediaItem && (
                        <Link
                          to={`/media/${mediaItem.media_type}/${mediaItem.tmdb_id}`}
                          className="text-xs font-semibold text-rose-400 hover:underline block"
                        >
                          on {mediaItem.title} ({mediaItem.korean_title})
                        </Link>
                      )}

                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                        "{review.content}"
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{review.createdAt}</span>
                        <span>{review.likesCount} members agreed</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. GENRE BENTO TILES / DISCOVERY EXPLORER */}
      <section className="px-4 sm:px-6 max-w-7xl mx-auto space-y-6">
        <div className="space-y-1">
          <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
            Explore by Korean Genre
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Dive into popular tropes and narrative styles
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { name: 'Romance & Comedy', count: '140+ Titles', icon: '💖', query: 'Romance' },
            { name: 'Revenge & Noir', count: '95+ Titles', icon: '🔪', query: 'Thriller' },
            { name: 'Historical Sageuk', count: '60+ Titles', icon: '🏯', query: 'Historical' },
            { name: 'Supernatural & Sci-Fi', count: '50+ Titles', icon: '⚡', query: 'Sci-Fi' },
            { name: 'Slice of Life & Healing', count: '80+ Titles', icon: '☕', query: 'Drama' },
            { name: 'Crime & Courtroom', count: '75+ Titles', icon: '⚖️', query: 'Crime' },
            { name: 'Horror & Zombies', count: '35+ Titles', icon: '🧟', query: 'Horror' },
            { name: 'Youth & Sports', count: '45+ Titles', icon: '🏃', query: 'Youth' },
          ].map((item) => (
            <Link
              key={item.name}
              to={`/search?genre=${encodeURIComponent(item.query)}`}
              className="p-4 rounded-2xl bg-dramify-surface/60 hover:bg-dramify-surface border border-white/5 hover:border-rose-500/30 transition-all duration-300 group flex flex-col justify-between h-28"
            >
              <span className="text-2xl">{item.icon}</span>
              <div>
                <h3 className="font-display font-bold text-sm text-white group-hover:text-rose-400 transition-colors">
                  {item.name}
                </h3>
                <span className="text-[11px] text-slate-400">{item.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
