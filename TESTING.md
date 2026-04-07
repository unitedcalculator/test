# Clocker Testing Guide

## Quick Start Testing

### 1. Test Bot Detection

**Using cURL to simulate Googlebot:**
```bash
curl -H "User-Agent: Googlebot/2.1 (+http://www.google.com/bot.html)" \
  http://localhost:5000/go/your-slug
```

Expected Response: HTML page with title, description, and metadata

**Using cURL to simulate regular user:**
```bash
curl -L http://localhost:5000/go/your-slug
```

Expected Response: Redirect to user URL

### 2. Test API Endpoints

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "userId": "507f1f77bcf86cd799439011"
}
```

**Login User:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Create Cloaked Link (replace TOKEN with your JWT):**
```bash
curl -X POST http://localhost:5000/api/links \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "test-product",
    "botUrl": "https://example.com/seo-content",
    "userUrl": "https://example.com/user-redirect",
    "title": "Test Product",
    "description": "This is a test cloaked link"
  }'
```

**Get All Links:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/links
```

**Get Link Statistics:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/links/stats/overview
```

**Get Logs:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/logs?type=bot&limit=10"
```

**Get Log Statistics:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/logs/stats/overview
```

**Get Settings:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/settings
```

**Toggle Global Cloaking:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/settings/toggle
```

### 3. Frontend Testing

1. **Open http://localhost:5173**

2. **Register/Login**
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`

3. **Test Dashboard**
   - Should show 0 clicks initially
   - Create some links first

4. **Test Link Creation**
   - Go to "Cloaked Links"
   - Click "Create Link"
   - Fill in form:
     - Slug: `demo-link`
     - Bot URL: `https://www.example.com`
     - User URL: `https://google.com`
     - Title: `Demo Link`

5. **Test Cloaking**
   - Copy the link URL
   - Open in browser as user → should redirect to Google
   - Simulate as bot → should show SEO HTML

6. **Test Logs**
   - Go to "Logs"
   - Should see entries for your requests
   - Try filtering by type or date

7. **Test Settings**
   - Try toggling cloaking ON/OFF
   - View bot detection rules

## Browser Testing

### Test 1: User Access
1. Create a link with:
   - Slug: `test`
   - Bot URL: `https://example.com`
   - User URL: `https://google.com`

2. Open `http://localhost:5000/go/test` in browser
3. Should redirect to Google

### Test 2: Bot Simulation
Use online tools to simulate bot access:
- https://www.site-shot.com/ (simulates Googlebot)
- Or use cURL with User-Agent header

### Test 3: Dashboard Updates
1. Access the cloaked link multiple times
2. Go to Dashboard
3. Should see click count increase
4. Chart should show bot vs user distribution

## Common Issues

### Issue: Links not working
- Check MongoDB is running
- Check backend is running on port 5000
- Check JWT token in localStorage

### Issue: Bot detection not working
- Check User-Agent header is being sent
- Verify bot User-Agents in Settings
- Check cloaking is enabled globally

### Issue: Frontend can't connect to backend
- Check CORS is enabled in backend
- Verify API_URL in frontend .env
- Check backend is running

## Performance Testing

### Load Testing
```bash
# Install Apache Bench
ab -n 1000 -c 10 http://localhost:5000/go/test-slug
```

### Database Performance
```bash
# Check MongoDB indexes
db.logs.getIndexes()
db.links.getIndexes()
```

## Security Testing

### Test JWT Validation
```bash
# Request without token (should fail)
curl http://localhost:5000/api/links

# Request with invalid token (should fail)
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:5000/api/links
```

### Test Rate Limiting
```bash
# Send many requests (should be throttled)
for i in {1..200}; do curl http://localhost:5000/health; done
```

## Debugging Tips

### Enable Verbose Logging
Add console.logs to backend routes:
```javascript
console.log('Request received:', req.body);
console.log('Cloaking info:', req.cloaking);
```

### Monitor Requests
Use browser DevTools Network tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Make requests
4. See request/response details

### Check MongoDB
```bash
# Connect to MongoDB
mongo

# Select database
use clocker

# View collections
show collections

# View sample log
db.logs.findOne()

# Count documents
db.links.countDocuments()
```

## Test Data

### Sample Bot User-Agents:
- `Googlebot/2.1`
- `Mozilla/5.0 (compatible; Bingbot/2.0)`
- `Slurp (Inktomi)`
- `DuckDuckBot/1.0`

### Sample Test URLs:
- Bot: `https://example.com/seo-content`
- User: `https://google.com`

## Continuous Testing

Consider setting up:
- Automated API testing with Jest
- E2E testing with Cypress
- Performance monitoring
- Error tracking with Sentry
