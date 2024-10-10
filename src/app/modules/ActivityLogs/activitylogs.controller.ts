import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { ActivityLogServices } from './activitylogs.service';
import sendResponse from '../../utils/sendResponse';

const getAllActivityLogs = catchAsync(async (req, res) => {
  const result = await ActivityLogServices.getAllActivityLogsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Activity Log fetched Successful',
    data: result,
  });
});

const getAllPayments = catchAsync(async (req, res) => {
  const result = await ActivityLogServices.getAllPaymentsFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payments fetched Successful',
    data: result,
  });
});

const getMonthlyAnalytics = catchAsync(async (req, res) => {
  const result = await ActivityLogServices.getMonthlyAnalyticsFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Analytics fetched Successful',
    data: result,
  });
});

export const ActivityLogControllers = {
  getAllActivityLogs,
  getAllPayments,
  getMonthlyAnalytics
};
