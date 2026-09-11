import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Trophy,
  Star,
  Tv,
  Film,
  Sparkles,
  Edit3,
  Share2,
  Check,
  Search,
  SlidersHorizontal,
  Flame,
  Heart
} from 'lucide-react';
import { MOCK_USER_PROFILE, MOCK_REVIEWS, MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { cn } from '../utils/cn';

type MediaSlideType = 'tv' | 'movie';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  // 1. Sliding Pill Section: 'tv' (K-Drama) or 'movie' (K-Movie)
  const [slideType, setSlideType] = useState<MediaSlideType>('tv');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'year' | 'title'>('default');
  const [copiedLink, setCopiedLink] = useState(false);

  const profile = MOCK_USER_PROFILE;
  const isSelf = !username || username === profile.username;

  // Split all 147 titles into Dramas and Movies
  const allWatchedTitles = MOCK_MEDIA;
  const kdramas = useMemo(() => allWatchedTitles.filter((m) => m.media_type === 'tv'), [allWatchedTitles]);
  const kmovies = useMemo(() => allWatchedTitles.filter((m) => m.media_type === 'movie'), [allWatchedTitles]);

  // Active collection based on sliding pill
  const activeList = slideType === 'tv' ? kdramas : kmovies;

  // Filtered & Sorted list
  const filteredCollection = useMemo(() => {
    let list = [...activeList];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.korean_title.includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.dramify_community_rating - a.dramify_community_rating);
    } else if (sortBy === 'year') {
      list.sort((a, b) => b.release_year - a.release_year);
    } else if (sortBy === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  }, [activeList, searchQuery, sortBy]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 pb-28">
      {/* 1. FAN CARD PROFILE HEADER */}
      <div className="relative rounded-4xl bg-gradient-to-b from-dramify-surface via-dramify-card to-dramify-surface border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-48 bg-rose-600/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10 text-center md:text-left">
          {/* Avatar with Double-Bezel Border */}
          <div className="double-bezel flex-shrink-0">
            <div className="double-bezel-inner w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-800">
              <img
                src={profile.avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Profile Identity Details */}
          <div className="flex-grow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {profile.displayName}
                  </h1>
                  <span className="text-[11px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-0.5 rounded-full border border-rose-500/20 flex items-center gap-1">
                    <Flame size={12} className="text-rose-400" />
                    <span>Hallyu Master</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  @{profile.username} &bull; Member since {profile.joinDate}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Share Profile'}</span>
                </button>

                {isSelf && (
                  <button
                    type="button"
                    className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5"
                  >
                    <Edit3 size={13} />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {profile.bio}
            </p>
          </div>
        </div>

        {/* 2. STATS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Total Watched
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {allWatchedTitles.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              K-Dramas
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-rose-400">
              {kdramas.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              K-Movies
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-cyan-400">
              {kmovies.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-black/40 border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Average Rating
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-amber-400">
              {profile.stats.avgRating} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT SLIDING NAVBAR PILL (KDRAMA vs KMOVIE) */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
          Explore Watched Universe
        </span>

        {/* The Sliding Pill Container */}
        <div className="relative p-1.5 rounded-full bg-dramify-surface/90 border border-white/15 shadow-2xl backdrop-blur-xl flex items-center max-w-md w-full">
          {/* Animated Sliding Background Pill */}
          <div
            className={cn(
              'absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg',
              slideType === 'tv'
                ? 'left-1.5 bg-gradient-to-r from-rose-600 to-rose-500 shadow-rose-950/60'
                : 'left-[calc(50%+3px)] bg-gradient-to-r from-cyan-600 to-teal-500 shadow-cyan-950/60'
            )}
          />

          {/* K-Dramas Button */}
          <button
            type="button"
            onClick={() => setSlideType('tv')}
            className={cn(
              'relative z-10 w-1/2 py-3 rounded-full flex items-center justify-center gap-2.5 font-display font-bold text-xs sm:text-sm transition-colors duration-200',
              slideType === 'tv' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Tv size={16} />
            <span>K-Dramas</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                slideType === 'tv' ? 'bg-black/25 text-white' : 'bg-white/5 text-slate-400'
              )}
            >
              {kdramas.length}
            </span>
          </button>

          {/* K-Movies Button */}
          <button
            type="button"
            onClick={() => setSlideType('movie')}
            className={cn(
              'relative z-10 w-1/2 py-3 rounded-full flex items-center justify-center gap-2.5 font-display font-bold text-xs sm:text-sm transition-colors duration-200',
              slideType === 'movie' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Film size={16} />
            <span>K-Movies</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-[11px] font-semibold',
                slideType === 'movie' ? 'bg-black/25 text-white' : 'bg-white/5 text-slate-400'
              )}
            >
              {kmovies.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC TOP 3 PODIUM (Updates based on Sliding Pill!) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="font-display font-bold text-xl text-white">
              {slideType === 'tv' ? 'Top 3 Favorite K-Dramas' : 'Top 3 Favorite K-Movies'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">Personal Podium</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(slideType === 'tv' ? profile.topThreeDramas : profile.topThreeMovies).map((item, idx) => {
            const medals = ['🥇 #1 Gold Pick', '🥈 #2 Silver Pick', '🥉 #3 Bronze Pick'];
            const badgeColors = [
              'bg-amber-400/10 border-amber-400/40 text-amber-300 shadow-amber-500/10',
              'bg-slate-300/10 border-slate-300/40 text-slate-200 shadow-slate-400/10',
              'bg-amber-700/10 border-amber-700/40 text-amber-400 shadow-amber-800/10',
            ];
            return (
              <div key={item.id} className="space-y-2">
                <div className={`px-3 py-1 rounded-full text-xs font-bold text-center border shadow-sm ${badgeColors[idx]}`}>
                  {medals[idx]}
                </div>
                <MediaCard media={item} rank={idx + 1} />
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. WATCHED COLLECTION SECTION */}
      <section className="space-y-6 pt-6 border-t border-white/10">
        {/* Header with Search & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-xl sm:text-2xl text-white flex items-center gap-2">
              {slideType === 'tv' ? (
                <>
                  <Tv size={20} className="text-rose-400" />
                  <span>All Watched K-Dramas ({kdramas.length})</span>
                </>
              ) : (
                <>
                  <Film size={20} className="text-cyan-400" />
                  <span>All Watched K-Movies ({kmovies.length})</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every title verified and catalogued in your Dramify profile
            </p>
          </div>

          {/* Controls: Search and Sort */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search within collection */}
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${slideType === 'tv' ? 'dramas' : 'movies'}...`}
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-dramify-surface/90 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/50"
              />
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-300">
              <SlidersHorizontal size={12} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none"
              >
                <option value="default" className="bg-slate-900">List Order</option>
                <option value="rating" className="bg-slate-900">Highest Rated</option>
                <option value="year" className="bg-slate-900">Release Year</option>
                <option value="title" className="bg-slate-900">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredCollection.map((media, idx) => (
            <MediaCard key={media.id} media={media} rank={idx + 1} />
          ))}
        </div>

        {filteredCollection.length === 0 && (
          <div className="text-center py-12 p-8 rounded-3xl bg-dramify-surface/40 border border-white/5">
            <p className="text-sm text-slate-400">
              No titles match "{searchQuery}" in this category.
            </p>
          </div>
        )}
      </section>

      {/* 6. PUBLIC REVIEWS SECTION */}
      <section className="space-y-4 pt-6 border-t border-white/10">
        <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Sparkles size={18} className="text-amber-400" />
          <span>My Featured Reviews ({MOCK_REVIEWS.length})</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MOCK_REVIEWS.map((rev) => {
            const mediaItem = allWatchedTitles.find((m) => m.tmdb_id === rev.tmdb_id);
            return (
              <div
                key={rev.id}
                className="p-5 rounded-3xl bg-dramify-surface/50 border border-white/5 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 inline-flex items-center gap-1">
                      <Star size={11} className="fill-amber-400" />
                      {rev.rating}/10
                    </span>
                    <span className="text-[11px] text-slate-500">{rev.createdAt}</span>
                  </div>

                  {mediaItem && (
                    <Link
                      to={`/media/${mediaItem.media_type}/${mediaItem.tmdb_id}`}
                      className="font-display font-bold text-sm text-white hover:text-rose-400 transition-colors block"
                    >
                      {mediaItem.title} ({mediaItem.korean_title})
                    </Link>
                  )}

                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-4">
                    "{rev.content}"
                  </p>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-white/5 flex items-center gap-1">
                  <Heart size={11} className="text-rose-400 fill-rose-400" />
                  <span>{rev.likesCount} community likes</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
