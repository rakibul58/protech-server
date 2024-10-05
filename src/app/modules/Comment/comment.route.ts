import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';
import { CommentController } from './comment.controller';
import validateRequest from '../../middlewares/validateRequest';
import { CommentValidation } from './comment.validation';

const router = express.Router();

router
  .route('/')
  .get(auth(USER_ROLE.user, USER_ROLE.admin), CommentController.getAllComment)
  .post(
    auth(USER_ROLE.user, USER_ROLE.admin),
    validateRequest(CommentValidation.createUpdateCommentSchema),
    CommentController.CreateComment,
  );

router
  .route('/:id')
  .delete(
    auth(USER_ROLE.user, USER_ROLE.admin),
    CommentController.deleteComment,
  )
  .put(
    auth(USER_ROLE.user, USER_ROLE.admin),
    validateRequest(CommentValidation.createUpdateCommentSchema),
    CommentController.updateComment,
  );

export const CommentRoutes = router;
