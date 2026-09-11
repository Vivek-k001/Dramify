import mongoose, { Schema, Document } from 'mongoose';

export interface ITopPick {
  tmdbId: number;
  title: string;
  posterPath: string;
  releaseYear?: number;
  position: 1 | 2 | 3;
}

export interface IUser extends Document {
  username: string;
  displayName: string;
  email: string;
  passwordHash: string;
  avatarUrl: string;
  bio: string;
  topThreeDramas: ITopPick[];
  topThreeMovies: ITopPick[];
  createdAt: Date;
  updatedAt: Date;
}

const TopPickSchema = new Schema<ITopPick>(
  {
    tmdbId: { type: Number, required: true },
    title: { type: String, required: true },
    posterPath: { type: String, default: '' },
    releaseYear: { type: Number },
    position: { type: Number, required: true, min: 1, max: 3 },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
    },
    bio: {
      type: String,
      default: 'K-Drama and K-Movie enthusiast on Dramify.',
      maxlength: 300,
    },
    topThreeDramas: {
      type: [TopPickSchema],
      default: [],
    },
    topThreeMovies: {
      type: [TopPickSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>('User', UserSchema);
