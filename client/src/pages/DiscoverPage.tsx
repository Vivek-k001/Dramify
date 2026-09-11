import React, { useState } from 'react';
import { Compass, Sparkles, Trophy, Flame, Star } from 'lucide-react';
import { MOCK_MEDIA } from '../data/mockMedia';
import { MediaCard } from '../components/MediaCard';
import { Tabs } from '../components/Tabs';

type DiscoverCategory = 'trending' | 'top_rated' | 'k_movies' | 'hidden_gems';

export const DiscoverPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<DiscoverCategory>('trending');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  const categories = [
    { id: 'trending' as DiscoverCategory, label: 'Trending Series', icon: <Flame size={14} /> },
    { id: 'top_rated' as DiscoverCategory, label: 'Highest Rated', icon: <Trophy size={14} /> },
    { id: 'k_movies' as DiscoverCategory, label: 'Korean Movies', icon: <Sparkles size={14} /> },
    { id: 'hidden_gems' as DiscoverCategory, label: 'Critically Acclaimed', icon: <Star size={14} /> },
  ];

  const getMediaList = () => {
    let list = [...MOCK_MEDIA];

    switch (activeCategory) {
      case 'trending':
        list = list.filter((m) => m.media_type === 'tv').sort((a, b) => b.vote_count - a.vote_count);
        break;
      case 'top_rated':
        list = [...list].sort((a, b) => b.dramify_community_rating - a.dramify_community_rating);
        break;
      case 'k_movies':
        list = list.filter((m) => m.media_type === 'movie');
        break;
      case 'hidden_gems':
        list = list.filter((m) => m.vote_average >= 8.0);
        break;
    }

    if (selectedGenre !== 'all') {
      list = list.filter((m) => m.genres.some((g) => g.toLowerCase().includes(selectedGenre.toLowerCase())));
    }

    return list;
  };

  const filteredMedia = getMediaList();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 pb-16">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-4xl bg-gradient-to-r from-dramify-surface via-dramify-card to-dramify-surface border border-white/10 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <Compass size={13} />
            <span>Curated Korean Catalogue</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Discover Your Next Obsession
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Explore curated collections of iconic Korean dramas, high-octane thrillers, and award-winning cinema.
          </p>
        </div>
      </div>

      {/* Discovery Category Navigation & Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Tabs<DiscoverCategory>
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
          size="md"
        />

        {/* Genre Pill Filter */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1">
          {['all', 'Romance', 'Thriller', 'Drama', 'Comedy', 'Mystery'].map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedGenre === genre
                  ? 'bg-white/20 text-white font-semibold border border-white/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {genre === 'all' ? 'All Genres' : genre}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
        {filteredMedia.map((media, idx) => (
          <MediaCard key={media.id} media={media} rank={activeCategory === 'top_rated' ? idx + 1 : undefined} />
        ))}
      </div>
    </div>
  );
};
