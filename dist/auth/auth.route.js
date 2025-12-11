import { Hono } from 'hono';
import * as authControllers from './auth.controller.js';
import { saveOTPService, verifyOTPService, updateUserPasswordService } from "../users/user.service.js";
const authRoutes = new Hono();
// create new user
authRoutes.post('/auth/register', authControllers.createUser);
// user login
authRoutes.post('/auth/login', authControllers.loginUser);
// //request for reset
authRoutes.post("auth/request-reset", authControllers.requestPasswordReset);
// //reset password
authRoutes.post("auth/reset-password", authControllers.resetPassword);
export default authRoutes;
