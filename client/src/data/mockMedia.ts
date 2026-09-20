import { MediaItem, Review, UserProfile } from '../types/media';
import { USER_WATCHED_TITLES } from './userWatchedList';

// Core Featured & Trending Media combined with User's 147 watched titles
export const MOCK_MEDIA: MediaItem[] = [
  ...USER_WATCHED_TITLES,
];

export const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userId: 'u-1',
    username: 'vivek',
    displayName: 'Vivek',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    tmdb_id: 66897, // Uncontrollably Fond
    media_type: 'tv',
    rating: 10,
    content: 'Uncontrollably Fond broke my heart into a million pieces. Kim Woo-bin and Suzy delivered career-defining performances. That winter seaside scene remains unforgettable.',
    createdAt: '3 days ago',
    likesCount: 156,
  },
  {
    id: 'rev-2',
    userId: 'u-2',
    username: 'vivek',
    displayName: 'Vivek',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    tmdb_id: 670, // Oldboy
    media_type: 'movie',
    rating: 10,
    content: 'The undisputed crowning achievement of Korean cinema. Park Chan-wook’s single-shot hallway brawl and the devastating third act twist set a global benchmark.',
    createdAt: '1 week ago',
    likesCount: 284,
  },
  {
    id: 'rev-3',
    userId: 'u-3',
    username: 'vivek',
    displayName: 'Vivek',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    tmdb_id: 205120, // Weak Hero Class 1
    media_type: 'tv',
    rating: 10,
    content: 'The emotional intensity and raw fight choreography in Weak Hero Class 1 is second to none. Park Ji-hoon’s gaze in the finale is absolute perfection.',
    createdAt: '2 weeks ago',
    likesCount: 198,
  },
];

// User Profile showcasing the 148 Watched Titles
export const MOCK_USER_PROFILE: UserProfile = {
  username: 'vivek',
  displayName: 'Vivek',
  avatarUrl: '/avatars/avatar-1.jpg',
  bio: 'True Hallyu devotee. 148 Korean titles tracked across KBS weekend family gems, adrenaline noir thrillers, and box office cinema. Big Mouth, Jirisan & Bloodhounds enthusiast.',
  joinDate: 'January 2024',
  stats: {
    watched: USER_WATCHED_TITLES.length, // Exactly 148!
    favorites: 32,
    watching: 4,
    planToWatch: 18,
    avgRating: 8.9,
  },
  topThreeDramas: [
    USER_WATCHED_TITLES.find((m) => m.title === 'Big Mouth') || USER_WATCHED_TITLES[54],
    USER_WATCHED_TITLES.find((m) => m.title === 'Jirisan') || USER_WATCHED_TITLES[46],
    USER_WATCHED_TITLES.find((m) => m.title === 'Bloodhounds') || USER_WATCHED_TITLES[130],
  ],
  topThreeMovies: [
    USER_WATCHED_TITLES.find((m) => m.title === 'Oldboy') || USER_WATCHED_TITLES[47],
    USER_WATCHED_TITLES.find((m) => m.title === 'The Outlaws') || USER_WATCHED_TITLES[74],
    USER_WATCHED_TITLES.find((m) => m.title === 'I Saw the Devil') || USER_WATCHED_TITLES[140],
  ],
};
