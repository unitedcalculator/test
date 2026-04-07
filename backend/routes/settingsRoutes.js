import express from 'express';
import {
  getSettings,
  updateSettings,
  toggleCloaking,
  verifyDomain,
} from '../controllers/settingsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/settings
 * Get all settings
 * Auth: Required
 */
router.get('/', authMiddleware, getSettings);

/**
 * PUT /api/settings
 * Update settings
 * Auth: Required
 * Body: { cloakingEnabled, botUserAgents, botIPs, ipWhitelist, ipBlacklist }
 */
router.put('/', authMiddleware, updateSettings);

/**
 * POST /api/settings/toggle
 * Toggle global cloaking
 * Auth: Required
 */
router.post('/toggle', authMiddleware, toggleCloaking);

/**
 * POST /api/settings/verify-domain
 * Verify custom domain (like Vercel)
 * Auth: Required
 * Body: { domain }
 */
router.post('/verify-domain', authMiddleware, verifyDomain);

export default router;
