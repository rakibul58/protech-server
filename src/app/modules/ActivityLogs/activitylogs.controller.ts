import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { ActivityLogServices } from './activitylogs.service';
import sendResponse from '../../utils/sendResponse';

const GetAllActivityLogs = catchAsync(async (req, res) => {
  const result = await ActivityLogServices.getAllActivityLogsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity Log fetched Successful',
    data: result,
  });
});

export const ActivityLogControllers = {
  GetAllActivityLogs,
};
