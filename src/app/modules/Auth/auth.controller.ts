import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';

// auth controllers
const signupUser = catchAsync(async (req, res) => {
  const result = await AuthServices.registerUserIntoDB(req.body);

  res.cookie('refreshToken', result.refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const createAdmin = catchAsync(async (req, res) => {
  const result = await AuthServices.createAdminIntoDB(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User registered successfully',
    data: result,
  });
});

const signInUser = catchAsync(async (req, res) => {
  const result = await AuthServices.signInUserFromDB(req.body);
  res.cookie('refreshToken', result.refreshToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.cookies;
  const result = await AuthServices.refreshToken(refreshToken);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Access token is retrieved successfully!',
    data: result,
  });
});

const getProfileData = catchAsync(async (req, res) => {
  const user = await AuthServices.getProfileFromDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile is retrieved successfully!',
    data: user,
  });
});

const updateProfileData = catchAsync(async (req, res) => {
  const result = await AuthServices.updateProfileInDB(req.user, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Profile is updated successfully!',
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await AuthServices.getAllUsersFromDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users Fetched successfully!',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await AuthServices.getSingleUserFromDB(req.params.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Fetched successfully!',
    data: result,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const result = await AuthServices.updateUserFromDB(req.params.id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Updated successfully!',
    data: result,
  });
});

export const AuthControllers = {
  signupUser,
  signInUser,
  refreshToken,
  getProfileData,
  updateProfileData,
  getAllUsers,
  getSingleUser,
  updateUser,
  createAdmin,
};
