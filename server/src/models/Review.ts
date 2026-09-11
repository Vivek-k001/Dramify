import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IReview extends Document {
  userId: Types.ObjectId;
  tmdbId: number;
  mediaType: 'tv' | 'movie';
  rating: number; // 1 - 10
  content: string;
  likesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
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
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 3000,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ReviewSchema.index({ tmdbId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
