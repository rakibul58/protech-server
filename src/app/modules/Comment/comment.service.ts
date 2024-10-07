/* eslint-disable @typescript-eslint/no-explicit-any */
import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { IComment } from './comment.interface';
import { Comment } from './comment.model';
import { Post } from '../Post/post.model';
import AppError from '../../errors/AppError';
import httpStatus from 'http-status';
import { Types } from 'mongoose';

const createCommentInDB = async (
  payload: Partial<IComment>,
  user: JwtPayload,
) => {
  // Check if post exists
  const post = await Post.findById(payload.post);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  // Create comment
  const comment = new Comment({
    content: payload.content,
    post: payload.post,
    author: user._id,
    parent: payload.parent || null,
  });

  await comment.save();

  // Add commentId to post
  if (comment.parent === null) {
    (post.comments as Types.ObjectId[]).push(comment._id);
  }
  const result = await post.save();
  return result;
};

const getCommentReplies = async (
  commentId: Types.ObjectId,
): Promise<IComment[]> => {
  const replies = await Comment.find({ parent: commentId })
    .populate('author', '_id email name profileImg isVerified')
    .sort({ createdAt: -1 })
    .lean(); // Convert Mongoose documents to plain JavaScript objects

  const populatedReplies = await Promise.all(
    replies.map(async reply => {
      const nestedReplies = await getCommentReplies(
        reply._id as Types.ObjectId,
      );
      return { ...reply, replies: nestedReplies }; // Add replies field to the plain object
    }),
  );

  return populatedReplies;
};

const getCommentFromDB = async (
  query: Record<string, unknown>,
  postId: string,
) => {
  const CommentQuery = new QueryBuilder(
    Comment.find({ parent: null, post: postId })
      .populate('author', '_id email name profileImg isVerified')
      .lean(), // Convert Mongoose documents to plain JavaScript objects
    query,
  )
    .search(['content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await CommentQuery.modelQuery;
  const meta = await CommentQuery.countTotal();

  const populatedComments = await Promise.all(
    result.map(async comment => {
      const replies = await getCommentReplies(comment._id as Types.ObjectId);
      return { ...comment, replies }; // Add replies to each comment object
    }),
  );

  return { result: populatedComments, meta };
};

const updateCommentInDB = async (
  user: JwtPayload,
  id: string,
  payload: Partial<IComment>,
) => {
  // Check if comment exists
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if the user is the author of the comment
  if (comment.author.toString() !== user._id.toString()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to update this comment',
    );
  }

  // Update comment
  comment.content = payload.content as string;
  const result = await comment.save();
  return result;
};

const deleteCommentInDB = async (user: JwtPayload, id: string) => {
  // Check if comment exists
  const comment = await Comment.findById(id);
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  // Check if the user is the author of the comment
  if (comment.author.toString() !== user._id.toString()) {
    throw new AppError(
      httpStatus.UNAUTHORIZED,
      'You are not authorized to delete this comment',
    );
  }

  // Delete the comment and its replies
  await Comment.deleteMany({
    $or: [{ _id: id }, { parent: id }],
  });

  // Remove the commentId from the post
  const result = await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: id },
  });

  return result;
};

export const CommentService = {
  createCommentInDB,
  getCommentFromDB,
  updateCommentInDB,
  deleteCommentInDB,
};
