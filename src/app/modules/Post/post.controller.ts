import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostServices } from './post.service';

const createPost = catchAsync(async (req, res) => {
  const result = await PostServices.createPostInDB(req.body, req.user._id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post created Successfully',
    data: result,
  });
});

const getAllPosts = catchAsync(async (req, res) => {
  const result = await PostServices.getAllPostFromDB(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post fetched Successfully',
    data: result,
  });
});

const upVotePost = catchAsync(async (req, res) => {
  const result = await PostServices.upVotePostsInDB(
    req.params.id,
    req.user._id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post UpVoted Successfully',
    data: result,
  });
});

const downVotePost = catchAsync(async (req, res) => {
  const result = await PostServices.downVotePostsInDB(
    req.params.id,
    req.user._id,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post DownVoted Successfully',
    data: result,
  });
});

const getMyPost = catchAsync(async (req, res) => {
  const result = await PostServices.getMyPostFromDB(req.user, req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts Fetched Successfully',
    data: result,
  });
});

const getSinglePost = catchAsync(async (req, res) => {
  const result = await PostServices.getSinglePostFromDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts Fetched Successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const result = await PostServices.updatePostInDB(req.params.id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts updated Successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  const result = await PostServices.deletePostInDB(req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Posts deleted Successfully',
    data: result,
  });
});

export const PostControllers = {
  createPost,
  getAllPosts,
  upVotePost,
  downVotePost,
  getMyPost,
  getSinglePost,
  updatePost,
  deletePost,
};
