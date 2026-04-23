import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { addDomain, listDomains, pollDomain, verifyDomain } from '../controllers/domainsController.js';

const router = express.Router();

// POST /api/domains/add
router.post('/add', authMiddleware, addDomain);

// GET /api/domains/list
router.get('/list', authMiddleware, listDomains);

// GET /api/domains/verify/:domain
router.get('/verify/:domain', authMiddleware, verifyDomain);

// GET /api/domains/poll/:domain
router.get('/poll/:domain', authMiddleware, pollDomain);

export default router;

