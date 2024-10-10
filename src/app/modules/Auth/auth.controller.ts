import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { AuthServices } from './auth.service';
import AppError from '../../errors/AppError';

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

const createAccount = catchAsync(async (req, res) => {
  const result = await AuthServices.createAccountIntoDB(req.body);

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
  const result = await AuthServices.getAllUsersFromDB(req.query);

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

const forgetPassword = catchAsync(async (req, res) => {
  const email = req.body.email;
  const result = await AuthServices.forgetPassword(email);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reset link is generated successfully!',
    data: result,
  });
});

const resetPassword = catchAsync(async (req, res) => {
  const token = req.headers.authorization;

  if (!token) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Something went wrong!');
  }

  const result = await AuthServices.resetPassword(req.body, token);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password reset successfully!',
    data: result,
  });
});

const getRecommendProfiles = catchAsync(async (req, res) => {
  const result = await AuthServices.getRecommendProfilesFromDB(
    req.user,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Recommended users Fetched successfully!',
    data: result,
  });
});

const getFollowingProfiles = catchAsync(async (req, res) => {
  const result = await AuthServices.getFollowingProfilesFromDB(
    req.user,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Following users Fetched successfully!',
    data: result,
  });
});

const getFollowersProfiles = catchAsync(async (req, res) => {
  const result = await AuthServices.getFollowersProfilesFromDB(
    req.user,
    req.query,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Followers profiles Fetched successfully!',
    data: result,
  });
});

const initiatePayment = catchAsync(async (req, res) => {
  const result = await AuthServices.initiatePaymentInDB(req.user);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Payment Initiated successfully!',
    data: result,
  });
});

const verifyPayment = catchAsync(async (req, res) => {
  const result = await AuthServices.verifyPaymentInDB(req.query);
  res.send(result);
});

const followUser = catchAsync(async (req, res) => {
  const result = await AuthServices.followUserInDB(req.user, req.params.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Followed successfully!',
    data: result,
  });
});

const unFollowUser = catchAsync(async (req, res) => {
  const result = await AuthServices.unFollowUserInDB(
    req.user,
    req.params.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User UnFollowed successfully!',
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
  createAccount,
  forgetPassword,
  resetPassword,
  getRecommendProfiles,
  getFollowingProfiles,
  getFollowersProfiles,
  initiatePayment,
  verifyPayment,
  followUser,
  unFollowUser,
};
