import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, SlidersHorizontal, Tv, Film } from 'lucide-react';
import { MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { MediaCardSkeleton } from '../components/MediaCardSkeleton';
import { EmptyState } from '../components/EmptyState';
import { Tabs } from '../components/Tabs';

type FilterType = 'all' | 'tv' | 'movie';

export const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || '';

  const [query, setQuery] = useState(initialQuery);
  const [activeType, setActiveType] = useState<FilterType>('all');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'year'>('popularity');
  const [isLoading, setIsLoading] = useState(false);

  // Sync state when URL params change
  useEffect(() => {
    const q = searchParams.get('q') || '';
    const g = searchParams.get('genre') || '';
    setQuery(q);
    setSelectedGenre(g);
  }, [searchParams]);

  // Handle typing with debounced URL update
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsLoading(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
      const newParams = new URLSearchParams(searchParams);
      if (val.trim()) {
        newParams.set('q', val);
      } else {
        newParams.delete('q');
      }
      setSearchParams(newParams, { replace: true });
    }, 250);

    return () => clearTimeout(timer);
  };

  const clearSearch = () => {
    setQuery('');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    setSearchParams(newParams, { replace: true });
  };

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let list = [...MOCK_MEDIA];

    // Query filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.original_title.toLowerCase().includes(q) ||
          item.korean_title.includes(q) ||
          item.genres.some((g) => g.toLowerCase().includes(q)) ||
          item.cast.some((c) => c.name.toLowerCase().includes(q))
      );
    }

    // Media type filter
    if (activeType !== 'all') {
      list = list.filter((item) => item.media_type === activeType);
    }

    // Genre filter
    if (selectedGenre) {
      list = list.filter((item) =>
        item.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase()))
      );
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'rating') {
        return b.dramify_community_rating - a.dramify_community_rating;
      }
      if (sortBy === 'year') {
        return b.release_year - a.release_year;
      }
      return b.vote_count - a.vote_count;
    });

    return list;
  }, [query, activeType, selectedGenre, sortBy]);

  const allGenres = useMemo(() => {
    const set = new Set<string>();
    MOCK_MEDIA.forEach((m) => m.genres.forEach((g) => set.add(g)));
    return Array.from(set);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Search Korean Entertainment
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Discover K-Dramas and K-Movies across all networks, genres, and cast members.
        </p>

        {/* Search Input */}
        <div className="relative flex items-center shadow-2xl">
          <input
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Type 'Moving', '사랑의 불시착', 'Parasite', 'Son Ye-jin'..."
            className="w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-full bg-dramify-surface/90 border border-white/15 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-rose-500/60 focus:ring-2 focus:ring-rose-500/20 transition-all shadow-inner"
            autoFocus
          />
          <Search size={18} className="absolute left-4 text-slate-400 pointer-events-none" />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-4 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 rounded-2xl bg-dramify-surface/50 border border-white/5">
        {/* Media Type Tabs */}
        <Tabs<FilterType>
          activeTab={activeType}
          onChange={setActiveType}
          tabs={[
            { id: 'all', label: 'All Titles', count: MOCK_MEDIA.length },
            { id: 'tv', label: 'K-Dramas', icon: <Tv size={13} />, count: MOCK_MEDIA.filter((m) => m.media_type === 'tv').length },
            { id: 'movie', label: 'K-Movies', icon: <Film size={13} />, count: MOCK_MEDIA.filter((m) => m.media_type === 'movie').length },
          ]}
          size="sm"
        />

        {/* Genre & Sort Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Genre Dropdown */}
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-rose-500/50"
          >
            <option value="">All Genres</option>
            {allGenres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 border border-white/10 text-xs text-slate-200">
            <SlidersHorizontal size={12} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none"
            >
              <option value="popularity" className="bg-slate-900">Popularity</option>
              <option value="rating" className="bg-slate-900">Highest Rated</option>
              <option value="year" className="bg-slate-900">Release Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>
          Showing <strong className="text-white">{filteredResults.length}</strong> {filteredResults.length === 1 ? 'title' : 'titles'}
          {query && (
            <> for &ldquo;<span className="text-rose-400">{query}</span>&rdquo;</>
          )}
        </span>
        {selectedGenre && (
          <button
            type="button"
            onClick={() => setSelectedGenre('')}
            className="text-rose-400 hover:underline inline-flex items-center gap-1"
          >
            Clear genre filter ({selectedGenre}) <X size={12} />
          </button>
        )}
      </div>

      {/* Results Grid / Loading State / Empty State */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <MediaCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredResults.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredResults.map((media) => (
            <MediaCard key={media.id} media={media} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No titles found"
          description={`We couldn't find any Korean dramas or movies matching "${query}". Try searching by Hangul title, actor, or clearing filters.`}
          actionText="Reset Search"
          onActionClick={clearSearch}
        />
      )}
    </div>
  );
};
