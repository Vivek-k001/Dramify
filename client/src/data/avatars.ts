export interface ProfileAvatar {
  id: number;
  name: string;
  role: string;
  url: string;
}

export const STREAMING_AVATARS: ProfileAvatar[] = [
  {
    id: 1,
    name: 'Detective Kang',
    role: 'Seoul Noir Detective',
    url: '/avatars/avatar-1.jpg',
  },
  {
    id: 2,
    name: 'Prince Yi Hwon',
    role: 'Joseon Crown Royal',
    url: '/avatars/avatar-2.jpg',
  },
  {
    id: 3,
    name: 'Eun-seo',
    role: 'Autumn Melodrama Lead',
    url: '/avatars/avatar-3.jpg',
  },
  {
    id: 4,
    name: 'Rin',
    role: 'Neo-Seoul Night Rebel',
    url: '/avatars/avatar-4.jpg',
  },
  {
    id: 5,
    name: 'Director Park',
    role: 'Cannes Auteur Director',
    url: '/avatars/avatar-5.jpg',
  },
  {
    id: 6,
    name: 'Hana',
    role: 'Martial Combat Specialist',
    url: '/avatars/avatar-6.jpg',
  },
  {
    id: 7,
    name: 'Prosecutor Min',
    role: 'Supreme Court Investigator',
    url: '/avatars/avatar-7.jpg',
  },
  {
    id: 8,
    name: 'Seri',
    role: 'Modern Chaebol Heiress',
    url: '/avatars/avatar-8.jpg',
  },
  {
    id: 9,
    name: 'Dan-oh',
    role: 'Celestial Fantasy Mystic',
    url: '/avatars/avatar-9.jpg',
  },
  {
    id: 10,
    name: 'Tae-hyun',
    role: 'Global Hallyu Star',
    url: '/avatars/avatar-10.jpg',
  },
];

export const getDefaultAvatar = (): string => STREAMING_AVATARS[0].url;

export const getSavedAvatar = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('dramify_avatar') || STREAMING_AVATARS[0].url;
  }
  return STREAMING_AVATARS[0].url;
};

export const saveAvatar = (url: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('dramify_avatar', url);
  }
};
