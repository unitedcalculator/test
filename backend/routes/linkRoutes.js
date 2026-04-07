import express from 'express';
import {
  createLink,
  getAllLinks,
  getLink,
  updateLink,
  deleteLink,
  getLinkStats,
} from '../controllers/linkController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/links
 * Create a new cloaked link
 * Auth: Required
 * Body: { slug, botUrl, userUrl, title, description }
 */
router.post('/', authMiddleware, createLink);

/**
 * GET /api/links
 * Get all links
 * Auth: Required
 */
router.get('/', authMiddleware, getAllLinks);

/**
 * GET /api/links/:slug
 * Get a specific link
 * Auth: Required
 */
router.get('/:slug', authMiddleware, getLink);

/**
 * PUT /api/links/:slug
 * Update a link
 * Auth: Required
 * Body: { botUrl, userUrl, title, description, cloakingEnabled }
 */
router.put('/:slug', authMiddleware, updateLink);

/**
 * DELETE /api/links/:slug
 * Delete a link
 * Auth: Required
 */
router.delete('/:slug', authMiddleware, deleteLink);

/**
 * GET /api/links/stats/overview
 * Get link statistics
 * Auth: Required
 */
router.get('/stats/overview', authMiddleware, getLinkStats);

export default router;
