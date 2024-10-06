import { Types } from 'mongoose';

export interface IActivityLog {
  user: Types.ObjectId;
  action: string;
}
