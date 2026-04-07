/**
 * CLOAKING SYSTEM - EDUCATIONAL PURPOSE ONLY
 * 
 * WARNING: This is an experimental educational system demonstrating cloaking concepts.
 * 
 * IMPORTANT LEGAL/ETHICAL NOTES:
 * - Search engine cloaking violates most search engine guidelines (Google, Bing, etc.)
 * - Using cloaking for SEO manipulation can result in:
 *   * De-indexing from search results
 *   * Permanent domain bans
 *   * Legal issues in some jurisdictions
 * - This system is ONLY for educational and testing purposes
 * - Do NOT use in production for real-world SEO manipulation
 * 
 * WHAT THIS SYSTEM DOES:
 * - Detects requests from bots (via User-Agent and IP)
 * - Serves different content to bots vs regular users
 * - Logs all requests and click data
 * - Provides an admin dashboard for management
 * 
 * SETUP INSTRUCTIONS:
 * 1. Install MongoDB (local or cloud)
 * 2. Run: npm install (in both backend and frontend folders)
 * 3. Create .env file in backend folder with:
 *    MONGODB_URI=mongodb://localhost:27017/clocker
 *    PORT=5000
 *    JWT_SECRET=your_jwt_secret_key_change_this
 *    FRONTEND_URL=http://localhost:5173
 * 4. Start backend: npm run dev
 * 5. Start frontend: npm run dev
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import linkRoutes from './routes/linkRoutes.js';
import logRoutes from './routes/logRoutes.js';
import settingsRoutes from './routes/settingsRoutes.js';
import publicRoutes from './routes/publicRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/settings', settingsRoutes);

// Public cloaking route (no auth required)
app.use('/go', publicRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', educational: 'This is an educational cloaking system' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  // console.log('===================================');
  // console.log('EDUCATIONAL CLOAKING SYSTEM');
  // console.log('===================================');
  console.log(`Server running on http://localhost:${PORT}`);
  // console.log('');
  // console.log('WARNING: This is for educational purposes only.');
  // console.log('Do NOT use in production for SEO manipulation.');
  // console.log('===================================');
});
