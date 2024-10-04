import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { PostRoutes } from '../modules/Post/post.route';

const router = Router();

// All the routes in the project
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/posts',
    route: PostRoutes,
  },
];

// lopping through the routes
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
