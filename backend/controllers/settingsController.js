import Settings from '../models/Settings.js';
import dns from 'dns';
import { promisify } from 'util';

/**
 * Settings Controller
 * Handles global cloaking settings
 */

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      // Create default settings
      settings = new Settings({
        userId: req.userId,
        cloakingEnabled: true,
        botUserAgents: [
          'Googlebot',
          'Bingbot',
          'Slurp',
          'DuckDuckBot',
          'Baiduspider',
          'YandexBot',
          'Sogou',
          'facebookexternalhit',
          'Twitterbot',
          'LinkedInBot',
          'WhatsApp',
          'Telegram'
        ],
        botIPs: [
          '66.249',
          '207.241',
          '202.97',
          '123.125',
        ],
      });
      await settings.save();
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { cloakingEnabled, customDomain, botUserAgents, botIPs, ipWhitelist, ipBlacklist } = req.body;

    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new Settings({ userId: req.userId });
    }

    if (cloakingEnabled !== undefined) settings.cloakingEnabled = cloakingEnabled;
    if (customDomain !== undefined) settings.customDomain = customDomain;
    if (botUserAgents) settings.botUserAgents = botUserAgents;
    if (botIPs) settings.botIPs = botIPs;
    if (ipWhitelist) settings.ipWhitelist = ipWhitelist;
    if (ipBlacklist) settings.ipBlacklist = ipBlacklist;
    settings.updatedAt = Date.now();

    await settings.save();
    res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const toggleCloaking = async (req, res) => {
  try {
    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      settings = new Settings({ userId: req.userId });
    }

    settings.cloakingEnabled = !settings.cloakingEnabled;
    await settings.save();

    res.json({
      message: `Cloaking ${settings.cloakingEnabled ? 'enabled' : 'disabled'}`,
      cloakingEnabled: settings.cloakingEnabled,
    });
  } catch (error) {
    console.error('Toggle cloaking error:', error);
    res.status(500).json({ error: 'Failed to toggle cloaking' });
  }
};

export const verifyDomain = async (req, res) => {
  try {
    const { domain } = req.body;

    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    let settings = await Settings.findOne({ userId: req.userId });

    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Generate a unique verification token for this user
    // In production, use crypto.randomBytes(16).toString('hex')
    const verificationToken = `clk-verify-${req.userId}`;

    // Check if TXT record exists on the domain
    const dnsTxt = promisify(dns.resolveTxt);
    
    try {
      const records = await dnsTxt(domain);
      
      // Look for our verification TXT record
      let isVerified = false;
      for (const record of records) {
        const txtValue = record.join('');
        if (txtValue.includes(verificationToken)) {
          isVerified = true;
          break;
        }
      }

      if (isVerified) {
        // Domain verified successfully
        settings.domainVerificationStatus = 'verified';
        settings.domainVerifiedAt = new Date();
        await settings.save();

        res.json({
          message: 'Domain verified successfully! 🎉',
          domainVerificationStatus: 'verified',
          domainVerifiedAt: settings.domainVerifiedAt,
        });
      } else {
        // TXT record not found
        settings.domainVerificationStatus = 'failed';
        await settings.save();

        res.status(400).json({
          error: 'Domain verification failed',
          details: `TXT record not found`,
          instructions: `Please add this TXT record to your domain on your domain registrar (GoDaddy, Namecheap, etc.):
          
Name/Host: ${domain}
Type: TXT
Value: ${verificationToken}

After adding the TXT record, wait 5-10 minutes for DNS propagation, then try verifying again.`,
          verificationToken,
          domainVerificationStatus: 'failed',
        });
      }
    } catch (dnsError) {
      // Domain doesn't exist or no TXT records
      settings.domainVerificationStatus = 'failed';
      await settings.save();

      res.status(400).json({
        error: 'Domain not found or invalid',
        details: dnsError.message,
        instructions: `Please add this TXT record to your domain on your domain registrar (GoDaddy, Namecheap, etc.):
Name/Host: ${domain}
Type: TXT
Value: clk-verify-${req.userId}

Make sure your domain DNS is accessible and then try again.`,
        verificationToken: `clk-verify-${req.userId}`,
        domainVerificationStatus: 'failed',
      });
    }
  } catch (error) {
    console.error('Domain verification error:', error);
    res.status(500).json({ error: 'Failed to verify domain' });
  }
};
