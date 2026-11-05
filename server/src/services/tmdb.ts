import { Request, Response } from 'express';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export const getTmdbHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const appendApiKey = (url: string): string => {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return url;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}api_key=${apiKey}`;
};

// Discover Korean Dramas
export async function fetchTrendingKDramas(page = 1) {
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey) return null; // Signal fallback to curated mock data

  try {
    const url = appendApiKey(
      `${TMDB_BASE_URL}/discover/tv?with_origin_country=KR&sort_by=popularity.desc&page=${page}`
    );
    const res = await fetch(url, { headers: getTmdbHeaders() });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching trending K-Dramas from TMDB:', err);
    return null;
  }
}

// Discover Korean Movies
export async function fetchPopularKMovies(page = 1) {
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey) return null;

  try {
    const url = appendApiKey(
      `${TMDB_BASE_URL}/discover/movie?with_origin_country=KR&sort_by=popularity.desc&page=${page}`
    );
    const res = await fetch(url, { headers: getTmdbHeaders() });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error('Error fetching popular K-Movies from TMDB:', err);
    return null;
  }
}

// Search Korean Content (Strictly filtered to Korean origin: KR country or ko language)
export async function searchKoreanMedia(query: string, type = 'all', page = 1) {
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey) return null;

  try {
    let endpoint = `${TMDB_BASE_URL}/search/multi?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    if (type === 'tv') {
      endpoint = `${TMDB_BASE_URL}/search/tv?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    } else if (type === 'movie') {
      endpoint = `${TMDB_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    }

    const url = appendApiKey(endpoint);
    const res = await fetch(url, { headers: getTmdbHeaders() });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = (await res.json()) as any;

    // STRICT KOREAN FILTER:
    // Only allow items where original_language is 'ko' OR origin_country includes 'KR'
    if (data && Array.isArray(data.results)) {
      data.results = data.results.filter((item: any) => {
        const isKoreanLang = item.original_language === 'ko';
        const isKoreanCountry = Array.isArray(item.origin_country) && item.origin_country.includes('KR');
        return isKoreanLang || isKoreanCountry;
      });
    }

    return data;
  } catch (err) {
    console.error('Error searching TMDB:', err);
    return null;
  }
}

// Fetch Full Details + Credits (Cast & Crew)
export async function fetchMediaDetails(type: 'tv' | 'movie', id: number) {
  const apiKey = process.env.TMDB_API_KEY || process.env.TMDB_ACCESS_TOKEN;
  if (!apiKey) return null;

  try {
    const detailUrl = appendApiKey(
      `${TMDB_BASE_URL}/${type}/${id}?append_to_response=credits,recommendations`
    );
    const res = await fetch(detailUrl, { headers: getTmdbHeaders() });
    if (!res.ok) throw new Error(`TMDB error ${res.status}`);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`Error fetching ${type} ${id} from TMDB:`, err);
    return null;
  }
}
