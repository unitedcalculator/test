import Settings from '../models/Settings.js';

/**
 * Cloaking Middleware - EDUCATIONAL PURPOSE ONLY
 * 
 * This middleware demonstrates cloaking detection logic:
 * 1. Detects if request is from a bot (Googlebot, Bingbot, etc.)
 * 2. Detects if IP matches known bot IPs
 * 3. Serves different content based on detection
 * 
 * WARNING: This is for educational purposes only.
 * Using cloaking in production for SEO manipulation violates most search engine guidelines.
 */
export const detectBotOrUser = async (req, res, next) => {
  try {
    // Get settings from database
    let settings = await Settings.findOne();
    if (!settings) {
      // Create default settings if none exist
      settings = new Settings({
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
          '66.249',      // Google
          '207.241',     // Yahoo
          '202.97',      // Baidu
          '123.125',     // Baidu
        ],
      });
      await settings.save();
    }

    const userAgent = req.headers['user-agent'] || '';
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

    // Check IP whitelist (always treat as user)
    const isIpWhitelisted = settings.ipWhitelist.some(ip => clientIP.includes(ip));
    
    // Check IP blacklist (always treat as bot)
    const isIpBlacklisted = settings.ipBlacklist.some(ip => clientIP.includes(ip));

    let isBot = false;
    let botName = null;

    if (isIpBlacklisted) {
      isBot = true;
      botName = 'IP_BLACKLISTED';
    } else if (!isIpWhitelisted) {
      // Check User-Agent against known bot patterns
      for (const botAgent of settings.botUserAgents) {
        if (userAgent.includes(botAgent)) {
          isBot = true;
          botName = botAgent;
          break;
        }
      }

      // If not detected by UA, check IP patterns
      if (!isBot) {
        for (const botIP of settings.botIPs) {
          if (clientIP.includes(botIP)) {
            isBot = true;
            botName = 'IP_PATTERN';
            break;
          }
        }
      }
    }

    // Attach detection info to request
    req.cloaking = {
      isBot,
      botName,
      userAgent,
      clientIP,
      cloakingEnabled: settings.cloakingEnabled,
    };

    next();
  } catch (error) {
    console.error('Cloaking detection error:', error);
    // On error, default to treating as user
    req.cloaking = {
      isBot: false,
      botName: null,
      userAgent: req.headers['user-agent'] || '',
      clientIP: req.ip || req.connection.remoteAddress || 'unknown',
      cloakingEnabled: false,
    };
    next();
  }
};

export default detectBotOrUser;
