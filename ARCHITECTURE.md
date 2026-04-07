# Clocker Architecture & Design

## System Overview

Clocker is a full-stack application demonstrating search engine cloaking for educational purposes.

```
┌─────────────────────────────────────────────────────────┐
│                     Web Browser                         │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │  React Frontend (Vite)                          │  │
│  │  - Authentication pages                         │  │
│  │  - Link management dashboard                    │  │
│  │  - Request logs viewer                          │  │
│  │  - Settings panel                               │  │
│  │  - Real-time analytics                          │  │
│  └──────────────────────────────────────────────────┘  │
│                          │                             │
│                HTTP REQ/RES                           │
│                          │                             │
└──────────────────────────┼─────────────────────────────┘
                          │
                  ┌───────▼────────┐
                  │  Port 5000     │
                  │  (CORS Enabled)│
                  └───────┬────────┘
                          │
        ┌─────────────────────────────────────┐
        │                                     │
        │    Express Backend                  │
        │    - Authentication (JWT)           │
        │    - Link management                │
        │    - Bot detection                  │
        │    - Request logging                │
        │    - Settings management            │
        │                                     │
        └─────────────────────────────────────┘
                          │
        ┌─────────────────────────────────────┐
        │                                     │
        │  ┌──────────────────────────────┐  │
        │  │ Mongoose Models              │  │
        │  │ - User (auth)                │  │
        │  │ - Link (cloaked links)       │  │
        │  │ - Log (request tracking)     │  │
        │  │ - Settings (config)          │  │
        │  └──────────────────────────────┘  │
        │                                     │
        │          MongoDB                    │
        │    (localhost:27017)                │
        │                                     │
        └─────────────────────────────────────┘
```

## Request Flow

### 1. User Accessing Cloaked Link

```
┌─────────────────┐
│  User Browser   │
│ (or Bot)        │
└────────┬────────┘
         │
         │ GET /go/:slug
         │
         ▼
┌─────────────────────────────────────┐
│  Express Server                     │
│  (Public Route - No Auth Required)  │
└────────┬────────────────────────────┘
         │
         │ 1. Detect User-Agent
         │    header
         │ 2. Check IP address
         │ 3. Compare against
         │    bot patterns
         │
         ▼
    ┌─────────────────┐
    │ Is Bot?         │
    └────┬───────┬────┘
         │       │
    YES  │       │  NO
         │       │
         ▼       ▼
    ┌──────────────────────────────────┐
    │ Serve SEO HTML from botUrl       │
    │                                  │
    │ 1. Load Link from MongoDB        │
    │ 2. Generate HTML with metadata   │
    │ 3. Create Log entry (bot)        │
    │ 4. Update click counters         │
    │ 5. Return HTML (200 OK)          │
    └──────────────────────────────────┘
         │
         ▼ Redirect to userUrl
    ┌──────────────────────────────────┐
    │ HTTP 303 Redirect                │
    │                                  │
    │ 1. Load Link from MongoDB        │
    │ 2. Create Log entry (user)       │
    │ 3. Update click counters         │
    │ 4. Redirect (303)                │
    └──────────────────────────────────┘
```

### 2. Admin Dashboard Authentication Flow

```
┌─────────────────┐
│  Admin User     │
└────────┬────────┘
         │
         │ Register/Login
         │
         ▼
┌─────────────────────────────┐
│  POST /api/auth/register    │
│  or /api/auth/login         │
│                             │
│ 1. Validate input           │
│ 2. Hash password (JWT)      │
│ 3. Store in MongoDB         │
│ 4. Generate JWT token       │
└────────┬────────────────────┘
         │
         │ Return token
         │
         ▼
┌─────────────────────────────┐
│  Store token in             │
│  localStorage               │
└────────┬────────────────────┘
         │
         │ Subsequent requests
         │ include Authorization header
         │
         ▼
┌─────────────────────────────┐
│  Middleware                 │
│  authMiddleware.js          │
│                             │
│ 1. Check Authorization      │
│    header                   │
│ 2. Verify JWT signature     │
│ 3. Extract userId           │
│ 4. Attach to req object     │
└─────────────────────────────┘
```

## Bot Detection Logic

### Detection Hierarchy

```
1. IP Whitelist?
   └─→ Always USER (skip further checks)

2. IP Blacklist?
   └─→ Always BOT (skip further checks)

3. User-Agent String Check
   ├─→ Googlebot? → BOT
   ├─→ Bingbot? → BOT
   ├─→ Slurp? → BOT
   ├─→ DuckDuckBot? → BOT
   └─→ [Other known bots]

4. IP Pattern Check
   ├─→ Starts with 66.249? (Google) → BOT
   ├─→ Starts with 207.241? (Yahoo) → BOT
   ├─→ Starts with 202.97? (Baidu) → BOT
   └─→ [Other IP patterns]

5. Default: USER
```

### Bot Detection Code Flow

```javascript
// In cloakingMiddleware.js
const detectBotOrUser = async (req, res, next) => {
  // 1. Get settings from DB
  const settings = await Settings.findOne();
  
  // 2. Extract request info
  const userAgent = req.headers['user-agent'];
  const clientIP = req.ip;
  
  // 3. Check whitelist (user)
  if (ipWhitelist.includes(clientIP)) {
    isBot = false;
  }
  
  // 4. Check blacklist (bot)
  else if (ipBlacklist.includes(clientIP)) {
    isBot = true;
  }
  
  // 5. Check User-Agent patterns
  else if (botUserAgents.some(ua => userAgent.includes(ua))) {
    isBot = true;
  }
  
  // 6. Check IP patterns
  else if (botIPs.some(ip => clientIP.startsWith(ip))) {
    isBot = true;
  }
  
  // 7. Default to user
  else {
    isBot = false;
  }
  
  // 8. Attach to request
  req.cloaking = { isBot, userAgent, clientIP };
  next();
}
```

## Data Models

### User Model
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique, lowercase),
  password: String (hashed with bcrypt),
  createdAt: Date
}
```

### Link Model
```javascript
{
  _id: ObjectId,
  slug: String (unique),           // URL slug
  botUrl: String,                  // Content for bots
  userUrl: String,                 // Redirect for users
  title: String,
  description: String (optional),
  cloakingEnabled: Boolean,        // Per-link on/off
  clicks: Number,                  // Total clicks
  botClicks: Number,               // Clicks from bots
  userClicks: Number,              // Clicks from users
  createdAt: Date,
  updatedAt: Date
}
```

### Log Model
```javascript
{
  _id: ObjectId,
  slug: String (indexed),          // Link that was accessed
  ipAddress: String,               // Visitor IP
  userAgent: String,               // Browser User-Agent
  detectedType: String,            // "bot" or "user"
  botName: String (optional),      // Which bot (Googlebot, etc.)
  timestamp: Date (indexed),
  country: String (optional)       // For future GeoIP integration
}
```

### Settings Model
```javascript
{
  _id: ObjectId,
  cloakingEnabled: Boolean,        // Global on/off
  botUserAgents: [String],         // List of bot UA strings
  botIPs: [String],                // IP patterns for bots
  ipWhitelist: [String],           // Always treat as users
  ipBlacklist: [String],           // Always treat as bots
  updatedAt: Date
}
```

## API Routes Structure

```
/api/
├── auth/
│   ├── POST   /register          # Create account
│   └── POST   /login             # Get JWT token
│
├── links/
│   ├── POST   /                  # Create link
│   ├── GET    /                  # Get all links
│   ├── GET    /:slug             # Get specific link
│   ├── PUT    /:slug             # Update link
│   ├── DELETE /:slug             # Delete link
│   └── GET    /stats/overview    # Get stats
│
├── logs/
│   ├── GET    /                  # Get logs (with filters)
│   ├── GET    /stats/overview    # Get statistics
│   └── DELETE /clear             # Clear all logs
│
├── settings/
│   ├── GET    /                  # Get settings
│   ├── PUT    /                  # Update settings
│   └── POST   /toggle            # Toggle cloaking
│
└── (Public) /go/:slug            # Access cloaked link
```

## Middleware Stack

```
Request
  │
  ▼
express.json()           # Parse JSON body
  │
  ▼
cors()                   # Enable CORS
  │
  ▼
rateLimit()              # Rate limiting middleware
  │
  ▼
detectBotOrUser()        # Bot detection (for /go routes only)
  │
  ▼
authMiddleware()         # JWT verification (protected routes only)
  │
  ▼
Route Handler
  │
  ▼
Response
```

## Frontend Component Hierarchy

```
App
├── Login (unauthenticated)
│   ├── Register form
│   └── Login form
│
└── (When authenticated)
    ├── Navbar
    │   └── Navigation links
    │
    ├── Routes
    │   ├── Dashboard/
    │   │   ├── Stats cards
    │   │   ├── Pie chart (bot vs user)
    │   │   └── Bar chart (click breakdown)
    │   │
    │   ├── Links/
    │   │   ├── Link creation form
    │   │   └── Links table
    │   │
    │   ├── Logs/
    │   │   ├── Filter controls
    │   │   └── Logs table
    │   │
    │   └── Settings/
    │       ├── Cloaking toggle
    │       ├── Bot UA editor
    │       └── IP pattern editor
    │
    └── Sidebar (optional)
```

## Authentication Flow

### JWT Token Usage

```
1. User registers/logs in
   ↓
2. Backend generates JWT token
   JWT Structure: Header.Payload.Signature
   Payload contains: userId, iat, exp
   ↓
3. Frontend stores token in localStorage
   ↓
4. For protected requests, frontend sends:
   Authorization: Bearer eyJhbGc...
   ↓
5. Backend verifies signature using JWT_SECRET
   ↓
6. If valid, extract userId and proceed
   If invalid, return 401 Unauthorized
```

### Token Expiration
- Tokens expire after 24 hours
- User must login again after expiration
- Not implemented: token refresh mechanism

## Database Indexes

For performance optimization:

```javascript
// Logs collection
db.logs.createIndex({ timestamp: -1 })
db.logs.createIndex({ slug: 1 })
db.logs.createIndex({ detectedType: 1 })

// Links collection
db.links.createIndex({ slug: 1 }, { unique: true })

// Users collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ username: 1 }, { unique: true })
```

## Security Considerations

### Implemented:
- ✅ Password hashing with bcrypt
- ✅ JWT authentication
- ✅ CORS protection
- ✅ Rate limiting
- ✅ Input validation

### NOT Implemented (for educational purposes):
- ⚠️ HTTPS/TLS
- ⚠️ CSRF protection
- ⚠️ SQL injection prevention (using Mongoose)
- ⚠️ XSS protection headers
- ⚠️ Advanced DOS protection
- ⚠️ Database encryption at rest

**For production use, add these security measures.**

## Caching Strategy

Currently: No caching implemented

Future improvements:
- Cache bot detection settings
- Cache frequently accessed links
- Implement Redis for session management

## Error Handling

### Backend Error Flow

```
Endpoint
  │
  ├─→ Validation error → 400 Bad Request
  │
  ├─→ Auth error → 401 Unauthorized
  │
  ├─→ Not found → 404 Not Found
  │
  ├─→ Rate limit exceeded → 429 Too Many Requests
  │
  └─→ Server error → 500 Internal Server Error
```

### Frontend Error Handling

- Displays error messages to user
- Doesn't expose sensitive information
- Logs errors to browser console (dev mode)

## Deployment Considerations

### Development
- Vite dev server for frontend
- Nodemon for backend auto-reload
- Local MongoDB

### Staging/Production
- Build React app: `npm run build`
- Use Node for backend (not nodemon)
- Use managed MongoDB or containerized
- Configure environment variables
- Enable HTTPS/TLS
- Add security headers
- Implement monitoring
- Set up logging
- Configure CDN
- Use reverse proxy (Nginx)

## Performance Optimization

### Frontend
- Lazy loading routes
- Code splitting with Vite
- Tailwind CSS minification
- Image optimization

### Backend
- Database indexing
- Query optimization
- Response caching
- Compression middleware

## Monitoring & Logging

Currently: Basic console.log statements

Future:
- Winston or Bunyan for logging
- Sentry for error tracking
- Prometheus for metrics
- ELK stack for log aggregation
- APM (Application Performance Monitoring)

---

For deployment guides, see [DOCKER_SETUP.md](DOCKER_SETUP.md) and [README.md](README.md)
