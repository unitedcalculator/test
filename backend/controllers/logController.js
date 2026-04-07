import Log from '../models/Log.js';

/**
 * Log Controller
 * Handles viewing and filtering logs
 */

export const getLogs = async (req, res) => {
  try {
    const { slug, type, startDate, endDate, limit = 100, skip = 0 } = req.query;

    // Build filter object
    const filter = {};
    if (slug) filter.slug = slug;
    if (type) filter.detectedType = type;

    // Date range filtering
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Fetch logs with pagination
    const logs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Log.countDocuments(filter);

    res.json({
      logs,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip),
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
};

export const getLogStats = async (req, res) => {
  try {
    const stats = await Log.aggregate([
      {
        $group: {
          _id: '$detectedType',
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {
      bot: 0,
      user: 0,
    };

    stats.forEach(stat => {
      if (stat._id === 'bot') result.bot = stat.count;
      if (stat._id === 'user') result.user = stat.count;
    });

    res.json({
      total: result.bot + result.user,
      bot: result.bot,
      user: result.user,
    });
  } catch (error) {
    console.error('Get log stats error:', error);
    res.status(500).json({ error: 'Failed to fetch log stats' });
  }
};

export const clearLogs = async (req, res) => {
  try {
    await Log.deleteMany({});
    res.json({ message: 'All logs cleared' });
  } catch (error) {
    console.error('Clear logs error:', error);
    res.status(500).json({ error: 'Failed to clear logs' });
  }
};
