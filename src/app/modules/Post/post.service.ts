import httpStatus from 'http-status';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../errors/AppError';
import { IPost } from './post.interface';
import { Post } from './post.model';
import { Types } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

const createPostInDB = async (payload: Partial<IPost>, author: string) => {
  const postData = await Post.create({ ...payload, author });
  return postData;
};

// getting all the post
const getAllPostFromDB = async (query: Record<string, unknown>) => {
  const PostQuery = new QueryBuilder(Post.find().populate('author'), query)
    .search(['content', 'categories'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PostQuery.modelQuery;
  const meta = await PostQuery.countTotal();

  return { result, meta };
};

const upVotePostsInDB = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const userObjectId = new Types.ObjectId(userId);

  // Ensure upvotes array exists
  post.upvotes = post.upvotes || [];

  if (!post.upvotes.some(id => id.equals(userObjectId))) {
    post.upvotes.push(userObjectId);

    // Ensure downvotes array exists
    post.downvotes = post.downvotes || [];
    post.downvotes = post.downvotes.filter((id: Types.ObjectId) => {
      return !id.equals(userObjectId);
    });
    post.upvoteCount = post.upvotes.length;
    post.downvoteCount = post.downvotes.length;

    await post.save();
    return { message: 'UpVoted successfully.' };
  } else {
    return { message: 'Already UpVoted.' };
  }
};

const downVotePostsInDB = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'No Data Found');
  }

  const userObjectId = new Types.ObjectId(userId);

  // Ensure downvotes array exists
  post.downvotes = post.downvotes || [];

  if (!post.downvotes.some(id => id.equals(userObjectId))) {
    post.downvotes.push(userObjectId);

    // Ensure upvotes array exists
    post.upvotes = post.upvotes || [];
    post.upvotes = post.upvotes.filter((id: Types.ObjectId) => {
      return !id.equals(userObjectId);
    });

    post.upvoteCount = post.upvotes.length;
    post.downvoteCount = post.downvotes.length;
    await post.save();
    return { message: 'DownVoted successfully.' };
  } else {
    return { message: 'Already DownVoted.' };
  }
};

const getMyPostFromDB = async (
  user: JwtPayload,
  query: Record<string, unknown>,
) => {
  const PostQuery = new QueryBuilder(
    Post.find({ author: user._id }).populate('author'),
    query,
  )
    .search(['content', 'categories'])
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await PostQuery.modelQuery;
  const meta = await PostQuery.countTotal();

  return { result, meta };
};

const getSinglePostFromDB = async (postId: string) => {
  return await Post.findById(postId).populate('author');
};

const updatePostInDB = async (postId: string, payload: { content: string }) => {
  return await Post.findByIdAndUpdate(postId, payload);
};

const deletePostInDB = async (postId: string) => {
  return await Post.findByIdAndDelete(postId);
};

export const PostServices = {
  createPostInDB,
  getAllPostFromDB,
  upVotePostsInDB,
  downVotePostsInDB,
  getMyPostFromDB,
  getSinglePostFromDB,
  updatePostInDB,
  deletePostInDB,
};
