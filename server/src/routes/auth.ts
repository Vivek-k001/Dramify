import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';

const router = Router();

// Register a new user
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, displayName, email, password } = req.body;

    if (!username || !displayName || !email || !password) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters.' });
      return;
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanEmail = email.trim().toLowerCase();

    // Check existing
    const existingUser = await User.findOne({
      $or: [{ username: cleanUsername }, { email: cleanEmail }],
    });

    if (existingUser) {
      res.status(409).json({ message: 'Username or email is already registered.' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const newUser = await User.create({
      username: cleanUsername,
      displayName: displayName.trim(),
      email: cleanEmail,
      passwordHash,
    });

    const secret = process.env.JWT_SECRET || 'dramify_dev_secret_key_987654321';
    const token = jwt.sign(
      { userId: newUser._id.toString(), username: newUser.username },
      secret,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        displayName: newUser.displayName,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        bio: newUser.bio,
      },
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { login, password } = req.body; // login can be username or email

    if (!login || !password) {
      res.status(400).json({ message: 'Login and password are required.' });
      return;
    }

    const cleanLogin = login.trim().toLowerCase();

    const user = await User.findOne({
      $or: [{ username: cleanLogin }, { email: cleanLogin }],
    });

    if (!user) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials.' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'dramify_dev_secret_key_987654321';
    const token = jwt.sign(
      { userId: user._id.toString(), username: user.username },
      secret,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

// Get Current Authenticated User Profile
router.get('/me', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch user session.' });
  }
});

export default router;
