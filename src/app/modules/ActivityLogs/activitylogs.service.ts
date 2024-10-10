import QueryBuilder from '../../builder/QueryBuilder';
import { Payment } from '../Payment/payment.model';
import { ActivityLog } from './activitylogs.model';

const getAllActivityLogsFromDB = async (query: Record<string, unknown>) => {
  const ActivityQuery = new QueryBuilder(
    ActivityLog.find().populate(
      'user',
      '_id name email role isVerified profileImg',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ActivityQuery.modelQuery;
  const meta = await ActivityQuery.countTotal();

  const PaymentQuery = new QueryBuilder(
    Payment.find().populate(
      'user',
      '_id name email role isVerified profileImg',
    ),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const paymentResult = await PaymentQuery.modelQuery;
  const PaymentMeta = await PaymentQuery.countTotal();

  return { activitylogs: {result, meta} , payment: {result: paymentResult , meta: PaymentMeta} };
};

export const ActivityLogServices = {
  getAllActivityLogsFromDB,
};
