import { model, Schema } from 'mongoose';
import { IPayment } from './payment.interface';

const paymentSchema = new Schema<IPayment>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, default: 20 },
    transactionId: { type: String, required: true },
    status: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Payment = model('Payment', paymentSchema);
