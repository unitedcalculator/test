# Troubleshooting Guide

## Common Issues & Solutions

## Backend Issues

### 1. MongoDB Connection Error

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check MongoDB is running:**
   ```bash
   # Windows (if using MongoDB Service)
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   
   # Or run manually
   mongod
   ```

2. **Check MongoDB URI in .env:**
   ```env
   # Local MongoDB
   MONGODB_URI=mongodb://localhost:27017/clocker
   
   # MongoDB Atlas (cloud)
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clocker
   ```

3. **Verify MongoDB is accessible:**
   ```bash
   mongosh "mongodb://localhost:27017"
   ```

### 2. Port 5000 Already in Use

**Error Message:**
```
Error: listen EADDRINUSE :::5000
```

**Solutions:**

1. **Find process using port:**
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # macOS/Linux
   lsof -i :5000
   ```

2. **Kill process (Windows):**
   ```bash
   taskkill /PID <PID> /F
   ```

3. **Change port in .env:**
   ```env
   PORT=5001  # Use different port
   ```

### 3. JWT Secret Not Set

**Error Message:**
```
Error: JWT_SECRET is required
```

**Solution:**

1. **Create/Update .env file:**
   ```bash
   cp .env.example .env
   ```

2. **Add JWT_SECRET:**
   ```env
   JWT_SECRET=your_super_secret_key_that_is_long_and_secure
   ```

### 4. Dependencies Installation Error

**Error Message:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and package-lock.json:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Reinstall:**
   ```bash
   npm install
   ```

4. **Use legacy peer dependencies (if needed):**
   ```bash
   npm install --legacy-peer-deps
   ```

### 5. Not Detecting Bots Correctly

**Diagnosis:**

Check if bot detection is working:
```bash
# Simulate Googlebot
curl -H "User-Agent: Googlebot" http://localhost:5000/go/test-slug

# Check response
# Should be HTML for bot, redirect for user
```

**Solutions:**

1. **Verify bot detection is enabled:**
   - Check Settings in dashboard
   - Ensure "Cloaking Enabled" is ON

2. **Check bot User-Agents in Settings:**
   - Go to Settings page
   - Verify bot list includes your bot
   - Add more if needed

3. **Enable detailed logging:**
   Edit `backend/middleware/cloakingMiddleware.js`:
   ```javascript
   console.log('Cloaking detection:', {
     userAgent,
     clientIP,
     isBot,
     botName
   });
   ```

### 6. Cannot Read Settings Error

**Error Message:**
```
TypeError: Cannot read property 'botUserAgents' of null
```

**Solution:**

Settings are automatically created on first access, but if this fails:

```bash
# Clear and recreate
# In MongoDB:
use clocker
db.settings.deleteMany({})
```

Then reload the app.

---

## Frontend Issues

### 1. Port 5173 Already in Use

**Error Message:**
```
Error: Port 5173 is in use
```

**Solutions:**

1. **Change port in vite.config.js:**
   ```javascript
   server: {
     port: 5174
   }
   ```

2. **Set environment variable:**
   ```bash
   VITE_PORT=5174 npm run dev
   ```

### 2. Cannot Connect to Backend

**Error Message:**
```
Error: Failed to fetch http://localhost:5000/api/...
CORS policy: No 'Access-Control-Allow-Origin'
```

**Solutions:**

1. **Start backend first:**
   - Backend must be running on port 5000
   - Check: http://localhost:5000/health

2. **Check CORS settings in backend:**
   Edit `backend/server.js`:
   ```javascript
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
     credentials: true
   }));
   ```

3. **Verify .env in backend:**
   ```env
   FRONTEND_URL=http://localhost:5173
   ```

4. **Clear browser cache:**
   - Hard refresh: Ctrl+Shift+R / Cmd+Shift+R
   - Or clear localStorage in DevTools

### 3. Blank Page or White Screen

**Diagnosis:**

1. **Check browser console (F12):**
   - Look for JavaScript errors
   - Check Network tab for failed requests

2. **Check if React app loaded:**
   - Try: http://localhost:5173/

**Solutions:**

1. **Restart frontend:**
   ```bash
   # Stop with Ctrl+C
   npm run dev
   ```

2. **Clear cache and reinstall:**
   ```bash
   rm -rf node_modules
   npm install
   npm run dev
   ```

3. **Check for JavaScript errors:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for red errors

### 4. Login Fails with "Invalid Credentials"

**Possible Causes:**

1. **Wrong credentials:**
   - Check email and password are correct
   - Password is case-sensitive

2. **User not registered:**
   - Go to Login page
   - Click "Register" to create account

3. **Backend not responding:**
   - Check backend is running
   - Check API URL in .env

**Verification:**

Test API directly:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 5. Charts Not Displaying

**Possible Causes:**

1. **No data available:**
   - Charts only show if you have data
   - Create some links and access them

2. **Recharts not installed:**
   ```bash
   npm install recharts
   ```

### 6. Images Not Loading

**Possible Causes:**

1. **Missing public folder:**
   - Images should be in `frontend/public/`
   - Reference as: `/image-name.jpg`

**Solution:**

Ensure paths are relative to public:
```jsx
<img src="/logo.png" />  // Correct
<img src="./logo.png" /> // May fail
```

---

## Database Issues

### 1. Cannot Find Collection

**Error Message:**
```
Error: Collection 'links' not found
```

**Solution:**

Collections are created automatically, but if not:

```bash
mongosh
use clocker
db.links.insertOne({ test: true })
db.links.deleteOne({ test: true })
```

### 2. Duplicate Key Error

**Error Message:**
```
E11000 duplicate key error collection: clocker.links index: slug_1
```

**Solution:**

1. **Check for existing link:**
   ```bash
   mongosh
   use clocker
   db.links.find({ slug: "your-slug" })
   ```

2. **Delete if needed:**
   ```bash
   db.links.deleteOne({ slug: "your-slug" })
   ```

3. **Or use different slug**

### 3. MongoDB Atlas Connection Issues

**Error Message:**
```
Error: getaddrinfo ENOTFOUND cluster0-xxxx.mongodb.net
```

**Solutions:**

1. **Verify connection string:**
   - Copy from MongoDB Atlas dashboard
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

2. **Check password:**
   - Ensure no special characters need URL encoding
   - If `@` in password, use `%40`

3. **Whitelist IP:**
   - Go to MongoDB Atlas Dashboard
   - Network Access → Add IP Address
   - Add your IP or `0.0.0.0/0` for development

4. **Check credentials:**
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net"
   ```

---

## Docker Issues

### 1. Containers Won't Start

**Error Message:**
```
docker-compose: command not found
```

**Solution:**

Install Docker Compose:
```bash
# Windows/macOS: Install Docker Desktop

# Linux:
sudo apt update
sudo apt install docker-compose
```

### 2. Port Already in Use

**Error Message:**
```
Bind for 0.0.0.0:5000 failed: port is already allocated
```

**Solution:**

Edit `docker-compose.yml`:
```yaml
services:
  backend:
    ports:
      - "5001:5000"  # Change 5000 to unused port
```

### 3. Memory Issues

**Error Message:**
```
Error: Cannot allocate memory
```

**Solution:**

Check Docker resource limits:
- Docker Desktop → Preferences → Resources
- Increase memory allocation

### 4. rebuild Images

```bash
# Rebuild all images
docker-compose up --build

# Force rebuild without cache
docker-compose up --build --no-cache

# Rebuild specific service
docker-compose up --build backend
```

---

## Authentication Issues

### 1. Token Expired

**Symptom:**

Can't access protected pages after long inactivity

**Solution:**

Logout and login again to get new token:
```javascript
// Browser Console
localStorage.removeItem('token')
// Refresh page and login again
```

### 2. Token Not Stored

**Symptom:**

Get 401 Unauthorized on every request

**Solutions:**

1. **Check localStorage:**
   ```javascript
   // Browser Console DevTools
   localStorage.getItem('token')
   ```

2. **Check browser allows localStorage:**
   - Not in private/incognito mode
   - Not blocked by extensions

3. **Manual token test:**
   ```javascript
   localStorage.setItem('token', 'your-token-here')
   ```

### 3. Cannot Login

**Symptoms:**

- "Invalid credentials"
- "User not found"

**Solutions:**

1. **Register first:**
   - Make sure account exists

2. **Check MongoDB:**
   ```bash
   mongosh
   use clocker
   db.users.find()
   ```

3. **Test API directly:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"pass"}'
   ```

---

## Performance Issues

### 1. Slow Dashboard

**Causes:**

- Large number of logs
- Slow database
- Slow network

**Solutions:**

1. **Clear old logs:**
   - Go to Logs page
   - Click "Clear All"

2. **Add database indexes:**
   ```bash
   mongosh
   use clocker
   db.logs.createIndex({ timestamp: -1 })
   ```

3. **Optimize queries:**
   - Limit logs returned: change `limit` in API

### 2. Slow Link Creation

**Cause:**

Database latency

**Solutions:**

1. **Check MongoDB performance:**
   - Is MongoDB running locally?
   - Network delay if cloud-hosted?

2. **Verify indices:**
   ```bash
   db.links.getIndexes()
   ```

### 3. High Memory Usage

**Solutions:**

1. **Restart services:**
   ```bash
   docker-compose restart
   ```

2. **Check for memory leaks:**
   - Monitor Node processes: `node --inspect`
   - Use Chrome DevTools

---

## Getting Help

### Debug Checklist

- [ ] MongoDB running?
- [ ] Backend running on port 5000?
- [ ] Frontend running on port 5173?
- [ ] No port conflicts?
- [ ] .env files created?
- [ ] Dependencies installed?
- [ ] Browser console clear of errors?
- [ ] Network tab shows successful requests?
- [ ] localStorage has token?

### Collect Diagnostics

1. **Backend logs:**
   ```bash
   npm run dev > backend.log 2>&1
   ```

2. **Frontend console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Copy errors

3. **MongoDB status:**
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

### Resources

- [Express Documentation](https://expressjs.com)
- [React Documentation](https://react.dev)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Vite Documentation](https://vitejs.dev)

---

## Still Need Help?

1. Check existing GitHub issues
2. Review logs carefully
3. Try restarting services
4. Clear caches and reinstall
5. Check MongoDB connection
6. Verify all .env variables
7. Test API with cURL
8. Check browser DevTools

Most issues are related to environment setup. Double-check all prerequisites!
