import mongoose from 'mongoose';

/**
 * Settings Model for per-user configuration
 * 
 * Stores:
 * - Per-user cloaking ON/OFF switch
 * - Bot detection rules per user
 * - IP whitelist/blacklist per user
 * - Custom domain per user
 */
const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    // Each user has their own settings record
  },
  cloakingEnabled: {
    type: Boolean,
    default: true,
    // Global on/off switch for cloaking
  },
  customDomain: {
    type: String,
    default: '',
    // Custom domain for cloaking links (e.g., https://mybrand.com)
  },
  domainVerificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed'],
    default: 'pending',
    // Status of domain verification (like Vercel)
  },
  domainVerifiedAt: {
    type: Date,
    default: null,
    // Timestamp when domain was verified
  },
  botUserAgents: [{
    type: String,
    // List of User-Agent strings to detect as bots
  }],
  botIPs: [{
    type: String,
    // List of IP ranges or specific IPs to detect as bots
  }],
  ipWhitelist: [{
    type: String,
    // IPs that should always be treated as users
  }],
  ipBlacklist: [{
    type: String,
    // IPs that should always be treated as bots
  }],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for fast user lookups
settingsSchema.index({ userId: 1 });

export default mongoose.model('Settings', settingsSchema);
