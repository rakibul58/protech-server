import bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { ISignInUser, IUser } from '../User/user.interface';
import { User } from '../User/user.model';
import config from '../../config';
import { createToken, verifyToken } from './auth.utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { USER_ROLE } from '../User/user.constant';
import { sendEmail } from '../../utils/sendEmail';
import { Types } from 'mongoose';
import QueryBuilder from '../../builder/QueryBuilder';

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

  const jwtPayload = {
    _id: user._id,
    email: user.email,
    role: user.role,
    profileImg: user.profileImg,
    name: user.name,
    isVerified: user.isVerified,
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

const getAllUsersFromDB = async () => {
  const result = await User.find();
  return result;
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

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }
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

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }
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

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

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
};
