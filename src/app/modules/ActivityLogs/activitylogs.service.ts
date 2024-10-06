import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { ActivityLog } from './activitylogs.model';

const getAllActivityLogsFromDB = async (query: Record<string, unknown>) => {
  const ActivityQuery = new QueryBuilder(
    ActivityLog.find().populate('user', "_id name email role isVerified profileImg"),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await ActivityQuery.modelQuery;
  const meta = await ActivityQuery.countTotal();

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  return { result, meta };
};

export const ActivityLogServices = {
        getAllActivityLogsFromDB,
};
