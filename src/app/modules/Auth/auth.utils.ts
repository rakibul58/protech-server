/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';
import config from '../../config';

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

export const generateTransactionId = () => {
  return 'TXN-' + crypto.randomBytes(16).toString('hex');
};

export const initiatePayment = async (paymentData: any) => {
  try {
    const response = await axios.post(config.base_url!, {
      store_id: config.store_id,
      signature_key: config.signature_key,
      tran_id: paymentData.transactionId,
      success_url: `${config.backend_url}/auth/verify-payment?transactionId=${paymentData.transactionId}&status=success&customerName=${paymentData.customerName}`,
      fail_url: `${config.backend_url}/auth/verify-payment?transactionId=${paymentData.transactionId}&status=failed&customerName=${paymentData.customerName}`,
      cancel_url: `${config.backend_url}/auth/verify-payment?transactionId=${paymentData.transactionId}&status=cancelled&customerName=${paymentData.customerName}`,
      amount: paymentData.totalPrice,
      currency: 'USD',
      desc: 'Merchant Registration Payment',
      cus_name: paymentData.customerName,
      cus_email: paymentData.customerEmail,
      cus_add1: paymentData.customerAddress,
      cus_add2: 'N/A',
      cus_city: 'N/A',
      cus_state: 'N/A',
      cus_postcode: 'N/A',
      cus_country: 'N/A',
      cus_phone: paymentData.customerPhone,
      type: 'json',
    });

    return response.data;
  } catch (err) {
    throw new Error('Payment initiation failed!');
  }
};

export const verifyPayment = async (tnxId: string) => {
  try {
    const response = await axios.get(config.base_url!, {
      params: {
        store_id: config.store_id,
        signature_key: config.signature_key,
        type: 'json',
        request_id: tnxId,
      },
    });

    return response.status;
  } catch (err) {
    throw new Error('Payment validation failed!');
  }
};
