import Link from '../models/Link.js';

/**
 * Link Controller
 * Handles CRUD operations for cloaked links
 */

export const createLink = async (req, res) => {
  try {
    const { slug, botUrl, userUrl, title, description } = req.body;

    // Validate input
    if (!slug || !botUrl || !userUrl || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if slug already exists
    const existingLink = await Link.findOne({ slug });
    if (existingLink) {
      return res.status(400).json({ error: 'Slug already exists' });
    }

    // Create new link
    const link = new Link({
      slug,
      botUrl,
      userUrl,
      title,
      description,
    });

    await link.save();
    res.status(201).json({ message: 'Link created successfully', link });
  } catch (error) {
    console.error('Create link error:', error);
    res.status(500).json({ error: 'Failed to create link' });
  }
};

export const getAllLinks = async (req, res) => {
  try {
    const links = await Link.find().sort({ createdAt: -1 });
    res.json(links);
  } catch (error) {
    console.error('Get links error:', error);
    res.status(500).json({ error: 'Failed to fetch links' });
  }
};

export const getLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOne({ slug });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json(link);
  } catch (error) {
    console.error('Get link error:', error);
    res.status(500).json({ error: 'Failed to fetch link' });
  }
};

export const updateLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const { botUrl, userUrl, title, description, cloakingEnabled } = req.body;

    const link = await Link.findOne({ slug });
    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    // Update fields
    if (botUrl) link.botUrl = botUrl;
    if (userUrl) link.userUrl = userUrl;
    if (title) link.title = title;
    if (description !== undefined) link.description = description;
    if (cloakingEnabled !== undefined) link.cloakingEnabled = cloakingEnabled;
    link.updatedAt = Date.now();

    await link.save();
    res.json({ message: 'Link updated successfully', link });
  } catch (error) {
    console.error('Update link error:', error);
    res.status(500).json({ error: 'Failed to update link' });
  }
};

export const deleteLink = async (req, res) => {
  try {
    const { slug } = req.params;
    const link = await Link.findOneAndDelete({ slug });

    if (!link) {
      return res.status(404).json({ error: 'Link not found' });
    }

    res.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Delete link error:', error);
    res.status(500).json({ error: 'Failed to delete link' });
  }
};

export const getLinkStats = async (req, res) => {
  try {
    const links = await Link.aggregate([
      {
        $group: {
          _id: null,
          totalClicks: { $sum: '$clicks' },
          totalBotClicks: { $sum: '$botClicks' },
          totalUserClicks: { $sum: '$userClicks' },
          totalLinks: { $sum: 1 },
        },
      },
    ]);

    if (links.length === 0) {
      return res.json({
        totalClicks: 0,
        totalBotClicks: 0,
        totalUserClicks: 0,
        totalLinks: 0,
      });
    }

    res.json(links[0]);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};
