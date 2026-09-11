import { Router, Response } from 'express';
import { MediaInteraction } from '../models/MediaInteraction.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get current user's status for a specific media item
router.get('/media/:type/:tmdbId', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.json({ status: null, rating: null, isFavorite: false });
      return;
    }

    const { tmdbId } = req.params;
    const interaction = await MediaInteraction.findOne({
      userId: req.user.userId,
      tmdbId: Number(tmdbId),
    });

    if (!interaction) {
      res.json({ status: null, rating: null, isFavorite: false });
      return;
    }

    res.json({
      status: interaction.status,
      rating: interaction.rating,
      isFavorite: interaction.isFavorite,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching interaction' });
  }
});

// Update or create interaction (watch status, rating, favorite)
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      tmdbId,
      mediaType,
      title,
      posterPath,
      koreanTitle,
      releaseYear,
      status,
      rating,
      isFavorite,
    } = req.body;

    if (!tmdbId || !mediaType || !title) {
      res.status(400).json({ message: 'tmdbId, mediaType, and title are required.' });
      return;
    }

    const updateFields: any = {
      mediaType,
      title,
      posterPath: posterPath || '',
      koreanTitle: koreanTitle || '',
      releaseYear: releaseYear || null,
    };

    if (status !== undefined) updateFields.status = status;
    if (rating !== undefined) updateFields.rating = rating;
    if (isFavorite !== undefined) updateFields.isFavorite = isFavorite;

    const interaction = await MediaInteraction.findOneAndUpdate(
      { userId: req.user?.userId, tmdbId: Number(tmdbId) },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    res.json(interaction);
  } catch (err) {
    console.error('Error saving interaction:', err);
    res.status(500).json({ message: 'Failed to update tracking.' });
  }
});

// Get user's personal library
router.get('/library', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, isFavorite, type } = req.query;

    const query: any = { userId: req.user?.userId };

    if (status) query.status = status;
    if (isFavorite === 'true') query.isFavorite = true;
    if (type && type !== 'all') query.mediaType = type;

    const items = await MediaInteraction.find(query).sort({ updatedAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to retrieve library.' });
  }
});

// Remove title from library
router.delete('/:tmdbId', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tmdbId } = req.params;
    await MediaInteraction.findOneAndDelete({
      userId: req.user?.userId,
      tmdbId: Number(tmdbId),
    });
    res.json({ message: 'Item removed from library.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete tracking item.' });
  }
});

export default router;
