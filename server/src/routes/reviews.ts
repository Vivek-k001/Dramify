import { Router, Request, Response } from 'express';
import { Review } from '../models/Review.js';
import { MediaInteraction } from '../models/MediaInteraction.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get reviews for a media item
router.get('/:type/:tmdbId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { tmdbId, type } = req.params;

    const reviews = await Review.find({
      tmdbId: Number(tmdbId),
      mediaType: type,
    })
      .populate('userId', 'username displayName avatarUrl')
      .sort({ createdAt: -1 });

    // Calculate Dramify Community Rating from actual reviews & rated interactions
    const interactions = await MediaInteraction.find({
      tmdbId: Number(tmdbId),
      rating: { $ne: null },
    });

    let communityRating: number | null = null;
    let ratingCount = interactions.length;

    if (interactions.length > 0) {
      const sum = interactions.reduce((acc, curr) => acc + (curr.rating || 0), 0);
      communityRating = Number((sum / interactions.length).toFixed(1));
    }

    res.json({
      reviews,
      communityRating,
      ratingCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving reviews.' });
  }
});

// Post a review
router.post('/', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tmdbId, mediaType, rating, content } = req.body;

    if (!tmdbId || !mediaType || !rating || !content) {
      res.status(400).json({ message: 'tmdbId, mediaType, rating, and content are required.' });
      return;
    }

    if (rating < 1 || rating > 10) {
      res.status(400).json({ message: 'Rating must be between 1 and 10.' });
      return;
    }

    // Upsert review for this user & title
    const review = await Review.findOneAndUpdate(
      { userId: req.user?.userId, tmdbId: Number(tmdbId) },
      {
        $set: {
          mediaType,
          rating,
          content: content.trim(),
        },
      },
      { new: true, upsert: true }
    ).populate('userId', 'username displayName avatarUrl');

    // Also sync the personal rating to MediaInteraction!
    await MediaInteraction.findOneAndUpdate(
      { userId: req.user?.userId, tmdbId: Number(tmdbId) },
      { $set: { rating, mediaType } },
      { upsert: true }
    );

    res.status(201).json(review);
  } catch (err) {
    console.error('Error posting review:', err);
    res.status(500).json({ message: 'Failed to save review.' });
  }
});

// Delete a review
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const review = await Review.findOneAndDelete({
      _id: id,
      userId: req.user?.userId,
    });

    if (!review) {
      res.status(404).json({ message: 'Review not found or unauthorized.' });
      return;
    }

    res.json({ message: 'Review deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete review.' });
  }
});

export default router;
