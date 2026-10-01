import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bookmark,
  Search,
  SlidersHorizontal,
  Tv,
  Film,
  Heart,
  Sparkles,
  Shuffle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { Tabs } from '../components/Tabs';
import { WatchStatusButton } from '../components/WatchStatusButton';
import { useAuth } from '../context/AuthContext';
import { interactionApi } from '../services/api';
import { MediaItem, WatchStatus } from '../types/media';

type LibraryTab = 'all' | 'watching' | 'watched' | 'plan_to_watch' | 'favorites';

interface LibraryEntry {
  id: string | number;
  media: MediaItem;
  status: WatchStatus | null;
  isFavorite: boolean;
  userRating: number | null;
}

// Fisher-Yates shuffle helper
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const LibraryPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'tv' | 'movie'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent');

  // User's actual library entries
  const [userEntries, setUserEntries] = useState<LibraryEntry[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);

  // Recommendations for logged-in user
  const [recommendedTitles, setRecommendedTitles] = useState<MediaItem[]>(() => {
    const topDramas = MOCK_MEDIA.filter((m) => m.dramify_community_rating >= 8.8);
    return shuffleArray(topDramas).slice(0, 5);
  });

  // Preview titles for guest user
  const previewTitles = useMemo(() => {
    return MOCK_MEDIA.filter((m) => m.dramify_community_rating >= 8.9).slice(0, 5);
  }, []);

  // Fetch real library items when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserEntries([]);
      return;
    }

    setLoadingLibrary(true);
    interactionApi
      .getLibrary()
      .then((serverItems) => {
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          const mapped: LibraryEntry[] = serverItems.map((item: any) => {
            const existingMedia = MOCK_MEDIA.find((m) => m.tmdb_id === item.tmdbId);
            const media: MediaItem = (existingMedia || {
              id: item.tmdbId,
              tmdb_id: item.tmdbId,
              title: item.title,
              original_title: item.title,
              korean_title: item.koreanTitle || item.title,
              media_type: item.mediaType || 'tv',
              poster_path: item.posterPath || '',
              backdrop_path: item.posterPath || '',
              release_date: `${item.releaseYear || 2024}-01-01`,
              release_year: item.releaseYear || 2024,
              genres: [],
              overview: '',
              vote_average: 8.5,
              vote_count: 100,
              dramify_community_rating: item.rating || 9.0,
              dramify_ratings_count: 1,
              status: 'Released',
              cast: [],
            }) as MediaItem;
            return {
              id: item._id || item.tmdbId,
              media,
              status: (item.status as WatchStatus) || null,
              isFavorite: !!item.isFavorite,
              userRating: item.rating || null,
            };
          });
          setUserEntries(mapped);
        } else {
          // New account: empty library initially
          setUserEntries([]);
        }
      })
      .catch(() => {
        setUserEntries([]);
      })
      .finally(() => {
        setLoadingLibrary(false);
      });
  }, [isAuthenticated, user]);

  const handleShuffleRecommendations = () => {
    const topDramas = MOCK_MEDIA.filter((m) => m.dramify_community_rating >= 8.8);
    setRecommendedTitles(shuffleArray(topDramas).slice(0, 5));
  };

  const handleRecommendationStatusChange = async (media: MediaItem, newStatus: WatchStatus | null) => {
    setUserEntries((prev) => {
      const idx = prev.findIndex((e) => e.media.tmdb_id === media.tmdb_id);
      if (!newStatus) {
        return prev.filter((e) => e.media.tmdb_id !== media.tmdb_id);
      }
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], status: newStatus };
        return updated;
      }
      return [
        {
          id: `ent-${Date.now()}`,
          media,
          status: newStatus,
          isFavorite: false,
          userRating: null,
        },
        ...prev,
      ];
    });

    if (isAuthenticated) {
      try {
        await interactionApi.saveInteraction({
          tmdbId: media.tmdb_id,
          mediaType: media.media_type,
          title: media.title,
          posterPath: media.poster_path,
          koreanTitle: media.korean_title,
          releaseYear: media.release_year,
          status: newStatus,
        });
      } catch (err) {
        console.error('Error saving interaction from recommendations:', err);
      }
    }
  };

  // -------------------------------------------------------------
  // GUEST STATE (Non-account user)
  // -------------------------------------------------------------
  if (!isAuthenticated || !user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 pb-20">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
              <Bookmark size={13} />
              <span>Personal Watchlist & Library</span>
            </div>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              My Korean Library
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track what you&apos;re watching, build your watchlist, and rate your favorite K-dramas
            </p>
          </div>
        </div>

        {/* Authentication Card */}
        <div className="relative p-8 sm:p-12 rounded-3xl bg-[#101217] border border-white/10 shadow-2xl overflow-hidden max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-crimson/15 text-rose-400 border border-crimson/25 mx-auto flex items-center justify-center shadow-lg shadow-crimson/20">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Sign In to View Your Library
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Create an account or sign in to track your K-drama watch status (Watching, Watched, Plan to Watch), rate series from 1 to 10, and receive personalized recommendations.
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
        </div>

        {/* Preview of Titles you can track */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
                <Sparkles size={17} className="text-rose-400" />
                <span>Trending Titles Ready to Add to Your Watchlist</span>
              </h3>
              <p className="text-xs text-slate-400">
                Explore the most popular Korean series and movies you can catalogue after signing in
              </p>
            </div>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors"
            >
              <span>Browse All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {previewTitles.map((media) => (
              <MediaCard key={media.id} media={media} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED USER STATE
  // -------------------------------------------------------------
  const counts = {
    all: userEntries.length,
    watching: userEntries.filter((e) => e.status === 'watching').length,
    watched: userEntries.filter((e) => e.status === 'watched').length,
    plan_to_watch: userEntries.filter((e) => e.status === 'plan_to_watch').length,
    favorites: userEntries.filter((e) => e.isFavorite).length,
  };

  // Filter & Sort
  const filteredList = userEntries.filter((entry) => {
    if (activeTab === 'favorites' && !entry.isFavorite) return false;
    if (activeTab !== 'all' && activeTab !== 'favorites' && entry.status !== activeTab) return false;
    if (mediaTypeFilter !== 'all' && entry.media.media_type !== mediaTypeFilter) return false;
    if (libraryQuery.trim()) {
      const q = libraryQuery.toLowerCase();
      return (
        entry.media.title.toLowerCase().includes(q) ||
        entry.media.korean_title.includes(q)
      );
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') {
      return (b.userRating ?? 0) - (a.userRating ?? 0);
    }
    if (sortBy === 'title') {
      return a.media.title.localeCompare(b.media.title);
    }
    return 0; // Default recent
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            <Bookmark size={13} />
            <span>Personal Library &bull; @{user.username}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            {user.displayName || user.username}&apos;s Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {userEntries.length} {userEntries.length === 1 ? 'title' : 'titles'} catalogued in your personal collection
          </p>
        </div>

        {/* Quick Search inside Library */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={libraryQuery}
            onChange={(e) => setLibraryQuery(e.target.value)}
            placeholder="Search within library..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-[#141620] border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/60"
          />
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Status Tabs */}
        <Tabs<LibraryTab>
          activeTab={activeTab}
          onChange={setActiveTab}
          tabs={[
            { id: 'all', label: 'All', count: counts.all },
            { id: 'watching', label: 'Watching', count: counts.watching },
            { id: 'watched', label: 'Watched', count: counts.watched },
            { id: 'plan_to_watch', label: 'Plan to Watch', count: counts.plan_to_watch },
            {
              id: 'favorites',
              label: 'Favorites',
              icon: <Heart size={12} className="text-rose-400 fill-rose-400" />,
              count: counts.favorites,
            },
          ]}
          size="sm"
        />

        {/* Format & Sort Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Drama vs Movie filter */}
          <div className="flex items-center p-1 rounded-full bg-black/40 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setMediaTypeFilter('all')}
              className={`px-3 py-1 rounded-full ${mediaTypeFilter === 'all' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              All Types
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeFilter('tv')}
              className={`px-3 py-1 rounded-full flex items-center gap-1 ${mediaTypeFilter === 'tv' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              <Tv size={12} /> K-Dramas
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeFilter('movie')}
              className={`px-3 py-1 rounded-full flex items-center gap-1 ${mediaTypeFilter === 'movie' ? 'bg-white/15 text-white font-semibold' : 'text-slate-400 hover:text-white'}`}
            >
              <Film size={12} /> K-Movies
            </button>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-300">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              <option value="recent" className="bg-slate-900">Recently Added</option>
              <option value="rating" className="bg-slate-900">My Rating</option>
              <option value="title" className="bg-slate-900">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Library Grid or Empty State */}
      {loadingLibrary ? (
        <div className="p-12 text-center text-slate-400 text-xs">
          Loading your personal library...
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredList.map((entry) => (
            <MediaCard key={entry.id} media={entry.media} />
          ))}
        </div>
      ) : (
        <div className="p-8 sm:p-12 rounded-3xl bg-[#101217] border border-white/10 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-slate-400">
            <Bookmark size={20} />
          </div>
          <h3 className="font-display font-bold text-lg text-white">
            {activeTab === 'all'
              ? 'Your Library is Currently Empty'
              : `No titles in "${activeTab.replace(/_/g, ' ')}"`}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose from the recommendations below to mark series as Watching or Plan to Watch, and they will show up in your library.
          </p>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PERSONALIZED RECOMMENDATIONS FOR LOGGED IN USER               */}
      {/* ------------------------------------------------------------- */}
      <section className="space-y-6 pt-10 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-rose-400" />
              <h2 className="font-display font-bold text-xl sm:text-2xl text-white">
                Recommended For You
              </h2>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-crimson/15 text-rose-300 border border-crimson/25 hidden sm:inline-block">
                Curated for @{user.username}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Personalized K-drama &amp; film picks tailored to your taste profile
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleShuffleRecommendations}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-xs font-semibold text-slate-300 hover:text-white border border-white/10 transition-all cursor-pointer group"
              title="Shuffle Recommendations"
            >
              <Shuffle size={13} className="text-rose-400 group-hover:rotate-180 transition-transform duration-300" />
              <span>Shuffle Picks</span>
            </button>
            <Link
              to="/discover"
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors group"
            >
              <span>Discover More</span>
              <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Recommended Cards with Quick Add */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {recommendedTitles.map((media) => {
            const currentEntry = userEntries.find((e) => e.media.tmdb_id === media.tmdb_id);
            return (
              <div key={media.id} className="space-y-2">
                <MediaCard media={media} />
                <div className="pt-1 flex items-center justify-between">
                  <WatchStatusButton
                    size="sm"
                    initialStatus={currentEntry?.status || null}
                    onStatusChange={(newStatus) => handleRecommendationStatusChange(media, newStatus)}
                  />
                  <span className="text-[10px] font-semibold text-amber-400">
                    ★ {media.dramify_community_rating}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
