import { MediaItem, Review, UserProfile } from '../types/media';
import { USER_WATCHED_TITLES } from './userWatchedList';

// Core Catalog: 148 curated Korean titles (dramas and movies)
export const MOCK_MEDIA: MediaItem[] = [
  ...USER_WATCHED_TITLES,
];

// No fake dummy reviews - real reviews come directly from users via MongoDB
export const MOCK_REVIEWS: Review[] = [];

// Official Curator Profile (Vivek's personal showcase at /u/vivek)
export const MOCK_USER_PROFILE: UserProfile = {
  username: 'vivek',
  displayName: 'Vivek',
  avatarUrl: '/avatars/avatar-1.jpg',
  bio: 'Platform curator. 148 Korean titles tracked across KBS weekend family gems, adrenaline noir thrillers, and box office cinema.',
  joinDate: 'January 2024',
  stats: {
    watched: USER_WATCHED_TITLES.length,
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
