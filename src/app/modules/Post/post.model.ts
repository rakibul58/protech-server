import { Schema, model } from 'mongoose';
import { IPost } from './post.interface';

// booking schema
const postSchema = new Schema<IPost>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    categories: [
      {
        type: String,
      },
    ],
    isPremium: {
      type: Boolean,
      default: false,
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
  },
  {
    timestamps: true,
  },
);

export const Post = model<IPost>('Post', postSchema);
