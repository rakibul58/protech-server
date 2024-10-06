import { Types } from 'mongoose';

export interface IPost {
  author: Types.ObjectId;
  content: string;
  categories?: string[];
  isPremium?: boolean;
  upvotes?: Types.ObjectId[];
  downvotes?: Types.ObjectId[];
  comments?: Types.ObjectId[];
}
