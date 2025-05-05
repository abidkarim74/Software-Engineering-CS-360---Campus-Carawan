import { Router } from 'express';
import {
  refreshTokenFunc,
  loginFunc,
  signupFunc,
  logoutFunc,
  sendOTP,
  verifyOTP,
  getAuthenticatedUser,
  changePassword
} from '../controllers/authControllers.js';
import verify from '../middleware/protectRoute.js';

const router = Router();

// public
router.post('/signup', signupFunc);
router.post('/login', loginFunc);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);

// protected
router.post('/refresh', verify, refreshTokenFunc);
router.post('/logout', verify, logoutFunc);
router.get('/me', verify, getAuthenticatedUser);
router.post("/change-password", verify, changePassword);

export default router;
