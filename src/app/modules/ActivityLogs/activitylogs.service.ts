import QueryBuilder from '../../builder/QueryBuilder';
import { Payment } from '../Payment/payment.model';
import { Post } from '../Post/post.model';
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

  return { result, meta };
};

const getAllPaymentsFromDB = async (query: Record<string, unknown>) => {
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

  const result = await PaymentQuery.modelQuery;
  const meta = await PaymentQuery.countTotal();

  return { result, meta };
};

const getLast30DaysRange = () => {
  const currentDay = new Date();
  const startDate = new Date();
  startDate.setDate(currentDay.getDate() - 30);
  return { startDate, endDate: currentDay };
};

const getDailyActivityLogsLast30Days = async () => {
  const { startDate, endDate } = getLast30DaysRange();

  const dailyActivityLogs = await ActivityLog.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return dailyActivityLogs;
};

const getDailyPostsLast30Days = async () => {
  const { startDate, endDate } = getLast30DaysRange();

  const dailyPosts = await Post.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return dailyPosts;
};

const getDailyPaymentsLast30Days = async () => {
  const { startDate, endDate } = getLast30DaysRange();

  const dailyPayments = await Payment.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: {
          day: { $dayOfMonth: '$createdAt' },
          month: { $month: '$createdAt' },
          year: { $year: '$createdAt' },
        },
        totalAmount: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
  ]);

  return dailyPayments;
};

const getMonthlyAnalyticsFromDB = async () => {
  const [activityLogs, posts, payments] = await Promise.all([
    getDailyActivityLogsLast30Days(),
    getDailyPostsLast30Days(),
    getDailyPaymentsLast30Days(),
  ]);

  return { activityLogs, posts, payments };
};

export const ActivityLogServices = {
  getAllActivityLogsFromDB,
  getAllPaymentsFromDB,
  getMonthlyAnalyticsFromDB,
};
