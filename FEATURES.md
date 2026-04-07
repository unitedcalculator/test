# Features & Usage Guide

## ✅ Complete Feature Checklist

### Authentication (✓ Implemented)
- [x] User registration with email
- [x] User login with JWT tokens
- [x] Password hashing with bcrypt
- [x] 24-hour token expiration
- [x] Protected routes via middleware

### Link Management (✓ Implemented)
- [x] Create cloaked links with custom slugs
- [x] Edit existing links
- [x] Delete links
- [x] View all links
- [x] Per-link cloaking enable/disable
- [x] Click tracking per link
- [x] Bot vs user click separation

### Bot Detection (✓ Implemented)
- [x] User-Agent based detection
- [x] IP address pattern analysis
- [x] Configurable bot list
- [x] IP whitelist (always treat as user)
- [x] IP blacklist (always treat as bot)
- [x] Detection priority system
- [x] Detailed logging of detection

### Cloaking Functionality (✓ Implemented)
- [x] Serve different HTML to bots
- [x] Redirect users to target URL
- [x] Generate SEO-friendly metadata
- [x] Global cloaking ON/OFF switch
- [x] Per-link cloaking control
- [x] Educational disclaimers

### Admin Dashboard (✓ Implemented)
- [x] Real-time statistics dashboard
- [x] Link management interface
- [x] Request log viewer
- [x] Settings configuration panel
- [x] Charts and graphs (Recharts)
- [x] Responsive design (mobile-friendly)

### Analytics & Logging (✓ Implemented)
- [x] Log every request
- [x] Track IP addresses
- [x] Store User-Agent strings
- [x] Record detection type
- [x] Filter logs by type, date, slug
- [x] Export logs to CSV
- [x] Clear logs functionality
- [x] Statistics aggregation

### Settings Management (✓ Implemented)
- [x] Global cloaking toggle
- [x] Manage bot User-Agent list
- [x] Configure IP detection patterns
- [x] IP whitelist management
- [x] IP blacklist management
- [x] Persistent settings in database

### Security (✓ Implemented)
- [x] JWT authentication
- [x] Password hashing
- [x] CORS protection
- [x] Rate limiting
- [x] Input validation

### Additional Features (✓ Implemented)
- [x] Responsive UI with Tailwind CSS
- [x] Navigation and routing
- [x] Error handling
- [x] Success notifications
- [x] Data pagination
- [x] Copy-to-clipboard functionality
- [x] Health check endpoint

---

## Usage Guide by Feature

## 1️⃣ User Authentication

### Register New Account

**Via Frontend:**
1. Go to http://localhost:5173
2. Click "Register"
3. Fill in:
   - Username: Choose unique username
   - Email: Valid email address
   - Password: Strong password (min 6 chars recommended)
4. Click "Register"
5. Automatically logged in

**Via API:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepass123",
    "confirmPassword": "securepass123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "userId": "507f..."
}
```

### Login

**Via Frontend:**
1. Go to http://localhost:5173
2. Click "Login"
3. Enter email and password
4. Click "Login"

**Via API:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

---

## 2️⃣ Creating Cloaked Links

### Basic Link Creation

1. **From Dashboard:**
   - Click "Cloaked Links" in navbar
   - Click blue "Create Link" button
   - Fill in form fields

2. **Form Fields:**
   ```
   Slug: test-product
   → Used in URL: /go/test-product
   
   Bot URL: https://www.example.com/product
   → Served to search engines
   
   User URL: https://affiliate.com?ref=123
   → Where real users are redirected
   
   Title: My Test Product
   → Link display name
   
   Description (optional): Click to visit
   → Additional info
   ```

3. **Submit and Save**

### Advanced: Via API

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:5000/api/links \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "amazon-deal",
    "botUrl": "https://example.com/hidden-product",
    "userUrl": "https://amazon.com/product/xyz",
    "title": "Limited Amazon Deal",
    "description": "Click to see today'\''s special offer"
  }'
```

---

## 3️⃣ Using Cloaked Links

### Accessing Your Cloaked Link

**Copy the cloaking URL:**
1. Go to "Cloaked Links"
2. Find your link in the table
3. Click "Copy" icon (two overlapping squares)
4. Share the copied URL

**The URL format:**
```
http://localhost:5000/go/your-slug
```

### Test Different Access Types

**As a Regular User:**
```bash
curl http://localhost:5000/go/your-slug
```
Expected: Redirect to user URL

**As a Bot (Googlebot):**
```bash
curl -H "User-Agent: Googlebot" http://localhost:5000/go/your-slug
```
Expected: Returns HTML page with metadata

**Open in Browser:**
- Browser = Regular user → Redirects
- Copy URL in browser location bar to see bot content

---

## 4️⃣ Bot Detection Configuration

### View Current Settings

1. Click "Settings" in navbar
2. See current detection rules
3. View enabled/disabled status

### Add Bot User-Agent

**Scenario:** Detect a new bot not in the list

1. Go to Settings
2. Find "Bot User-Agent Strings" section
3. Add new bot on new line:
   ```
   Googlebot
   Bingbot
   [Add new bot here]
   ```
4. Click "Save Settings"

### Add Bot IP Pattern

**Scenario:** Detect requests from specific IP range

1. Go to Settings
2. Find "Bot IP Patterns" section
3. Add IP pattern:
   ```
   66.249    # Google
   207.241   # Yahoo
   1.2.3     # Custom pattern (matches 1.2.3.x)
   ```
4. Click "Save Settings"

### IP Whitelist/Blacklist

**Whitelist (Always treat as user):**
- Useful for testing your own bot
- Add your office IP

**Blacklist (Always treat as bot):**
- Force certain IPs to see bot content
- For testing purposes

---

## 5️⃣ Analytics & Monitoring

### Dashboard Home

**View Real-Time Stats:**
1. Click "Dashboard" (home icon)
2. See total clicks
3. View bot vs user breakdown
4. Check link statistics
5. See distribution charts

**Key Metrics:**
- Total Clicks: All accesses combined
- Bot Clicks: Requests from detected bots
- User Clicks: Requests from regular users
- Total Links: Number of cloaked links created

### Link Statistics

1. Go to "Cloaked Links"
2. View per-link statistics in table:
   - Total clicks (bold blue number)
   - Bot clicks (red number)
   - User clicks (green number)

**Example Reading:**
```
Link: amazon-promo
Clicks: 150
Bot: 50 / User: 100
← This link was accessed 150 times (50 bots, 100 users)
```

---

## 6️⃣ Viewing Logs

### Basic Log Viewing

1. Go to "Logs"
2. See all requests in table:
   - IP Address
   - Link slug
   - Request type (BOT/USER)
   - Bot name (if applicable)
   - Full User-Agent
   - Timestamp

### Filter Logs

**By Type:**
- Select "Bots Only" to see only bot requests
- Select "Users Only" to see only user requests

**By Slug:**
- Filter to specific link
- Leave empty for all links

**By Date:**
- Set "From Date" to start date
- Set "To Date" to end date
- Leave empty for all dates

**Apply Filters:**
- Click "Apply Filters" button
- Results update instantly

### Export Logs

1. Click "Export CSV" button
2. Downloads logs as CSV file
3. Open in Excel or Google Sheets
4. Analyze further

### Clear Logs

⚠️ **Warning:** Cannot be undone!

1. Click "Clear All" button
2. Confirm deletion
3. All logs deleted from database

---

## 7️⃣ Testing Different Scenarios

### Scenario 1: Bot Access

```bash
# Simulate Googlebot
curl -H "User-Agent: Googlebot/2.1" \
  http://localhost:5000/go/test-link

# Response: HTML page with metadata
```

Expected output: HTML with title, description, og: tags

### Scenario 2: User Access

```bash
# Simulate regular browser
curl -L http://localhost:5000/go/test-link

# Response: Redirect to userUrl
```

### Scenario 3: Check IP Detection

```bash
# Forward as different IP (requires
 proxy setup)
# Check logs to see detected IP
```

### Scenario 4: Toggle Cloaking OFF

1. Go to Settings
2. Click "Disable Cloaking"
3. Access any link
4. All users → Redirect (no HTML serving)
5. Click "Enable Cloaking" to restore

---

## 8️⃣ Per-Link Cloaking Control

### Enable/Disable Cloaking for One Link

1. Go to "Cloaked Links"
2. Click "Edit" (pencil icon)
3. Modify settings:
   ```
   - Change Bot/User URLs
   - Change Title/Description
   - Toggle cloaking ON/OFF
   ```
4. Click "Update Link"

### Effect of Disabling Per-Link:

**Global cloaking ON, Link cloaking OFF:**
- Both bots and users → redirected to userUrl
- Link always acts as normal redirect

**Use case:** Temporarily disable one link for testing

---

## 9️⃣ Troubleshooting Features

### Link Not Working

**Check:**
1. Is global cloaking enabled? (Settings)
2. Is link cloaking enabled? (Edit link)
3. Are bot URLs and user URLs correct? (Edit link)
4. Does link exist in database? (Links table)

### Not Detecting as Bot

**Check:**
1. Is detected correctly in logs?
2. Add User-Agent to settings if missing
3. Test with exact User-Agent string
4. Check IP pattern matches

### Not Redirecting Users

**Check:**
1. Is user URL valid and accessible?
2. Is cloaking enabled?
3. Check browser redirects aren't blocked
4. Try different browser or incognito mode

---

## 🔟 Advanced Usage

### Bulk Link Creation

Use API to create multiple links:

```bash
TOKEN="your-token"

for i in {1..5}; do
  curl -X POST http://localhost:5000/api/links \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"slug\": \"product-$i\",
      \"botUrl\": \"https://example.com/seo-$i\",
      \"userUrl\": \"https://redirect.com/$i\",
      \"title\": \"Product $i\"
    }"
done
```

### Export Analytics

```bash
# Get full stats
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/links/stats/overview

# Get bot stats
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:5000/api/logs?type=bot&limit=1000"

# Export to file
... | jq . > analytics.json
```

### Monitor in Real-Time

Open multiple browser windows:
1. Login in one window
2. Access links in another window (incognito/bot)
3. Refresh logs in original window
4. Watch updates in real-time

---

## 🎓 Educational Value

### What You Learn:

1. **How Web Cloaking Works**
   - Bot detection mechanisms
   - Content serving logic
   - Redirect behavior

2. **MERN Stack Development**
   - React component architecture
   - Express API design
   - MongoDB data modeling
   - JWT authentication

3. **Security Concepts**
   - Password hashing
   - Token-based auth
   - CORS and rate limiting
   - Input validation

4. **Database Design**
   - Schema design
   - Query optimization
   - Indexing strategies
   - Aggregation pipelines

5. **Full-Stack Integration**
   - Frontend-backend communication
   - Error handling
   - Data persistence
   - Real-time updates

---

## 📊 Common Usage Patterns

### Pattern 1: Testing SEO Content

1. Create link
2. Access with Googlebot User-Agent
3. Verify HTML content appears
4. Check metadata in HTML

### Pattern 2: Redirect Tracking

1. Create link with affiliate URL
2. Share link with users
3. Monitor clicks in dashboard
4. Track conversions

### Pattern 3: Bot Analysis

1. Access link as different bots
   - Googlebot
   - Bingbot
   - FacebookBot
   - Custom bot
2. Check logs
3. Compare detection accuracy

### Pattern 4: Load Testing

1. Create test link
2. Send many requests
3. Monitor dashboard
4. Check database performance

---

For troubleshooting, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

For API details, see [API.md](API.md)

For architecture, see [ARCHITECTURE.md](ARCHITECTURE.md)
