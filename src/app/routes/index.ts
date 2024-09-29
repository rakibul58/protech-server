import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';

const router = Router();

// All the routes in the project
const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
];

// lopping through the routes
moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
