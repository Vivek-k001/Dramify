import { Router, Request, Response } from 'express';
import { User } from '../models/User.js';
import { MediaInteraction } from '../models/MediaInteraction.js';
import { Review } from '../models/Review.js';
import { authenticateToken, optionalAuth, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Get Public Profile by Username
router.get('/:username', async (req: Request, res: Response): Promise<void> => {
  try {
    const username = String(req.params.username || '').toLowerCase();
    const user = await User.findOne({ username }).select('-passwordHash');

    if (!user) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    // Compute user tracking stats from MediaInteraction
    const interactions = await MediaInteraction.find({ userId: user._id });

    const watched = interactions.filter((i) => i.status === 'watched').length;
    const watching = interactions.filter((i) => i.status === 'watching').length;
    const planToWatch = interactions.filter((i) => i.status === 'plan_to_watch').length;
    const favorites = interactions.filter((i) => i.isFavorite).length;

    const rated = interactions.filter((i) => i.rating !== null && i.rating !== undefined);
    const avgRating = rated.length > 0
      ? Number((rated.reduce((sum, curr) => sum + (curr.rating || 0), 0) / rated.length).toFixed(1))
      : 0;

    // Get public reviews
    const reviews = await Review.find({ userId: user._id }).sort({ createdAt: -1 });

    res.json({
      user,
      stats: {
        watched,
        watching,
        planToWatch,
        favorites,
        avgRating,
      },
      topThreeDramas: user.topThreeDramas || [],
      topThreeMovies: user.topThreeMovies || [],
      reviews,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error retrieving profile.' });
  }
});

// Update Profile Details (bio, displayName, avatarUrl)
router.put('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { displayName, bio, avatarUrl } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        $set: {
          ...(displayName && { displayName: displayName.trim() }),
          ...(bio !== undefined && { bio: bio.trim() }),
          ...(avatarUrl && { avatarUrl: avatarUrl.trim() }),
        },
      },
      { new: true }
    ).select('-passwordHash');

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// Update Top 3 Podiums (Section 13)
router.put('/me/top-picks', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topThreeDramas, topThreeMovies } = req.body;

    const updateData: any = {};
    if (Array.isArray(topThreeDramas)) {
      updateData.topThreeDramas = topThreeDramas.slice(0, 3);
    }
    if (Array.isArray(topThreeMovies)) {
      updateData.topThreeMovies = topThreeMovies.slice(0, 3);
    }

    const user = await User.findByIdAndUpdate(
      req.user?.userId,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash');

    res.json({
      topThreeDramas: user?.topThreeDramas,
      topThreeMovies: user?.topThreeMovies,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update Top 3 picks.' });
  }
});

// Taste Compatibility (Section 19: "You and @user have X% similar taste")
router.get('/:username/taste-match', optionalAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.json({ matchPercentage: null, sharedCount: 0, message: 'Sign in to see taste match.' });
      return;
    }

    const targetUsername = String(req.params.username || '').toLowerCase();
    const targetUser = await User.findOne({ username: targetUsername });
    if (!targetUser) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    // Compare rated items
    const myRatings = await MediaInteraction.find({
      userId: req.user.userId,
      rating: { $ne: null },
    });

    const theirRatings = await MediaInteraction.find({
      userId: targetUser._id,
      rating: { $ne: null },
    });

    const myMap = new Map(myRatings.map((i) => [i.tmdbId, i.rating as number]));
    let commonCount = 0;
    let totalDifference = 0;

    for (const theirItem of theirRatings) {
      if (myMap.has(theirItem.tmdbId)) {
        commonCount++;
        const diff = Math.abs((theirItem.rating as number) - (myMap.get(theirItem.tmdbId) as number));
        totalDifference += diff;
      }
    }

    // Minimum 3 shared titles for confidence
    if (commonCount < 3) {
      res.json({
        matchPercentage: null,
        sharedCount: commonCount,
        message: 'Watch a few more titles together to discover your taste match.',
      });
      return;
    }

    // Average difference out of 10
    const avgDiff = totalDifference / commonCount;
    const similarity = Math.max(10, Math.round(100 - avgDiff * 10));

    res.json({
      matchPercentage: similarity,
      sharedCount: commonCount,
      message: `You and @${targetUser.username} have ${similarity}% similar taste.`,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to calculate taste match.' });
  }
});

export default router;
