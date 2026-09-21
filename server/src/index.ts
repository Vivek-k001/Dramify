import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import route modules
import authRoutes from './routes/auth.js';
import interactionRoutes from './routes/interactions.js';
import reviewRoutes from './routes/reviews.js';
import profileRoutes from './routes/profile.js';
import tmdbRoutes from './routes/tmdb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
const configuredOrigins = CLIENT_URL.split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

const allowedOrigins = new Set([
  ...configuredOrigins,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile, curl, health checks)
      if (!origin) return callback(null, true);
      const cleanOrigin = origin.replace(/\/$/, '');
      if (
        allowedOrigins.has(cleanOrigin) ||
        cleanOrigin.endsWith('.vercel.app') ||
        cleanOrigin.endsWith('.onrender.com')
      ) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  })
);
app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/dramify';

let isDbConnected = false;

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 4000,
    });
    isDbConnected = true;
    console.log('✅ [MongoDB] Connected successfully to database');
  } catch (err: any) {
    isDbConnected = false;
    console.warn(
      '⚠️ [MongoDB] Database connection warning:',
      err.message,
      '\n-> Tip: Paste your free MongoDB Atlas connection string into server/.env (MONGODB_URI=...)'
    );
  }
}

connectDatabase();

// Health Check API
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Dramify API',
    database: isDbConnected ? 'connected' : 'disconnected (pending MONGODB_URI)',
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/interactions', interactionRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/tmdb', tmdbRoutes);

// 404 Route Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    message: 'An unexpected internal server error occurred.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

app.listen(PORT, () => {
  console.log(`🎬 [Dramify API] Server running on http://localhost:${PORT}`);
});
