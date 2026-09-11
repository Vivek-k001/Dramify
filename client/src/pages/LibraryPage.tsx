import React, { useState, useMemo } from 'react';
import { Bookmark, Search, SlidersHorizontal, Tv, Film, Heart } from 'lucide-react';
import { MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { EmptyState } from '../components/EmptyState';
import { Tabs } from '../components/Tabs';

type LibraryTab = 'all' | 'watching' | 'watched' | 'plan_to_watch' | 'favorites';

export const LibraryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LibraryTab>('all');
  const [libraryQuery, setLibraryQuery] = useState('');
  const [mediaTypeFilter, setMediaTypeFilter] = useState<'all' | 'tv' | 'movie'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'rating' | 'title'>('recent');

  // Simulated user library entries
  const userEntries = useMemo(() => {
    return [
      { media: MOCK_MEDIA[0], status: 'watching', isFavorite: true, userRating: 10 },
      { media: MOCK_MEDIA[1], status: 'watched', isFavorite: true, userRating: 10 },
      { media: MOCK_MEDIA[2], status: 'watching', isFavorite: false, userRating: 9 },
      { media: MOCK_MEDIA[3], status: 'watched', isFavorite: false, userRating: 8 },
      { media: MOCK_MEDIA[4], status: 'watched', isFavorite: true, userRating: 10 },
      { media: MOCK_MEDIA[5], status: 'plan_to_watch', isFavorite: false, userRating: null },
      { media: MOCK_MEDIA[7], status: 'watched', isFavorite: true, userRating: 10 },
      { media: MOCK_MEDIA[8], status: 'watched', isFavorite: false, userRating: 9 },
      { media: MOCK_MEDIA[10], status: 'plan_to_watch', isFavorite: false, userRating: null },
    ];
  }, []);

  const counts = useMemo(() => {
    return {
      all: userEntries.length,
      watching: userEntries.filter((e) => e.status === 'watching').length,
      watched: userEntries.filter((e) => e.status === 'watched').length,
      plan_to_watch: userEntries.filter((e) => e.status === 'plan_to_watch').length,
      favorites: userEntries.filter((e) => e.isFavorite).length,
    };
  }, [userEntries]);

  // Filter & Sort
  const filteredList = useMemo(() => {
    let list = [...userEntries];

    if (activeTab === 'favorites') {
      list = list.filter((e) => e.isFavorite);
    } else if (activeTab !== 'all') {
      list = list.filter((e) => e.status === activeTab);
    }

    if (mediaTypeFilter !== 'all') {
      list = list.filter((e) => e.media.media_type === mediaTypeFilter);
    }

    if (libraryQuery.trim()) {
      const q = libraryQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.media.title.toLowerCase().includes(q) ||
          e.media.korean_title.includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return (b.userRating ?? 0) - (a.userRating ?? 0);
      }
      if (sortBy === 'title') {
        return a.media.title.localeCompare(b.media.title);
      }
      return 0; // Default recent
    });

    return list;
  }, [userEntries, activeTab, mediaTypeFilter, libraryQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
            <Bookmark size={13} />
            <span>Personal Watchlist & Library</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl text-white">
            My Korean Library
          </h1>
        </div>

        {/* Quick Search inside Library */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={libraryQuery}
            onChange={(e) => setLibraryQuery(e.target.value)}
            placeholder="Search within library..."
            className="w-full pl-9 pr-4 py-2 rounded-full bg-dramify-surface/90 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500/60"
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
            { id: 'favorites', label: 'Favorites', icon: <Heart size={12} className="text-rose-400 fill-rose-400" />, count: counts.favorites },
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

      {/* Library Grid */}
      {filteredList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredList.map((entry) => (
            <MediaCard key={entry.media.id} media={entry.media} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No titles in this list"
          description="Your library list is currently empty. Explore trending Korean dramas or movies to start building your collection."
          actionText="Explore Titles"
          actionLink="/discover"
        />
      )}
    </div>
  );
};
