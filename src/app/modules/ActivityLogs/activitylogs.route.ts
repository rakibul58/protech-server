import express from 'express';
import { ActivityLogControllers } from './activitylogs.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router
  .route('/')
  .get(auth(USER_ROLE.admin), ActivityLogControllers.GetAllActivityLogs);

export const ActivityLogRoutes = router;
