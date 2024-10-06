import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import { Comment } from './comment.model';
import AppError from '../../errors/AppError';

const createCommentInDB = async () => {};

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

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }
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
