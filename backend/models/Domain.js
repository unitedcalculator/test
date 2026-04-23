import mongoose from 'mongoose';

/**
 * Domain Model
 * Stores client domains that point nameservers to this cloaker.
 */
const domainSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    domainName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    verified: {
      type: Boolean,
      default: false,
      index: true,
    },
    nameserversExpected: {
      type: [String],
      default: [],
    },
    nameserversCurrent: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

// Each user can add a domain once; different users can’t share the same verified domain.
domainSchema.index({ userId: 1, domainName: 1 }, { unique: true });
domainSchema.index({ domainName: 1, verified: 1 });

export default mongoose.model('Domain', domainSchema);

