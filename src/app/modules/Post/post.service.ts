import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { IPost } from './post.interface';
import { Post } from './post.model';

const createPostInDB = async (payload: Partial<IPost>, author:string) => {
  const postData = await Post.create({...payload, author});
  return postData;
};

// getting all the post
const getAllPostFromDB = async (query: Record<string, unknown>) => {
  const PostQuery = new QueryBuilder(Post.find().populate('author'), query)
    .search(['content' , 'categories'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PostQuery.modelQuery;
  const meta = await PostQuery.countTotal();

  // checking if there is any cars
  if (result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }
  return { result, meta };
};

export const PostServices = {
  createPostInDB,
  getAllPostFromDB
};
