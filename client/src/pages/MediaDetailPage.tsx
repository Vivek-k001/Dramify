import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star,
  Sparkles,
  Calendar,
  Layers,
  Clock,
  Tv,
  Film,
  ArrowLeft,
  Share2,
  Check,
  MessageSquare
} from 'lucide-react';
import { MOCK_MEDIA, MOCK_REVIEWS } from '../data/mockMedia';
import { WatchStatus } from '../types/media';
import { FavoriteButton } from '../components/FavoriteButton';
import { EmptyState } from '../components/EmptyState';
import { CinematicPoster } from '../components/CinematicPoster';
import { ActorAvatar } from '../components/ActorAvatar';
import { cn } from '../utils/cn';

export const MediaDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();

  // Find media in mock dataset by tmdb_id or id
  const media = MOCK_MEDIA.find(
    (m) => m.tmdb_id === Number(id) && m.media_type === type
  ) || MOCK_MEDIA.find((m) => m.tmdb_id === Number(id)) || MOCK_MEDIA.find((m) => m.id === Number(id)) || MOCK_MEDIA[0];

  // User interactive state
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [userStatus, setUserStatus] = useState<WatchStatus | null>('watching');
  const [copiedLink, setCopiedLink] = useState(false);

  // Reviews for this media
  const reviews = MOCK_REVIEWS.filter((r) => r.tmdb_id === media.tmdb_id);

  // Review Form state
  const [newReviewText, setNewReviewText] = useState('');
  const [submittedReview, setSubmittedReview] = useState(false);

  const isDrama = media.media_type === 'tv';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewText.trim()) {
      setSubmittedReview(true);
      setNewReviewText('');
      setTimeout(() => setSubmittedReview(false), 4000);
    }
  };

  if (!media) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="Title not found"
          description="We could not find the requested Korean drama or movie."
          actionText="Back to Browse"
          actionLink="/discover"
        />
      </div>
    );
  }

  // Choose backdrop or fallback to poster
  const backdropImage = media.backdrop_path || media.poster_path;

  return (
    <div className="pb-24 relative">
      {/* 1. PERSISTENT FIXED BACK BUTTON (Does not scroll away) */}
      <div className="fixed top-5 left-4 sm:left-8 z-40">
        <Link
          to={-1 as any}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#101217]/90 hover:bg-[#181B23] text-white text-xs font-semibold backdrop-blur-md border border-white/15 shadow-xl transition-all duration-200 hover:-translate-x-0.5 group"
          aria-label="Back to previous page"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
          <span>Back</span>
        </Link>
      </div>

      {/* 2. CINEMATIC HERO BACKDROP BANNER */}
      <div className="relative w-full h-[360px] sm:h-[460px] lg:h-[520px] overflow-hidden bg-slate-950">
        {backdropImage ? (
          <img
            src={backdropImage}
            alt={media.title}
            className="w-full h-full object-cover object-center filter brightness-90"
          />
        ) : (
          <div className="w-full h-full bg-[#101217]" />
        )}
        {/* Layered functional cinema gradients for text legibility */}
        <div className="absolute inset-0 cinema-vignette" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090C] via-transparent to-[#08090C]/80" />
      </div>

      {/* 3. MAIN MEDIA CONTENT CONTAINER (OVERLAPPING HERO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-44 sm:-mt-56 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Poster & User Action Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Poster */}
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-w-sm mx-auto lg:max-w-none relative bg-[#12141B]">
              <CinematicPoster
                title={media.title}
                koreanTitle={media.korean_title}
                releaseYear={media.release_year}
                mediaType={media.media_type}
                primaryUrl={media.poster_path}
                className="w-full h-full"
              />
              <div className="absolute top-3 right-3 z-10">
                <FavoriteButton size="md" />
              </div>
            </div>

            {/* User Interaction Card (Watch Status & 1-10 Rating) */}
            <div className="p-5 rounded-2xl bg-[#12141B] border border-white/8 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-rose-400" />
                  <span>My Tracking</span>
                </h3>
                <span className="text-[11px] text-slate-400">Personal Log</span>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Watch Status
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                  {[
                    { id: 'plan_to_watch' as WatchStatus, label: 'Plan' },
                    { id: 'watching' as WatchStatus, label: 'Watching' },
                    { id: 'watched' as WatchStatus, label: 'Watched' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => setUserStatus(userStatus === st.id ? null : st.id)}
                      className={cn(
                        'py-2 rounded-lg font-medium transition-all text-center',
                        userStatus === st.id
                          ? 'bg-crimson text-white font-bold shadow-md'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 1 - 10 Star Personal Rating */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Your Rating
                  </label>
                  <span className="text-xs font-bold text-amber-400">
                    {userRating ? `${userRating} / 10` : 'Not Rated'}
                  </span>
                </div>

                {/* Star Row (1 to 10) */}
                <div className="flex items-center justify-between gap-1 p-2 rounded-xl bg-black/40 border border-white/5">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((starVal) => {
                    const isFilled = (hoverRating ?? userRating ?? 0) >= starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setUserRating(userRating === starVal ? null : starVal)}
                        className="p-0.5 hover:scale-125 transition-transform"
                        aria-label={`Rate ${starVal} out of 10`}
                      >
                        <Star
                          size={15}
                          className={cn(
                            'transition-colors',
                            isFilled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600 hover:text-slate-400'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Share Action */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
              >
                {copiedLink ? (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span>Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Share This Title</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Information, Cast & Reviews */}
          <div className="lg:col-span-8 space-y-8">
            {/* Header Details */}
            <div className="space-y-4">
              {/* Type Pill + Korean Title */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-crimson/15 text-rose-300 border border-crimson/25">
                  {isDrama ? <Tv size={13} /> : <Film size={13} />}
                  <span>{isDrama ? 'K-Drama Series' : 'K-Movie Feature'}</span>
                </span>

                <span className="font-hangul font-bold text-sm text-slate-300 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {media.korean_title}
                </span>

                {media.network && (
                  <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
                    {media.network}
                  </span>
                )}
              </div>

              {/* Title & Tagline */}
              <div>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-white tracking-tight">
                  {media.title}
                </h1>
                {media.tagline && (
                  <p className="text-sm sm:text-base text-slate-400 italic mt-1">
                    &ldquo;{media.tagline}&rdquo;
                  </p>
                )}
              </div>

              {/* Metadata Badges Bar */}
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-400" />
                  <span>{media.release_year} ({media.release_date})</span>
                </div>

                {isDrama ? (
                  <div className="flex items-center gap-1.5">
                    <Layers size={14} className="text-slate-400" />
                    <span>{media.number_of_seasons || 1} Season &bull; {media.number_of_episodes || 16} Episodes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>{media.runtime || 120} Minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-medium">{media.status}</span>
                </div>
              </div>

              {/* Dual Rating Showcase */}
              <div className="p-4 rounded-2xl bg-[#12141B] border border-white/8 flex items-center justify-between sm:justify-start sm:gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block mb-0.5">
                    TMDB Critic Score
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <Star size={16} className="fill-amber-400 text-amber-400 inline" />
                    <span className="font-display font-extrabold text-2xl text-white">
                      {media.vote_average.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 10 ({media.vote_count} votes)</span>
                  </div>
                </div>

                <div className="h-10 w-[1px] bg-white/10" />

                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-400/90 font-bold block mb-0.5">
                    Dramify Community
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <Sparkles size={16} className="fill-rose-400 text-rose-400 inline" />
                    <span className="font-display font-extrabold text-2xl text-white">
                      {media.dramify_community_rating.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">/ 10 ({media.dramify_ratings_count} ratings)</span>
                  </div>
                </div>
              </div>

              {/* Genre Chips */}
              <div className="flex items-center gap-2 flex-wrap">
                {media.genres.map((genre) => (
                  <Link
                    key={genre}
                    to={`/search?genre=${encodeURIComponent(genre)}`}
                    className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-colors"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>

            {/* Synopsis / Overview */}
            <div className="space-y-2">
              <h2 className="font-display font-bold text-base sm:text-lg text-white">
                Synopsis
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed sm:text-base">
                {media.overview}
              </p>
            </div>

            {/* Creators / Director */}
            {(media.director || media.creators) && (
              <div className="p-4 rounded-2xl bg-[#12141B] border border-white/8 space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  {media.director ? 'Directed By' : 'Created By'}
                </span>
                <p className="font-display font-bold text-sm text-white">
                  {media.director || media.creators?.join(', ')}
                </p>
              </div>
            )}

            {/* Featured Cast List (With Verified Real Photos) */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-base sm:text-lg text-white">
                Featured Cast & Stars
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {media.cast.map((actor) => (
                  <ActorAvatar
                    key={actor.id}
                    name={actor.name}
                    character={actor.character}
                    profilePath={actor.profile_path}
                    size="md"
                  />
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
                    <MessageSquare size={17} className="text-rose-400" />
                    <span>Community Reviews ({reviews.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Fan critiques and commentary
                  </p>
                </div>
              </div>

              {/* Submit Review Box */}
              <form onSubmit={handleReviewSubmit} className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#12141B] border border-white/8 space-y-3">
                  <label className="text-xs font-semibold text-slate-300 block">
                    Write Your Review
                  </label>
                  <textarea
                    rows={3}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder={`Share your thoughts on ${media.title}...`}
                    className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-crimson"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-500">
                      Logged in as Vivek
                    </span>
                    <button
                      type="submit"
                      disabled={!newReviewText.trim()}
                      className="px-5 py-2 rounded-full bg-crimson hover:bg-crimsonHover disabled:opacity-40 text-white text-xs font-bold transition-all"
                    >
                      Post Review
                    </button>
                  </div>
                </div>
                {submittedReview && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                    Review submitted successfully! Saved to Dramify archive.
                  </div>
                )}
              </form>

              {/* Reviews List */}
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#12141B] border border-white/8 space-y-2"
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
                          <span className="text-[10px] text-slate-500">{rev.createdAt}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                        <Star size={13} className="fill-current" />
                        <span>{rev.rating}/10</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rev.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
