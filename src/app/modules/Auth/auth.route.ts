import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { UserValidations } from '../User/user.validation';
import { AuthControllers } from './auth.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from '../User/user.constant';

const router = express.Router();

router.route('/signup').post(
  validateRequest(UserValidations.userRegisterValidationSchema), // validating schema
  AuthControllers.signupUser,
);

router.route('/create-admin').post(
  auth(USER_ROLE.admin),
  validateRequest(UserValidations.createAdminValidationSchema), // validating schema
  AuthControllers.signupUser,
);

router
  .route('/signin')
  .post(
    validateRequest(UserValidations.signinValidationSchema),
    AuthControllers.signInUser,
  );

router.post(
  '/refresh-token',
  validateRequest(UserValidations.refreshTokenValidationSchema),
  AuthControllers.refreshToken,
);

router
  .route('/me')
  .get(auth(USER_ROLE.user, USER_ROLE.admin), AuthControllers.getProfileData)
  .put(
    auth(USER_ROLE.user, USER_ROLE.admin),
    validateRequest(UserValidations.profileUpdateValidation),
    AuthControllers.updateProfileData,
  );

router
  .route('/recommended')
  .get(auth(USER_ROLE.user), AuthControllers.getRecommendProfiles);

router
  .route('/following')
  .get(auth(USER_ROLE.user), AuthControllers.getFollowingProfiles);

router
  .route('/followers')
  .get(auth(USER_ROLE.user), AuthControllers.getFollowersProfiles);

router
  .route('/users/:id')
  .get(auth(USER_ROLE.admin), AuthControllers.getSingleUser)
  .put(
    auth(USER_ROLE.admin),
    validateRequest(UserValidations.updateUserValidation),
    AuthControllers.updateUser,
  );

router.route('/users').get(auth(USER_ROLE.admin), AuthControllers.getAllUsers);

router.post(
  '/forget-password',
  validateRequest(UserValidations.forgetPasswordValidationSchema),
  AuthControllers.forgetPassword,
);

router.post(
  '/reset-password',
  validateRequest(UserValidations.resetPasswordValidationSchema),
  AuthControllers.resetPassword,
);

router.post(
  '/initiate-payment',
  auth(USER_ROLE.user),
  AuthControllers.initiatePayment,
);

router.post('/verify-payment', AuthControllers.verifyPayment);

router.post(
  '/follow/user/:userId',
  auth(USER_ROLE.user),
  AuthControllers.followUser,
);

router.post(
  '/unFollow/user/:userId',
  auth(USER_ROLE.user),
  AuthControllers.unFollowUser,
);

export const AuthRoutes = router;
