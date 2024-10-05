import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { PostValidations } from './post.validation';
import { PostControllers } from './post.controller';
import validateRequest from '../../middlewares/validateRequest';

const router = express.Router();

router
  .route('/')
  .get(auth(USER_ROLE.user, USER_ROLE.admin), PostControllers.getAllPosts)
  .post(
    auth(USER_ROLE.user, USER_ROLE.admin),
    validateRequest(PostValidations.createPostValidationSchema),
    PostControllers.createPost,
  );

router
  .route('/:id/upvote')
  .post(auth(USER_ROLE.user), PostControllers.upVotePost);
router
  .route('/:id/downvote')
  .post(auth(USER_ROLE.user), PostControllers.downVotePost);

export const PostRoutes = router;
