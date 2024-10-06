import { Types } from 'mongoose';

export interface IComment {
  _id?: Types.ObjectId;
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  parent?: Types.ObjectId;
  replies?: IComment[];
}
