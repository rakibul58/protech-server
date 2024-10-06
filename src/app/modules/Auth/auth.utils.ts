import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

// creating jwt token
export const createToken = (
  jwtPayload: {
    _id: Types.ObjectId;
    role: string;
    email: string;
    profileImg: string;
    name: string;
    isVerified: boolean;
  },
  secret: string,
  expiresIn: string,
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

// verifies token
export const verifyToken = (token: string, secret: string) => {
  return jwt.verify(token, secret) as JwtPayload;
};
