// import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import { BookingServices } from './booking.service';
// import sendResponse from '../../utils/sendResponse';



const PaymentBooking = catchAsync(async (req, res) => {
  const result = await BookingServices.paymentBookingIntoDB(req.params.id);
  
  // sendResponse(res, {
  //   statusCode: httpStatus.OK,
  //   success: true,
  //   message: 'Booking Payment Successful',
  //   data: result,
  // });
  res.send(result)
});

export const BookingControllers = {
  PaymentBooking,
};
