import mongoose, { Schema, Document, Types } from 'mongoose';

export type WatchStatus = 'plan_to_watch' | 'watching' | 'watched';
export type MediaType = 'tv' | 'movie';

export interface IMediaInteraction extends Document {
  userId: Types.ObjectId;
  tmdbId: number;
  mediaType: MediaType;
  title: string;
  posterPath: string;
  koreanTitle?: string;
  releaseYear?: number;
  status?: WatchStatus | null;
  rating?: number | null; // 1 to 10
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MediaInteractionSchema = new Schema<IMediaInteraction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tmdbId: {
      type: Number,
      required: true,
      index: true,
    },
    mediaType: {
      type: String,
      enum: ['tv', 'movie'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    posterPath: {
      type: String,
      default: '',
    },
    koreanTitle: {
      type: String,
      default: '',
    },
    releaseYear: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['plan_to_watch', 'watching', 'watched', null],
      default: null,
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      default: null,
    },
    isFavorite: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate user interactions for the same title
MediaInteractionSchema.index({ userId: 1, tmdbId: 1 }, { unique: true });

export const MediaInteraction = mongoose.model<IMediaInteraction>(
  'MediaInteraction',
  MediaInteractionSchema
);
