import mongoose from 'mongoose';

/**
 * Log Model for tracking all requests
 * 
 * Logs every request with:
 * - IP address
 * - User-Agent
 * - Detection type (bot or user)
 * - Timestamp
 * - Accessed link
 */
const logSchema = new mongoose.Schema({
  slug: {
    type: String,
    required: true,
    index: true,
  },
  domain: {
    type: String,
    // Which domain was used to access (multi-domain support)
  },
  ipAddress: {
    type: String,
    required: true,
  },
  userAgent: {
    type: String,
  },
  detectedType: {
    type: String,
    enum: ['bot', 'user'],
    required: true,
  },
  botName: {
    type: String,
    // If detected as bot, which bot (Googlebot, Bingbot, etc.)
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  country: {
    type: String,
    // Can be populated with GeoIP data
  },
});

export default mongoose.model('Log', logSchema);
