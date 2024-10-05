import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentService } from './comment.service';

const CreateComment = catchAsync(async (req, res) => {
  const result = await CommentService.createCommentInDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment Added Successfully!',
    data: result,
  });
});

const getAllComment = catchAsync(async (req, res) => {
  const result = await CommentService.getCommentFromDB(req.query);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment Fetched Successfully!',
    data: result,
  });
});

const updateComment = catchAsync(async (req, res) => {
  const result = await CommentService.updateCommentInDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment Updated Successfully!',
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  const result = await CommentService.deleteCommentInDB();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment Deleted Successfully!',
    data: result,
  });
});

export const CommentController = {
  CreateComment,
  getAllComment,
  updateComment,
  deleteComment,
};
