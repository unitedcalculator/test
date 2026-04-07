import express from 'express';
import Link from '../models/Link.js';
import Log from '../models/Log.js';
import Settings from '../models/Settings.js';
import { detectBotOrUser } from '../middleware/cloakingMiddleware.js';
import puppeteer from 'puppeteer';

const router = express.Router();

/**
 * PUBLIC ROUTE - No authentication required
 * 
 * GET /go/:slug
 * Access a cloaked link
 * 
 * This endpoint demonstrates the cloaking logic:
 * 1. Detects if request is from a bot or user
 * 2. Logs the request to database
 * 3. Serves different content based on detection:
 *    - Bot: Returns SEO-friendly HTML for botUrl
 *    - User: Redirects to userUrl
 * 
 * EDUCATIONAL PURPOSE ONLY - Using this in production for SEO manipulation
 * violates search engine guidelines and is not recommended.
 */
router.get('/:slug', detectBotOrUser, async (req, res) => {
  try {
    const { slug } = req.params;
    const { isBot, botName, cloakingEnabled } = req.cloaking;
    
    // Get the domain that was accessed (multi-domain support)
    const accessedDomain = req.hostname;
    console.log(`[MULTI-DOMAIN] Cloaking accessed from domain: ${accessedDomain}`);

    // Step 1: Find which user owns this domain
    let userId = null;
    const userSettings = await Settings.findOne({ customDomain: accessedDomain });
    
    if (userSettings) {
      userId = userSettings.userId;
      console.log(`[MULTI-DOMAIN] Domain ${accessedDomain} belongs to user ${userId}`);
      
      // Check if domain is verified
      if (userSettings.domainVerificationStatus !== 'verified') {
        return res.status(403).json({
          error: 'Domain not verified',
          educational: 'This is an educational cloaking system',
          details: `Domain verification status: ${userSettings.domainVerificationStatus}. Please verify your domain in settings.`,
        });
      }
    } else {
      console.log(`[MULTI-DOMAIN] No user found for domain ${accessedDomain} - falling back to slug-only lookup`);
    }

    // Step 2: Find the link (with userId if available, otherwise just slug)
    let link;
    if (userId) {
      // Multi-tenant lookup: userId + slug
      link = await Link.findOne({ userId, slug });
    } else {
      // Fallback: just slug (for backwards compatibility)
      link = await Link.findOne({ slug });
    }

    if (!link) {
      return res
        .status(404)
        .json({ error: 'Link not found', educational: 'This is an educational cloaking system' });
    }

    // Check if cloaking is enabled for this link
    const shouldCloak = cloakingEnabled && link.cloakingEnabled;

    // Log the request
    const log = new Log({
      slug,
      domain: accessedDomain,
      ipAddress: req.cloaking.clientIP,
      userAgent: req.cloaking.userAgent,
      detectedType: isBot ? 'bot' : 'user',
      botName: isBot ? botName : undefined,
      timestamp: new Date(),
    });
    await log.save();

    // Update click counts
    link.clicks += 1;
    if (isBot) {
      link.botClicks += 1;
    } else {
      link.userClicks += 1;
    }
    await link.save();

    // If cloaking is disabled, always redirect
    if (!shouldCloak) {
      return res.redirect(303, link.userUrl);
    }

    // If bot and cloaking enabled, fetch botUrl and serve cleaned content
    if (isBot) {
      try {
        console.log(`[CLOAKING] Bot accessing ${link.slug} - Fetching ${link.botUrl}`);
        
        const response = await fetch(link.botUrl, {
          headers: {
            'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)'
          }
        });
        
        let htmlContent = await response.text();
        console.log(`[CLOAKING] Fetched ${link.slug} - HTML length: ${htmlContent.length}`);
        
        // MINIMAL cleaning - only remove problematic scripts
        // Keep the actual page structure and content
        const cleanedHtml = htmlContent
          // Remove script tags that load external JS (these cause 404s)
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          // Remove problematic inline event handlers
          .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '')
          // Remove async/defer attributes
          .replace(/\s+(async|defer)\b/gi, '');
        
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(cleanedHtml);
      } catch (error) {
        console.error(`[CLOAKING] Error fetching ${link.slug}:`, error.message);
        // Fallback to generated SEO HTML
        return res.send(generateSeoHtml(link));
        return res.send(generateSeoHtml(link));
      }
    }

    // If user, redirect to target URL
    res.redirect(303, link.userUrl);
  } catch (error) {
    console.error('Cloaking route error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * Generate SEO-friendly HTML for bots
 * This HTML includes metadata and basic structure
 * 
 * IMPORTANT: This is for educational purposes only.
 * Search engines can detect cloaking and may penalize your domain.
 */
function generateSeoHtml(link) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${link.title}</title>
    <meta name="description" content="${link.description || link.title}">
    <meta name="robots" content="index, follow">
    <meta property="og:title" content="${link.title}">
    <meta property="og:description" content="${link.description || link.title}">
    <meta property="og:url" content="${process.env.FRONTEND_URL || 'http://localhost:5173'}/go/${link.slug}">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            margin-bottom: 20px;
        }
        p {
            color: #666;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        .redirect-notice {
            background-color: #e8f4f8;
            border-left: 4px solid #2196F3;
            padding: 15px;
            margin-bottom: 20px;
        }
        .redirect-notice strong {
            color: #1976D2;
        }
        a {
            color: #2196F3;
            text-decoration: none;
            font-weight: 500;
        }
        a:hover {
            text-decoration: underline;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>${link.title}</h1>
        
        <div class="redirect-notice">
            <strong>This is an educational cloaking system.</strong>
            If you're a human, you should be redirected. 
            If not, <a href="${link.userUrl}">click here</a> to continue.
        </div>
        
        <p>${link.description || 'Redirecting to destination...'}</p>
        
        <div class="footer">
            <p>
                Educational Notice: This page demonstrates cloaking functionality for educational purposes only.
                Search engine cloaking violates most search engine guidelines and can result in penalties.
                Do not use this technique in production environments for SEO manipulation.
            </p>
        </div>
    </div>
    
    <script>
        // This script is not executed by bots, but serves as a redirect for browsers
        // Real bots should see the above HTML content
        if (document.body) {
            console.log('Cloaking educational system');
        }
    </script>
</body>
</html>
  `;
}

export default router;
