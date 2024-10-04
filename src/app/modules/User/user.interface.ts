import { Model, Types } from 'mongoose';
import { USER_ROLE } from './user.constant';

/* eslint-disable no-unused-vars */

// User Interface
export interface IUser {
  _id?: Types.ObjectId | string;
  name: string;
  email: string;
  role?: 'admin' | 'user';
  password?: string;
  phone?: string;
  address?: string;
  isDeleted: boolean;
  preferences?: string;
  isVerified?: boolean;
  isBlocked?: boolean;
  passwordChangedAt?: Date;
  profileImg?: string;
  followers?: Types.ObjectId[];
  following?: Types.ObjectId[];
}

// User Static Model
export interface UserModel extends Model<IUser> {
  isUserExistsByEmail(email: string): Promise<IUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number,
  ): boolean;
}

// SignIn User interface
export interface ISignInUser {
  email: string;
  password: string;
}

// Type of user role

export type TUserRole = keyof typeof USER_ROLE;
