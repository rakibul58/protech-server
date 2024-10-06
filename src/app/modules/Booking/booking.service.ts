/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from '../User/user.model';
import { Booking } from './booking.model';
import { initiatePayment, verifyPayment } from './booking.utlis';
import { IUser } from '../User/user.interface';
import crypto from 'crypto';
import { join } from 'path';
import { readFileSync } from 'fs';

const generateTransactionId = () => {
  return 'TXN-' + crypto.randomBytes(16).toString('hex');
};

// payment service
const paymentBookingIntoDB = async (bookingId: string) => {
  // const bookingData = await Booking.findById(bookingId);

  // const userData = (await User.findById(bookingData?.user)) as IUser;
  // // checking if booking exists
  // if (!bookingData) {
  //   throw new AppError(httpStatus.NOT_FOUND, 'This booking does not exists');
  // }

  // // double checking if the car is returned
  // if (bookingData.status !== 'Returned') {
  //   throw new AppError(httpStatus.BAD_REQUEST, 'This Car is not Returned');
  // }

  // await Booking.findByIdAndUpdate(bookingId, {
  //   transactionId: 'TXN-' + bookingData._id,
  //   paymentStatus: 'Paid',
  // });

  // const paymentData = {
  //   transactionId: 'TXN-' + bookingData._id,
  //   totalPrice: bookingData.totalCost,
  //   custormerName: userData.name,
  //   customerEmail: userData.email,
  //   customerPhone: userData.phone,
  //   customerAddress: userData.address,
  // };

  // const paymentSession = await initiatePayment(paymentData);

  // return paymentSession;
  // return render('payment-success', { title: 'Payment Successful', message: 'Your payment was successful!' });

  const filePath = join(__dirname, '../../views/payment-success.html');
  let template = readFileSync(filePath, 'utf-8');
  const transactionId = generateTransactionId();
  const name = 'Rakibul Hasan';
  template = template.replace('{{transactionId}}', transactionId);
  template = template.replace('{{name}}', name);

  return template;
};

export const BookingServices = {
  paymentBookingIntoDB,
};
