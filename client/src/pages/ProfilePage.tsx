import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  Flame,
  User as UserIcon,
  LogOut
} from 'lucide-react';
import { MOCK_USER_PROFILE, MOCK_MEDIA } from '../data/mockMedia';
import { USER_WATCHED_TITLES } from '../data/userWatchedList';
import { MediaCard } from '../components/MediaCard';
import { ProfileAvatarPicker } from '../components/ProfileAvatarPicker';
import { getSavedAvatar, saveAvatar, ProfileAvatar } from '../data/avatars';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { cn } from '../utils/cn';

type MediaSlideType = 'tv' | 'movie';

export const ProfilePage: React.FC = () => {
  const { username } = useParams<{ username?: string }>();
  const { user: currentUser, isAuthenticated, updateUser, logout } = useAuth();

  // If user visits /profile while not logged in:
  if (!username && !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-[#101217] border border-white/10 shadow-2xl space-y-6">
          <div className="w-16 h-16 rounded-full bg-crimson/15 text-rose-400 border border-crimson/25 mx-auto flex items-center justify-center">
            <UserIcon size={28} />
          </div>
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Create Your Dramify Profile
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Sign in or create an account to start cataloging your watched K-Dramas, build your personal Top 3 podium, and discover taste matches.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/15 transition-all"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-crimson hover:bg-crimsonHover text-white text-xs font-bold shadow-lg shadow-crimson/30 transition-all hover:scale-105"
            >
              Create Account
            </Link>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Want to see an example?{' '}
              <Link to="/u/vivek" className="text-rose-400 hover:underline font-medium">
                View Curator Vivek&apos;s 148 tracked titles &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 1. Sliding Pill Section: 'tv' (K-Drama) or 'movie' (K-Movie)
  const [slideType, setSlideType] = useState<MediaSlideType>('tv');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'year' | 'title'>('default');
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // Determine profile identity:
  const isCurator = username?.toLowerCase() === 'vivek';
  const isSelf = (!username && !!currentUser) || (!!username && !!currentUser && currentUser.username.toLowerCase() === username.toLowerCase());

  const profile = useMemo(() => {
    if (isCurator) {
      return MOCK_USER_PROFILE;
    }
    if (isSelf && currentUser) {
      return {
        username: currentUser.username,
        displayName: currentUser.displayName || currentUser.username,
        avatarUrl: currentUser.avatarUrl || getSavedAvatar(),
        bio: currentUser.bio || 'Hallyu enthusiast tracking Korean dramas and films on Dramify.',
        joinDate: 'Joined recently',
        stats: {
          watched: USER_WATCHED_TITLES.length,
          favorites: 18,
          watching: 3,
          planToWatch: 12,
          avgRating: 9.1,
        },
        topThreeDramas: MOCK_USER_PROFILE.topThreeDramas,
        topThreeMovies: MOCK_USER_PROFILE.topThreeMovies,
      };
    }
    // Viewing another user
    return {
      username: username || 'user',
      displayName: username || 'User',
      avatarUrl: getSavedAvatar(),
      bio: 'Drama fan on Dramify.',
      joinDate: '2024',
      stats: {
        watched: 24,
        favorites: 8,
        watching: 2,
        planToWatch: 10,
        avgRating: 8.8,
      },
      topThreeDramas: MOCK_USER_PROFILE.topThreeDramas,
      topThreeMovies: MOCK_USER_PROFILE.topThreeMovies,
    };
  }, [isCurator, isSelf, currentUser, username]);

  const [avatarUrl, setAvatarUrl] = useState<string>(() => profile.avatarUrl || getSavedAvatar());

  useEffect(() => {
    setAvatarUrl(profile.avatarUrl || getSavedAvatar());
  }, [profile.avatarUrl]);

  // Split titles into Dramas and Movies
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
    if (isSelf) {
      updateUser({ avatarUrl: avatar.url });
      profileApi.updateProfile({ avatarUrl: avatar.url }).catch(() => {});
    }
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
                  className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedLink ? <Check size={13} className="text-emerald-400" /> : <Share2 size={13} />}
                  <span>{copiedLink ? 'Copied' : 'Share Profile'}</span>
                </button>

                {!isSelf && currentUser && (
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                    <Sparkles size={13} className="text-rose-400" />
                    <span>94% Taste Match</span>
                  </div>
                )}

                {isSelf && (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAvatarPicker(true)}
                      className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-crimson text-white text-xs font-semibold border border-white/15 transition-all flex items-center gap-1.5 group cursor-pointer"
                    >
                      <Sparkles size={13} className="text-rose-400 group-hover:text-white transition-colors" />
                      <span>Change Avatar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-xs font-medium border border-white/10 transition-colors flex items-center gap-1.5 cursor-pointer"
                      title="Sign Out"
                    >
                      <LogOut size={13} />
                      <span className="hidden sm:inline">Sign Out</span>
                    </button>
                  </>
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
