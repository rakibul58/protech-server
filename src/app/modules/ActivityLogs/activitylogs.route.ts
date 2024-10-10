import express from 'express';
import { ActivityLogControllers } from './activitylogs.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router
  .route('/login')
  .get(auth(USER_ROLE.admin), ActivityLogControllers.getAllActivityLogs);
router
  .route('/payment')
  .get(auth(USER_ROLE.admin), ActivityLogControllers.getAllPayments);
router
  .route('/monthly')
  .get(auth(USER_ROLE.admin), ActivityLogControllers.getMonthlyAnalytics);

export const ActivityLogRoutes = router;
