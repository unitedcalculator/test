# Clocker - Educational Cloaking System

**⚠️ DISCLAIMER: This is an EDUCATIONAL project for learning purposes only. Using cloaking techniques in production violates search engine guidelines and is NOT recommended.**

## Overview

Clocker is a full-stack experimental cloaking system that demonstrates how search engines can be served different content than regular users. This educational project includes:

- **Frontend**: React + Vite + Tailwind CSS admin dashboard
- **Backend**: Node.js + Express + MongoDB
- **Key Features**:
  - Bot detection via User-Agent and IP analysis
  - Cloaked link management with custom slugs
  - Request logging and analytics
  - Real-time statistics dashboard
  - Global and per-link cloaking controls

## Project Structure

```
clocker/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema with auth
│   │   ├── Link.js               # Cloaked links schema
│   │   ├── Log.js                # Request logs schema
│   │   └── Settings.js           # Global settings schema
│   ├── controllers/
│   │   ├── authController.js     # Auth logic (register/login)
│   │   ├── linkController.js     # Link CRUD operations
│   │   ├── logController.js      # Log retrieval and filtering
│   │   └── settingsController.js # Settings management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification
│   │   └── cloakingMiddleware.js # Bot detection logic
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── linkRoutes.js         # Link management endpoints
│   │   ├── logRoutes.js          # Log viewing endpoints
│   │   ├── settingsRoutes.js     # Settings endpoints
│   │   └── publicRoutes.js       # Public cloaking route (/go/:slug)
│   ├── server.js                 # Main Express app
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Navigation bar
│   │   │   ├── Sidebar.jsx       # Sidebar (optional)
│   │   │   └── Table.jsx         # Reusable table component
│   │   ├── pages/
│   │   │   ├── Login.jsx         # Auth page
│   │   │   ├── Dashboard.jsx     # Stats and analytics
│   │   │   ├── Links.jsx         # Link manager
│   │   │   ├── Logs.jsx          # Log viewer
│   │   │   └── Settings.jsx      # Settings page
│   │   ├── services/
│   │   │   └── api.js            # API client with axios
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # React entry point
│   │   └── index.css             # Tailwind styles
│   ├── public/                   # Static assets
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── index.html
│
└── README.md
```

## Setup Instructions

### Prerequisites

- **MongoDB** (local or cloud - Atlas recommended)
- **Node.js** (v16 or higher)
- **npm** (v8 or higher)

### Backend Setup

1. **Navigate to backend folder**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Edit .env with your configuration**
   ```env
   MONGODB_URI=mongodb://localhost:27017/clocker
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_this
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

5. **Start MongoDB** (if local)
   ```bash
   mongod
   ```

6. **Start the backend server**
   ```bash
   npm run dev
   ```

   The backend will be available at: **http://localhost:5000**

### Frontend Setup

1. **Open new terminal, navigate to frontend folder**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will be available at: **http://localhost:5173**

### Accessing the Application

1. Open browser to **http://localhost:5173**
2. Register a new account (email: `test@example.com`, password: `test123`)
3. Login with your credentials
4. Start creating cloaked links!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Links Management
- `GET /api/links` - Get all cloaked links
- `POST /api/links` - Create new cloaked link
- `GET /api/links/:slug` - Get specific link
- `PUT /api/links/:slug` - Update link
- `DELETE /api/links/:slug` - Delete link
- `GET /api/links/stats/overview` - Get link statistics

### Logs
- `GET /api/logs` - Get logs with filtering
- `GET /api/logs/stats/overview` - Get log statistics
- `DELETE /api/logs/clear` - Clear all logs

### Settings
- `GET /api/settings` - Get all settings
- `PUT /api/settings` - Update settings
- `POST /api/settings/toggle` - Toggle global cloaking

### Public Cloaking Route
- `GET /go/:slug` - Access cloaked link (no auth required)

## Example: Creating a Cloaked Link

### 1. Create Link (via Dashboard or API)

**Frontend UI:**
1. Go to "Cloaked Links" page
2. Click "Create Link"
3. Fill in:
   - Slug: `amazon-promo`
   - Bot URL: `https://example.com/seo-content`
   - User URL: `https://amazon.com`
   - Title: "Amazon Promotional Link"

**Via API:**
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "amazon-promo",
    "botUrl": "https://example.com/seo-content",
    "userUrl": "https://amazon.com",
    "title": "Amazon Promotional Link"
  }'
```

### 2. Access Cloaked Link

**Your cloaking URL:** `http://localhost:5000/go/amazon-promo`

- If **Googlebot** accesses it: Returns SEO-friendly HTML from `botUrl`
- If **regular user** accesses it: Redirects to `userUrl`

### 3. View Analytics

Go to Dashboard to see:
- Total clicks
- Bot vs User clicks
- Link statistics
- Charts and graphs

### 4. View Request Logs

Go to Logs page to see:
- All requests (IP, User-Agent, type)
- Filter by date, slug, or request type
- Export logs as CSV

## How Cloaking Detection Works

### 1. User-Agent Detection

The system checks the `User-Agent` header against a list of known bot patterns:

```javascript
const botUserAgents = [
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
];
```

### 2. IP-Based Detection

Certain IP ranges are associated with known bot providers:

```javascript
const botIPs = [
  '66.249',      // Google
  '207.241',     // Yahoo
  '202.97',      // Baidu
  '123.125',     // Baidu
];
```

### 3. Detection Flow

```
Request arrives with User-Agent + IP
         ↓
Check IP whitelist (always user)
         ↓
Check IP blacklist (always bot)
         ↓
Check User-Agent patterns
         ↓
Check IP patterns
         ↓
Serve appropriate content
```

## Bot vs User Content

### For Bots:
- Returns SEO-friendly HTML with metadata
- Includes title, description, og: tags
- Contains educational notice
- No JavaScript execution

### For Regular Users:
- HTTP 303 redirect to user URL
- Immediate navigation

## Dashboard Features

### 1. Home Dashboard
- Total clicks counter
- Bot vs User split
- Statistical charts
- Link statistics

### 2. Link Manager
- Create, edit, delete links
- Copy cloaking URLs
- View per-link statistics
- Toggle cloaking per link

### 3. Log Viewer
- Real-time request logs
- Filter by date, slug, or type
- Export logs as CSV
- Clear logs

### 4. Settings
- Global cloaking ON/OFF
- Manage bot User-Agent list
- Manage IP detection patterns
- IP whitelist/blacklist

## Important Notes

⚠️ **EDUCATIONAL PURPOSE ONLY**

This system is designed purely for educational understanding of cloaking concepts. Using cloaking in production:

### Legal/Ethical Issues:
1. **Search Engine Violations**
   - Violates Google, Bing, Yahoo guidelines
   - Can result in permanent domain ban
   - May be considered fraud

2. **Potential Penalties**
   - De-indexing from search results
   - Manual action penalties
   - Domain reputation damage

3. **Alternative Solutions**
   - Use legitimate dynamic rendering
   - Implement proper server-side rendering (SSR)
   - Use Google's official rendering solutions
   - Implement A/B testing properly

## Testing the System

### Test 1: Simulate Bot Access

```bash
curl -H "User-Agent: Googlebot/2.1" http://localhost:5000/go/test-slug
```

Expected: Returns HTML content

### Test 2: Simulate User Access

```bash
curl http://localhost:5000/go/test-slug
```

Expected: HTTP 303 redirect

### Test 3: Check Logs

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/logs
```

Expected: Two log entries (one bot, one user)

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Try: `mongod` (if local)

### Frontend Won't Connect to Backend
- Check `FRONTEND_URL` in `.env`
- Ensure backend is running on port 5000
- Check CORS settings in `server.js`

### Port Already in Use
- Change PORT in `.env` (backend)
- Change port in `vite.config.js` (frontend)

## Dependencies

### Backend:
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `jsonwebtoken` - JWT authentication
- `bcryptjs` - Password hashing
- `cors` - Cross-origin requests
- `express-rate-limit` - Rate limiting

### Frontend:
- `react` - UI library
- `react-router-dom` - Routing
- `axios` - HTTP client
- `recharts` - Data visualization
- `lucide-react` - Icons
- `tailwindcss` - CSS framework

## Future Enhancements

- [ ] Advanced bot detection (behavioral analysis)
- [ ] Machine learning bot detection
- [ ] Custom HTML templates for bot content
- [ ] A/B testing framework
- [ ] Analytics dashboard improvements
- [ ] Support for multiple content variations
- [ ] Team management and roles
- [ ] API key management

## License

MIT

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Documentation](https://react.dev)
- [Search Engine Cloaking Guidelines](https://developers.google.com/search/docs/advanced/guidelines/cloaking-and-redirects)

---

**Remember:** This is for educational purposes. Do not use in production for SEO manipulation.
