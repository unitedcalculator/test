import express from 'express';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { username, email, password, confirmPassword }
 */
router.post('/register', register);

/**
 * POST /api/auth/login
 * Login a user
 * Body: { email, password }
 */
router.post('/login', login);

export default router;
