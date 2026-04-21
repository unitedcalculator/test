
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
function parseAllowedOrigins(envValue) {
  return (envValue || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function isAllowedOrigin(origin) {
  if (!origin) return true; // non-browser / same-origin / server-to-server

  const explicit = new Set([
    ...parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
    ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
    'http://localhost:5173',
    'http://localhost:3000',
  ]);

  if (explicit.has(origin)) return true;

  // Optional: allow any Vercel preview/prod domain when running on Vercel
  // (Set ALLOW_VERCEL_ORIGINS=true if you want this behavior.)
  // If deployed on Vercel, default to allowing *.vercel.app unless explicitly disabled.
  const allowVercelOrigins =
    String(process.env.ALLOW_VERCEL_ORIGINS).toLowerCase() === 'true' ||
    (process.env.VERCEL && String(process.env.ALLOW_VERCEL_ORIGINS).toLowerCase() !== 'false');

  if (allowVercelOrigins) {
    try {
      const { protocol, hostname } = new URL(origin);
      if (protocol === 'https:' && hostname.endsWith('.vercel.app')) return true;
    } catch {
      // ignore malformed origins
    }
  }

  // In development, allow all origins to reduce friction.
  if (process.env.NODE_ENV === 'development') return true;

  return false;
}

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

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
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'CORS blocked for this origin' });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => { 
  console.log(`Server running on http://localhost:${PORT}`); 
});
