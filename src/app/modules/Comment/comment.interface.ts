import { Types } from "mongoose";

export interface IComment {
  content: string;
  author: Types.ObjectId;
  post: Types.ObjectId;
  parent?: Types.ObjectId; 
}
