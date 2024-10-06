import { Types } from 'mongoose';

export interface IPayment {
  user: Types.ObjectId;
  amount?: number;
  transactionId: string;
  status: string;
}
