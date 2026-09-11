const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Token Management
export const getToken = (): string | null => {
  return localStorage.getItem('dramify_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('dramify_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('dramify_token');
};

// Generic Fetch Wrapper
async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  return res.json();
}

// Authentication API
export const authApi = {
  register: (data: { username: string; displayName: string; email: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { login: string; password: string }) =>
    request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => request<any>('/auth/me'),
};

// User Interactions API (Watch status, Rating, Favorite)
export const interactionApi = {
  getInteraction: (type: string, tmdbId: number) =>
    request<{ status: string | null; rating: number | null; isFavorite: boolean }>(
      `/interactions/media/${type}/${tmdbId}`
    ),

  saveInteraction: (data: {
    tmdbId: number;
    mediaType: string;
    title: string;
    posterPath?: string;
    koreanTitle?: string;
    releaseYear?: number;
    status?: string | null;
    rating?: number | null;
    isFavorite?: boolean;
  }) =>
    request<any>('/interactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getLibrary: (params?: { status?: string; isFavorite?: boolean; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.isFavorite) query.set('isFavorite', 'true');
    if (params?.type) query.set('type', params.type);
    return request<any[]>(`/interactions/library?${query.toString()}`);
  },
};

// Reviews API
export const reviewApi = {
  getReviews: (type: string, tmdbId: number) =>
    request<{ reviews: any[]; communityRating: number | null; ratingCount: number }>(
      `/reviews/${type}/${tmdbId}`
    ),

  postReview: (data: { tmdbId: number; mediaType: string; rating: number; content: string }) =>
    request<any>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteReview: (reviewId: string) =>
    request<{ message: string }>(`/reviews/${reviewId}`, {
      method: 'DELETE',
    }),
};

// Profile & Taste Match API
export const profileApi = {
  getProfile: (username: string) => request<any>(`/profile/${username}`),

  updateProfile: (data: { displayName?: string; bio?: string; avatarUrl?: string }) =>
    request<any>('/profile/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateTopPicks: (data: { topThreeDramas?: any[]; topThreeMovies?: any[] }) =>
    request<any>('/profile/me/top-picks', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getTasteMatch: (username: string) =>
    request<{ matchPercentage: number | null; sharedCount: number; message: string }>(
      `/profile/${username}/taste-match`
    ),
};
