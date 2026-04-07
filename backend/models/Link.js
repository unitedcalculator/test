import mongoose from 'mongoose';

/**
 * Link Model for storing cloaked links
 * 
 * Educational Purpose: This model stores links that will serve different content
 * based on whether the requester is a bot or regular user.
 * 
 * WARNING: This is for educational and testing purposes only.
 * Do NOT use in production for SEO manipulation or cloaking.
 */
const linkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // User who created this link (multi-tenancy support)
  },
  slug: {
    type: String,
    required: true,
    trim: true,
    // Custom slug for the link (e.g., /go/product-name)
    // Unique per user, not globally unique
  },
  domain: {
    type: String,
    default: '',
    // Custom domain for this link (e.g., example.com)
    // Will match against req.hostname for multi-domain support
  },
  botUrl: {
    type: String,
    required: true,
    // URL served to detected bots (SEO-friendly content)
  },
  userUrl: {
    type: String,
    required: true,
    // URL served to regular users (redirect destination)
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  cloakingEnabled: {
    type: Boolean,
    default: true,
    // Can disable cloaking per link
  },
  clicks: {
    type: Number,
    default: 0,
  },
  botClicks: {
    type: Number,
    default: 0,
  },
  userClicks: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create compound unique index: each user can have same slug on different domains
linkSchema.index({ userId: 1, slug: 1 }, { unique: true });
linkSchema.index({ domain: 1, slug: 1 });

export default mongoose.model('Link', linkSchema);
