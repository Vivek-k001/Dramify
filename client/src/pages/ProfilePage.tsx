import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Trophy,
  Tv,
  Film,
  Sparkles,
  Camera,
  Share2,
  Check,
  Search,
  SlidersHorizontal,
  Flame
} from 'lucide-react';
import { MOCK_USER_PROFILE, MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { ProfileAvatarPicker } from '../components/ProfileAvatarPicker';
import { getSavedAvatar, saveAvatar, ProfileAvatar } from '../data/avatars';
import { cn } from '../utils/cn';

type MediaSlideType = 'tv' | 'movie';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  // 1. Sliding Pill Section: 'tv' (K-Drama) or 'movie' (K-Movie)
  const [slideType, setSlideType] = useState<MediaSlideType>('tv');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'year' | 'title'>('default');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => getSavedAvatar());

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

  const handleAvatarSelect = (avatar: ProfileAvatar) => {
    setAvatarUrl(avatar.url);
    saveAvatar(avatar.url);
    setShowAvatarPicker(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-10 pb-28">
      {/* 1. FAN CARD PROFILE HEADER */}
      <div className="relative rounded-3xl bg-[#101217] border border-white/10 p-6 sm:p-10 shadow-2xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8 relative z-10 text-center md:text-left">
          {/* Avatar with Interactive Edit Overlay */}
          <div className="relative group/avatar flex-shrink-0 cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 group-hover/avatar:border-crimson shadow-xl transition-all duration-300">
              <img
                src={avatarUrl}
                alt={profile.displayName}
                className="w-full h-full object-cover"
              />
            </div>
            {isSelf && (
              <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover/avatar:opacity-100 flex flex-col items-center justify-center text-white text-[11px] font-bold transition-opacity backdrop-blur-[2px]">
                <Camera size={18} className="mb-0.5 text-rose-400" />
                <span>Change</span>
              </div>
            )}
          </div>

          {/* Profile Identity Details */}
          <div className="flex-grow space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                    {profile.displayName}
                  </h1>
                  <span className="text-[11px] font-semibold text-rose-300 bg-crimson/15 px-2.5 py-0.5 rounded-full border border-crimson/25 flex items-center gap-1">
                    <Flame size={12} className="text-rose-400" />
                    <span>Hallyu Devotee</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
                  @{profile.username} &bull; {profile.stats.watched} Titles Watched ({kdramas.length} K-Dramas &bull; {kmovies.length} K-Movies)
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Share Profile'}</span>
                </button>

                {isSelf && (
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-crimson text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 group"
                  >
                    <Sparkles size={13} className="text-rose-400 group-hover:text-white transition-colors" />
                    <span>Change Avatar</span>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/8">
          <div className="p-3.5 rounded-2xl bg-[#141620] border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Total Watched
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {allWatchedTitles.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141620] border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              K-Dramas
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-rose-400">
              {kdramas.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141620] border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              K-Movies
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-cyan-400">
              {kmovies.length}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#141620] border border-white/5 text-center">
            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block mb-1">
              Average Rating
            </span>
            <span className="font-display font-extrabold text-2xl sm:text-3xl text-amber-400">
              {profile.stats.avgRating} <span className="text-xs font-normal text-slate-400">/ 10</span>
            </span>
          </div>
        </div>
      </div>

      {/* 3. PROMINENT SLIDING NAVBAR PILL (KDRAMA vs KMOVIE) - PRESERVED & POLISHED */}
      <div className="flex flex-col items-center justify-center space-y-3 pt-2">
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">
          Explore Watched Universe
        </span>

        {/* The Sliding Pill Container */}
        <div className="relative p-1.5 rounded-full bg-[#12141B] border border-white/10 shadow-2xl flex items-center max-w-md w-full">
          {/* Animated Sliding Background Pill */}
          <div
            className={cn(
              'absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] rounded-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-lg',
              slideType === 'tv'
                ? 'left-1.5 bg-crimson shadow-crimson/30'
                : 'left-[calc(50%+3px)] bg-slate-800 border border-white/10'
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
                slideType === 'tv' ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
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
                slideType === 'movie' ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-400'
              )}
            >
              {kmovies.length}
            </span>
          </button>
        </div>
      </div>

      {/* 4. DYNAMIC TOP 3 PODIUM (Updates dynamically with Sliding Pill!) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            <h2 className="font-display font-bold text-xl text-white">
              {slideType === 'tv' ? 'Top 3 Favorite K-Dramas' : 'Top 3 Favorite K-Movies'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">Top 3 Favorites</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {(slideType === 'tv' ? profile.topThreeDramas : profile.topThreeMovies).map((item, idx) => {
            const picks = ['1st Pick', '2nd Pick', '3rd Pick'];
            const badgeColors = [
              'bg-crimson/15 border-crimson/40 text-red-200',
              'bg-white/10 border-white/20 text-slate-200',
              'bg-white/5 border-white/10 text-slate-300',
            ];
            return (
              <div key={item.id} className="space-y-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-bold text-center border tracking-wide ${badgeColors[idx]}`}>
                  {picks[idx]}
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
                  <Film size={20} className="text-amber-400" />
                  <span>All Watched K-Movies ({kmovies.length})</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Every title catalogued and verified in your Dramify library
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
                className="w-full pl-8 pr-3 py-1.5 rounded-full bg-[#141620] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-crimson"
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
          {filteredCollection.map((media) => (
            <MediaCard key={media.id} media={media} rank={media.id} />
          ))}
        </div>
      </section>

      {/* 6. MODAL AVATAR PICKER */}
      {showAvatarPicker && (
        <ProfileAvatarPicker
          selectedAvatarUrl={avatarUrl}
          onSelectAvatar={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
          asModal={true}
        />
      )}
    </div>
  );
};
