export type MediaType = 'tv' | 'movie';

export type WatchStatus = 'plan_to_watch' | 'watching' | 'watched';

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

export interface MediaItem {
  id: number;
  tmdb_id: number;
  title: string;
  original_title: string;
  korean_title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: MediaType;
  release_date: string; // or first_air_date
  release_year: number;
  vote_average: number; // TMDB rating 0-10
  vote_count: number;
  dramify_community_rating: number; // Dramify rating 0-10
  dramify_ratings_count: number;
  genres: string[];
  status: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  runtime?: number; // for movies in minutes
  director?: string;
  creators?: string[];
  cast: CastMember[];
  network?: string;
  tagline?: string;
}

export interface UserMediaState {
  status: WatchStatus | null;
  rating: number | null; // 1 - 10
  isFavorite: boolean;
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  tmdb_id: number;
  media_type: MediaType;
  rating: number;
  content: string;
  createdAt: string;
  likesCount: number;
}

export interface UserProfile {
  username: string;
  displayName: string;
  avatarUrl: string;
  bio: string;
  joinDate: string;
  stats: {
    watched: number;
    favorites: number;
    watching: number;
    planToWatch: number;
    avgRating: number;
  };
  topThreeDramas: MediaItem[];
  topThreeMovies: MediaItem[];
}
