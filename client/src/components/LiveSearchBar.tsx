import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, Star, Film, Tv, X, Sparkles } from 'lucide-react';
import { tmdbApi } from '../services/api';
import { MOCK_MEDIA } from '../data/mockMedia';

interface LiveSearchBarProps {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  onSelect?: () => void;
}

interface SearchResultItem {
  id: number;
  tmdb_id: number;
  title: string;
  korean_title: string;
  media_type: 'tv' | 'movie';
  release_year: number;
  poster_path: string;
  vote_average: number;
  overview?: string;
  source: 'local' | 'tmdb';
}

export const LiveSearchBar: React.FC<LiveSearchBarProps> = ({
  placeholder = 'Search by title (Vincenzo, 반짝이는 워터멜론), cast or genre...',
  className = '',
  autoFocus = false,
  onSelect,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);

    const timer = setTimeout(async () => {
      try {
        const qLower = trimmed.toLowerCase();

        // 1. Instant local search from curated library
        const localMatches: SearchResultItem[] = MOCK_MEDIA.filter(
          (item) =>
            item.title.toLowerCase().includes(qLower) ||
            item.original_title.toLowerCase().includes(qLower) ||
            item.korean_title.includes(trimmed) ||
            item.cast.some((c) => c.name.toLowerCase().includes(qLower))
        ).slice(0, 5).map((item) => ({
          id: item.id,
          tmdb_id: item.tmdb_id,
          title: item.title,
          korean_title: item.korean_title,
          media_type: item.media_type,
          release_year: item.release_year,
          poster_path: item.poster_path,
          vote_average: item.vote_average,
          overview: item.overview,
          source: 'local' as const,
        }));

        // 2. Fetch live results from TMDB via our server API
        let tmdbMatches: SearchResultItem[] = [];
        try {
          const res = await tmdbApi.search(trimmed, 'all', 1);
          if (res?.results && Array.isArray(res.results)) {
            tmdbMatches = res.results
              .filter((item: any) => {
                // Strict Korean Filter: must be Korean origin language ('ko') or origin country 'KR'
                const isKorean =
                  item.original_language === 'ko' ||
                  (Array.isArray(item.origin_country) && item.origin_country.includes('KR'));
                
                if (!isKorean) return false;

                // Deduplicate against local matches
                return !localMatches.some((lm) => lm.tmdb_id === item.id);
              })
              .slice(0, 6)
              .map((item: any) => {
                const isTv = item.media_type === 'tv' || (!item.title && !!item.name);
                const title = isTv ? item.name : item.title;
                const originalTitle = isTv ? item.original_name : item.original_title;
                const dateStr = isTv ? item.first_air_date : item.release_date;
                const year = dateStr ? new Date(dateStr).getFullYear() : 0;
                
                // Poster path formatting
                let poster = '';
                if (item.poster_path) {
                  poster = item.poster_path.startsWith('http')
                    ? item.poster_path
                    : `https://image.tmdb.org/t/p/w342${item.poster_path}`;
                }

                return {
                  id: item.id,
                  tmdb_id: item.id,
                  title: title || originalTitle || 'Untitled',
                  korean_title: originalTitle || '',
                  media_type: (isTv ? 'tv' : 'movie') as 'tv' | 'movie',
                  release_year: year,
                  poster_path: poster,
                  vote_average: Number(item.vote_average?.toFixed(1)) || 0,
                  overview: item.overview,
                  source: 'tmdb' as const,
                };
              });
          }
        } catch (err) {
          console.warn('Live TMDB search query fallback:', err);
        }

        // Combine: Curated local first, then live TMDB hits
        const combined = [...localMatches, ...tmdbMatches].slice(0, 8);
        setResults(combined);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectMedia = (item: SearchResultItem) => {
    setIsOpen(false);
    setQuery('');
    if (onSelect) onSelect();
    navigate(`/media/${item.media_type}/${item.tmdb_id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelectMedia(results[selectedIndex]);
      } else {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Input Shell */}
      <div className="relative flex items-center">
        <div className="absolute left-3.5 sm:left-4 text-slate-400 pointer-events-none flex items-center">
          {isLoading ? (
            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-crimson" />
          ) : (
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-10 sm:pl-12 pr-10 py-3 sm:py-3.5 bg-dramify-surface/90 hover:bg-dramify-surface border border-white/10 focus:border-crimson/50 rounded-2xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-crimson/20 shadow-xl transition-all"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3.5 text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Floating Dropdown Results Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 bg-[#0E0F14]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden divide-y divide-white/5 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header Indicator */}
          <div className="px-4 py-2 bg-white/[0.02] flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <Sparkles className="w-3 h-3 text-crimson" />
              Live Autocomplete & Global TMDB
            </span>
            <span>{results.length} found</span>
          </div>

          {/* Results List */}
          <div className="max-h-[380px] sm:max-h-[440px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {results.map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={`${item.media_type}-${item.tmdb_id}`}
                  onClick={() => handleSelectMedia(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3.5 px-3.5 py-2.5 sm:px-4 sm:py-3 cursor-pointer transition-colors ${
                    isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
                >
                  {/* Thumbnail Poster */}
                  <div className="w-11 h-16 sm:w-12 sm:h-[72px] flex-shrink-0 rounded-lg overflow-hidden bg-dramify-surface relative border border-white/10">
                    {item.poster_path ? (
                      <img
                        src={item.poster_path}
                        alt={item.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to minimal placeholder
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950/40 to-slate-900 text-slate-400 p-1 text-center">
                        <Film className="w-4 h-4 text-crimson mb-1" />
                        <span className="text-[9px] font-mono leading-none">NO PIC</span>
                      </div>
                    )}
                  </div>

                  {/* Metadata Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-semibold text-sm sm:text-base text-white truncate">
                        {item.title}
                      </span>
                      {item.korean_title && item.korean_title !== item.title && (
                        <span className="hidden sm:inline font-hangul text-xs text-rose-400/90 truncate">
                          ({item.korean_title})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {/* Media Type Badge */}
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-300 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {item.media_type === 'tv' ? (
                          <>
                            <Tv className="w-3 h-3 text-rose-400" /> K-Drama
                          </>
                        ) : (
                          <>
                            <Film className="w-3 h-3 text-amber-400" /> K-Movie
                          </>
                        )}
                      </span>

                      {/* Release Year */}
                      {item.release_year > 0 && <span>{item.release_year}</span>}

                      {/* TMDB Rating */}
                      {item.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.vote_average.toFixed(1)}
                        </span>
                      )}

                      {/* Source tag */}
                      {item.source === 'tmdb' ? (
                        <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20 font-mono">
                          TMDB
                        </span>
                      ) : (
                        <span className="text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20 font-mono">
                          Dramify
                        </span>
                      )}
                    </div>

                    {item.overview && (
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 font-normal">
                        {item.overview}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}

            {results.length === 0 && !isLoading && (
              <div className="p-6 text-center text-slate-400 text-sm">
                No matching Korean dramas or movies found for &ldquo;{query}&rdquo;.
              </div>
            )}
          </div>

          {/* Footer View All Shortcut */}
          <div
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query.trim())}`);
              setIsOpen(false);
            }}
            className="px-4 py-2.5 bg-white/[0.03] hover:bg-white/10 cursor-pointer flex items-center justify-between text-xs text-rose-400 font-medium transition-colors"
          >
            <span>View all full results for &ldquo;{query}&rdquo; →</span>
            <span className="text-[10px] text-slate-500">Press Enter</span>
          </div>
        </div>
      )}
    </div>
  );
};
