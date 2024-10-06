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
  (post.comments as Types.ObjectId[]).push(comment._id);
  await post.save();
};

const getCommentFromDB = async (query: Record<string, unknown>) => {
  const CommentQuery = new QueryBuilder(
    Comment.find({ parent: null }).populate(
      'author',
      '_id email name profileImg isVerified',
    ),
    query,
  )
    .search(['content'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await CommentQuery.modelQuery;
  const meta = await CommentQuery.countTotal();

  return { result, meta };
};

const updateCommentInDB = async () => {};
const deleteCommentInDB = async () => {};

export const CommentService = {
  createCommentInDB,
  getCommentFromDB,
  updateCommentInDB,
  deleteCommentInDB,
};
