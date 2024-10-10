/* eslint-disable no-undef */
import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ISignInUser, IUser } from '../User/user.interface';
import { User } from '../User/user.model';
import config from '../../config';
import {
  createToken,
  generateTransactionId,
  initiatePayment,
  verifyPayment,
  verifyToken,
} from './auth.utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../User/user.constant';
import { sendEmail } from '../../utils/sendEmail';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';
import { ActivityLog } from '../ActivityLogs/activitylogs.model';
import { Payment } from '../Payment/payment.model';
import { IPayment } from '../Payment/payment.interface';
import { join } from 'path';
import { readFileSync } from 'fs';

const registerUserIntoDB = async (payload: IUser) => {
  const user = await User.isUserExistsByEmail(payload.email);
  // if there is no password field then adding a default password
  payload.password = payload.password || config.default_password;
  if (user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This email is already registered!',
    );
  }

  const userData = await User.create(payload);

  const jwtPayload = {
    _id: userData._id,
    email: payload.email,
    role: USER_ROLE.user,
    profileImg: userData.profileImg,
    name: userData.name,
    isVerified: userData.isVerified,
  };

  // creating token
  const accessToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  return {
    accessToken,
    refreshToken,
  };
};

const createAdminIntoDB = async (payload: IUser) => {
  const user = await User.isUserExistsByEmail(payload.email);
  // if there is no password field then adding a default password
  payload.password = payload.password || config.default_password;
  payload.role = USER_ROLE.admin;
  if (user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'This email is already registered!',
    );
  }
  const result = await User.create(payload);
  return result;
};

const signInUserFromDB = async (payload: ISignInUser) => {
  // checking if the user exists
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  if (
    !(await User.isPasswordMatched(payload?.password, user?.password as string))
  )
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  const userData = await User.findById(user._id);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'User does not exists');
  }

  if (userData.isVerified && userData.verifiedUntil) {
    const currentDate = new Date();
    if (currentDate > userData.verifiedUntil) {
      userData.isVerified = false;
      userData.verifiedUntil = null;
      await userData.save();
    }
  }

  const jwtPayload = {
    _id: userData._id,
    email: userData.email,
    role: userData.role,
    profileImg: userData.profileImg,
    name: userData.name,
    isVerified: userData.isVerified,
  };

  // creating token
  const accessToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  const refreshToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string,
  );

  const activity = new ActivityLog({
    user: userData._id,
    action: 'Login',
  });
  await activity.save();

  return {
    accessToken,
    refreshToken,
  };
};

const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = verifyToken(token, config.jwt_refresh_secret as string);

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
    profileImg: user.profileImg,
    name: user.name,
    isVerified: user.isVerified,
  };

  const accessToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string,
  );

  return {
    accessToken,
  };
};

const getProfileFromDB = async (payload: JwtPayload) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  return user;
};

const updateProfileInDB = async (user: JwtPayload, payload: Partial<IUser>) => {
  // checking if the user is exist
  const userData = await User.isUserExistsByEmail(user.email);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = userData?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = userData?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const result = await User.updateOne({ email: user.email }, payload);

  return result;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const UserQuery = new QueryBuilder(User.find(), query)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await UserQuery.modelQuery;
  const meta = await UserQuery.countTotal();

  return { result, meta };
};

const getSingleUserFromDB = async (id: string) => {
  const result = await User.findById(id);
  return result;
};

const updateUserFromDB = async (id: string, payload: Partial<IUser>) => {
  const result = await User.findByIdAndUpdate(id, payload, {
    runValidators: true,
    new: true,
  });
  return result;
};

const forgetPassword = async (email: string) => {
  // checking if the user is exist
  const userData = await User.isUserExistsByEmail(email);

  if (!userData) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = userData?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = userData?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const jwtPayload = {
    _id: userData._id,
    email: userData.email,
    role: userData.role,
    profileImg: userData.profileImg,
    name: userData.name,
    isVerified: userData.isVerified,
  };

  const resetToken = createToken(
    jwtPayload as {
      _id: Types.ObjectId;
      role: string;
      email: string;
      profileImg: string;
      name: string;
      isVerified: boolean;
    },
    config.jwt_access_secret as string,
    '10m',
  );

  const resetUILink = `${config.reset_pass_ui_link}/set-password?email=${userData.email}&token=${resetToken} `;

  const result = sendEmail(userData.email, resetUILink);
  return result;
};

const resetPassword = async (
  payload: { email: string; newPassword: string },
  token: string,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }
  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  // checking if the user is blocked
  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  let decoded;
  try {
    // checking if the given token is valid
    decoded = jwt.verify(
      token,
      config.jwt_access_secret as string,
    ) as JwtPayload;
  } catch (error) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized!');
  }

  if (payload.email !== decoded.email) {
    throw new AppError(httpStatus.FORBIDDEN, 'You are forbidden!');
  }

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds),
  );

  await User.findOneAndUpdate(
    {
      email: decoded.email,
      role: decoded.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    },
  );
};

const getRecommendProfilesFromDB = async (
  payload: JwtPayload,
  query: Record<string, unknown>,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const RecommendedQuery = new QueryBuilder(
    User.find({
      // Example: People you are not already following
      _id: { $ne: user._id, $nin: user.following },
      role: 'user',
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await RecommendedQuery.modelQuery;
  const meta = await RecommendedQuery.countTotal();

  return { result, meta };
};

const getFollowingProfilesFromDB = async (
  payload: JwtPayload,
  query: Record<string, unknown>,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const FollowingQuery = new QueryBuilder(
    User.find({
      // Example: People you are not already following
      _id: { $in: user.following },
      role: 'user',
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await FollowingQuery.modelQuery;
  const meta = await FollowingQuery.countTotal();

  return { result, meta };
};

const getFollowersProfilesFromDB = async (
  payload: JwtPayload,
  query: Record<string, unknown>,
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is already deleted
  const isDeleted = user?.isDeleted;

  if (isDeleted) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is deleted!');
  }

  const isBlocked = user?.isBlocked;

  if (isBlocked) {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  const following = user.following;

  const FollowingQuery = new QueryBuilder(
    User.find({
      // Example: People you are not already following
      _id: { $in: user.followers },
      role: 'user',
    }),
    query,
  )
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await FollowingQuery.modelQuery;
  const meta = await FollowingQuery.countTotal();

  const enhancedResult = result.map(follower => {
    const followedBack =
      follower._id && following!.some(id => id.equals(follower._id));

    return {
      _id: follower._id,
      name: follower.name,
      email: follower.email,
      profileImg: follower.profileImg,
      followedBack: Boolean(followedBack), // Add the followedBack field (true/false)
    };
  });

  return { result: enhancedResult, meta };
};

const initiatePaymentInDB = async (user: JwtPayload) => {
  const transactionId = generateTransactionId();
  const data = await User.findById(user._id).select('phone address');

  const payment = new Payment<IPayment>({
    user: user._id,
    status: 'Pending',
    transactionId,
  });

  await payment.save();

  const paymentData = {
    transactionId,
    totalPrice: 20,
    customerName: user.name,
    customerEmail: user.email,
    customerPhone: data?.phone,
    customerAddress: data?.address || '',
  };

  //payment
  const paymentSession = await initiatePayment(paymentData);

  return paymentSession;
};

const verifyPaymentInDB = async (query: Record<string, unknown>) => {
  const verifyResponse = await verifyPayment(query.transactionId as string);
  let filePath;

  if (verifyResponse === 200 && query.status === 'success') {
    const payment = await Payment.findOneAndUpdate(
      { transactionId: query.transactionId },
      {
        status: 'Paid',
      },
      {
        new: true,
      },
    );

    const user = await User.findById(payment?.user);

    if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, 'User does not exists!');
    }

    user.isVerified = true;
    user.verifiedUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    filePath = join(__dirname, '../../views/payment-success.html');
  } else {
    filePath = join(__dirname, '../../views/payment-failure.html');
  }

  let template = readFileSync(filePath, 'utf-8');
  template = template.replace(
    '{{transactionId}}',
    query.transactionId as string,
  );
  template = template.replace('{{name}}', query.customerName as string);

  return template;
};

const followUserInDB = async (user: JwtPayload, id: string) => {
  const userData = await User.findById(user._id);
  const userToFollow = await User.findById(id);

  if (!userData || !userToFollow) {
    throw new AppError(httpStatus.NOT_FOUND, 'User/UserToFollow not found!');
  }

  const userToFollowObjectId = new Types.ObjectId(userToFollow._id);
  const userObjectId = new Types.ObjectId(userData._id);

  let result;

  if (
    !(userData.following as Types.ObjectId[]).includes(userToFollowObjectId)
  ) {
    (userData.following as Types.ObjectId[]).push(userToFollowObjectId);
    (userToFollow.followers as Types.ObjectId[]).push(userObjectId);

    result = await userData.save();
    await userToFollow.save();
  }

  return result;
};

const unFollowUserInDB = async (user: JwtPayload, id: string) => {
  const userData = await User.findById(user._id);
  const userToUnFollow = await User.findById(id);

  if (!userData || !userToUnFollow) {
    throw new AppError(httpStatus.NOT_FOUND, 'User/UserToUnFollow not found!');
  }

  const userToUnFollowObjectId = new Types.ObjectId(userToUnFollow._id);
  const userObjectId = new Types.ObjectId(userData._id);

  userData.following = (userData.following as Types.ObjectId[]).filter(
    followerId => !followerId.equals(userToUnFollowObjectId),
  );

  userToUnFollow.followers = (
    userToUnFollow.followers as Types.ObjectId[]
  ).filter(followerId => !followerId.equals(userObjectId));

  const result = await userData.save();
  await userToUnFollow.save();

  return result;
};

export const AuthServices = {
  registerUserIntoDB,
  signInUserFromDB,
  refreshToken,
  getProfileFromDB,
  updateProfileInDB,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUserFromDB,
  createAdminIntoDB,
  forgetPassword,
  resetPassword,
  getRecommendProfilesFromDB,
  getFollowingProfilesFromDB,
  getFollowersProfilesFromDB,
  initiatePaymentInDB,
  verifyPaymentInDB,
  unFollowUserInDB,
  followUserInDB,
};
