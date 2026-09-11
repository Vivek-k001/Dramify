import { Router, Request, Response } from 'express';
import {
  fetchTrendingKDramas,
  fetchPopularKMovies,
  searchKoreanMedia,
  fetchMediaDetails,
} from '../services/tmdb.js';

const router = Router();

// Trending K-Dramas
router.get('/trending/dramas', async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const data = await fetchTrendingKDramas(page);
  if (data) {
    res.json(data);
  } else {
    // Return empty results with status so client falls back gracefully
    res.json({ results: [], fallback: true });
  }
});

// Popular K-Movies
router.get('/popular/movies', async (req: Request, res: Response): Promise<void> => {
  const page = Number(req.query.page) || 1;
  const data = await fetchPopularKMovies(page);
  if (data) {
    res.json(data);
  } else {
    res.json({ results: [], fallback: true });
  }
});

// Search
router.get('/search', async (req: Request, res: Response): Promise<void> => {
  const query = (req.query.q as string) || '';
  const type = (req.query.type as string) || 'all';
  const page = Number(req.query.page) || 1;

  if (!query.trim()) {
    res.json({ results: [] });
    return;
  }

  const data = await searchKoreanMedia(query, type, page);
  if (data) {
    res.json(data);
  } else {
    res.json({ results: [], fallback: true });
  }
});

// Media details
router.get('/media/:type/:id', async (req: Request, res: Response): Promise<void> => {
  const type = req.params.type === 'movie' ? 'movie' : 'tv';
  const id = Number(req.params.id);

  if (!id) {
    res.status(400).json({ message: 'Invalid media ID' });
    return;
  }

  const data = await fetchMediaDetails(type, id);
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ message: 'Media details unavailable from TMDB', fallback: true });
  }
});

export default router;
