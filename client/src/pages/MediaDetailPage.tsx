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
  MessageSquare,
  Heart
} from 'lucide-react';
import { MOCK_MEDIA, MOCK_REVIEWS } from '../data/mockMedia';
import { WatchStatus } from '../types/media';
import { FavoriteButton } from '../components/FavoriteButton';
import { EmptyState } from '../components/EmptyState';
import { cn } from '../utils/cn';

export const MediaDetailPage: React.FC = () => {
  const { type, id } = useParams<{ type: string; id: string }>();

  // Find media in mock dataset by tmdb_id
  const media = MOCK_MEDIA.find(
    (m) => m.tmdb_id === Number(id) && m.media_type === type
  ) || MOCK_MEDIA.find((m) => m.tmdb_id === Number(id)) || MOCK_MEDIA[0];

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

  return (
    <div className="pb-24">
      {/* 1. CINEMATIC HERO BACKDROP BANNER */}
      <div className="relative w-full h-[380px] sm:h-[480px] lg:h-[540px] overflow-hidden">
        <img
          src={media.backdrop_path}
          alt={media.title}
          className="w-full h-full object-cover object-center"
        />
        {/* Layered cinema gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-dramify-bg via-dramify-bg/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-dramify-bg via-transparent to-dramify-bg/80" />

        {/* Top Back Navigation Bar */}
        <div className="absolute top-4 left-4 sm:left-8 z-20">
          <Link
            to={-1 as any}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white text-xs font-semibold backdrop-blur-md border border-white/10 transition-all"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN MEDIA CONTENT CONTAINER (OVERLAPPING HERO) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-44 sm:-mt-56 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Poster & User Action Card */}
          <div className="lg:col-span-4 space-y-6">
            {/* Poster with double-bezel */}
            <div className="double-bezel shadow-2xl max-w-sm mx-auto lg:max-w-none">
              <div className="double-bezel-inner aspect-[2/3] w-full overflow-hidden bg-slate-900 relative">
                <img
                  src={media.poster_path}
                  alt={media.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
                  <FavoriteButton size="md" />
                </div>
              </div>
            </div>

            {/* User Interaction Card (Watch Status & 1-10 Rating) */}
            <div className="p-5 rounded-3xl bg-dramify-surface/90 border border-white/10 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-1.5">
                  <Sparkles size={15} className="text-rose-400" />
                  <span>My Tracking</span>
                </h3>
                <span className="text-[11px] text-slate-400">Personal Log</span>
              </div>

              {/* Status Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Watch Status
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/10 text-xs">
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
                        'py-2 rounded-xl font-medium transition-all text-center',
                        userStatus === st.id
                          ? 'bg-rose-600 text-white font-bold shadow-md'
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
                <div className="flex items-center justify-between gap-1 p-2 rounded-2xl bg-black/40 border border-white/5">
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
                          size={18}
                          className={cn(
                            'transition-colors',
                            isFilled
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-600 hover:text-amber-300'
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="w-full py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 transition-all flex items-center justify-center gap-1.5"
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
                <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-rose-500/15 text-rose-300 border border-rose-500/25">
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
                  <p className="text-sm sm:text-base text-rose-300/80 italic mt-1">
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
                    <span>{media.number_of_seasons} Season &bull; {media.number_of_episodes} Episodes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-slate-400" />
                    <span>{media.runtime} Minutes</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-emerald-400 font-medium">{media.status}</span>
                </div>
              </div>

              {/* Distinct Dual Rating Showcase (Section 10 Requirement) */}
              <div className="p-4 rounded-2xl bg-dramify-surface/70 border border-white/10 flex items-center justify-between sm:justify-start sm:gap-8">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-bold block mb-0.5">
                    TMDB Critic Score
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <Star size={18} className="fill-amber-400 text-amber-400 inline" />
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
                    <Sparkles size={18} className="fill-rose-400 text-rose-400 inline" />
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
            <div className="space-y-3">
              <h2 className="font-display font-bold text-lg text-white">
                Synopsis
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed sm:text-base">
                {media.overview}
              </p>
            </div>

            {/* Creators / Director */}
            {(media.director || media.creators) && (
              <div className="p-4 rounded-2xl bg-dramify-surface/40 border border-white/5 space-y-1">
                <span className="text-xs font-semibold text-slate-400">
                  {media.director ? 'Directed By' : 'Created By'}
                </span>
                <p className="font-display font-bold text-sm text-white">
                  {media.director || media.creators?.join(', ')}
                </p>
              </div>
            )}

            {/* Top Cast List */}
            <div className="space-y-4">
              <h2 className="font-display font-bold text-lg text-white">
                Featured Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {media.cast.map((actor) => (
                  <div
                    key={actor.id}
                    className="p-3 rounded-2xl bg-dramify-surface/50 border border-white/5 space-y-1 text-center group hover:border-white/15 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 mx-auto flex items-center justify-center text-slate-400 text-sm font-bold">
                      {actor.name.charAt(0)}
                    </div>
                    <div className="font-bold text-xs text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                      {actor.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1">
                      {actor.character}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="space-y-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-xl text-white flex items-center gap-2">
                    <MessageSquare size={18} className="text-rose-400" />
                    <span>Community Reviews ({reviews.length})</span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Thoughts and critiques from Dramify fans
                  </p>
                </div>
              </div>

              {/* Add Review Box */}
              <form onSubmit={handleReviewSubmit} className="p-4 rounded-3xl bg-dramify-surface/70 border border-white/10 space-y-3">
                <textarea
                  rows={3}
                  value={newReviewText}
                  onChange={(e) => setNewReviewText(e.target.value)}
                  placeholder="Write your review for this title... What did you think of the pacing, OST, and ending?"
                  className="w-full p-3 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-rose-500/50 resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Be respectful and avoid unflagged spoilers.
                  </span>
                  <button
                    type="submit"
                    disabled={!newReviewText.trim()}
                    className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-semibold transition-all shadow-md shadow-rose-950/40"
                  >
                    Post Review
                  </button>
                </div>
                {submittedReview && (
                  <p className="text-xs text-emerald-400 font-semibold pt-1">
                    Your review has been recorded! Thank you for contributing to the community.
                  </p>
                )}
              </form>

              {/* Review Feed */}
              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-3xl bg-dramify-surface/50 border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.avatarUrl}
                            alt={rev.displayName}
                            className="w-9 h-9 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <Link to={`/u/${rev.username}`} className="font-semibold text-sm text-white hover:underline block">
                              {rev.displayName}
                            </Link>
                            <span className="text-[11px] text-slate-400">@{rev.username} &bull; {rev.createdAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                          <Star size={12} className="fill-amber-400" />
                          <span>{rev.rating} / 10</span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {rev.content}
                      </p>

                      <div className="text-[11px] text-slate-500 pt-1 flex items-center gap-1.5">
                        <Heart size={12} className="text-rose-500 fill-rose-500" />
                        <span>{rev.likesCount} community members found this helpful</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    title="No reviews yet"
                    description="Be the first Dramify user to share your review for this title!"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
