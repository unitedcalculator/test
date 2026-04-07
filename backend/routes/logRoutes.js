import express from 'express';
import { getLogs, getLogStats, clearLogs } from '../controllers/logController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * GET /api/logs
 * Get logs with filtering
 * Auth: Required
 * Query params: slug, type (bot/user), startDate, endDate, limit, skip
 */
router.get('/', authMiddleware, getLogs);

/**
 * GET /api/logs/stats
 * Get log statistics
 * Auth: Required
 */
router.get('/stats/overview', authMiddleware, getLogStats);

/**
 * DELETE /api/logs/clear
 * Clear all logs
 * Auth: Required
 */
router.delete('/clear', authMiddleware, clearLogs);

export default router;
