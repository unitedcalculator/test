# 🔐 Authentication Debugging Guide

If you're getting **401 Unauthorized** errors, follow this checklist.

## ✅ Checklist - Run In Order

### 1. **Verify Backend is Running**
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/health
```

**Expected:** `200 OK` response

**If Failed:**
- Open new terminal in `backend/` folder
- Run `npm run dev`
- Wait for "Server running on port 5000"

---

### 2. **Verify MongoDB Connection**
```bash
# Check if MongoDB is running locally
mongod --version
```

**If MongoDB Not Running (Windows):**
```bash
# Start MongoDB service (if installed)
net start MongoDB
# Or if using MongoDB Atlas, ensure internet connection is working
```

**If Error:**
- Install MongoDB Community Edition
- Or check your MONGODB_URI in `.env`

---

### 3. **Check Backend .env File**
```bash
# Open backend/.env and verify:
MONGODB_URI=mongodb://localhost:27017/clocker
PORT=5000
JWT_SECRET=your_jwt_secret_key_change_this
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

**⚠️ Important:** All values must be set. If anything is blank, requests will fail.

---

### 4. **Check Frontend .env File**
```bash
# Open frontend/.env and verify:
VITE_API_URL=http://localhost:5000/api
```

**If file doesn't exist:**
- Copy from `frontend/.env.example`
- Rename to `.env`

---

### 5. **Test Login API Directly**
```bash
# Try registering a test user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

**Expected Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc...",
  "userId": "60f7b3c4a1b2c3d4e5f6g7h8"
}
```

**If Error:**
- Check server console for error
- Verify MongoDB is running
- Check JWT_SECRET in backend/.env

---

### 6. **Test Protected API with Token**
```bash
# Get the token from registration above, then:
TOKEN="eyJhbGc..."

curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/logs
```

**Expected:** Success response with logs array

**If 401 Error:**
- Token is invalid or expired
- JWT_SECRET might not match
- Try registering again to get new token

---

### 7. **Clear Browser Storage and Re-Login**
```javascript
// In browser console (F12)
localStorage.clear();
sessionStorage.clear();
location.reload();
```

**Then:**
1. Click "Register" on login page
2. Fill in form:
   - Username: `testuser`
   - Email: `test@email.com`
   - Password: `password123`
3. Click "Register"
4. Should redirect to Dashboard

---

### 8. **Check Browser Network Tab**
1. Open DevTools (F12)
2. Click "Network" tab
3. Try fetching logs or links
4. Look for the failing request
5. Check the headers sent:
   - **Request Headers** should have: `Authorization: Bearer eyJhbGc...`
   - **Status** should be `200`, not `401`

---

## 🔴 Common Issues & Solutions

### Issue: "No token provided" (401)

**Cause:** Token not in localStorage

**Fix:**
```javascript
// In browser console:
console.log(localStorage.getItem('token'));
// Should show a long token string, not null
```

If `null`:
- Login again
- Check network tab when logging in to see if token is returned

---

### Issue: "Invalid token" (401)

**Cause:** Token is expired or JWT_SECRET doesn't match

**Fix:**
1. Verify JWT_SECRET in `backend/.env` is set
2. Try re-logging in
3. Clear browser storage and try again

---

### Issue: Backend Won't Start

**Cause:** Port 5000 already in use

**Fix:**
```bash
# Windows - find what's using port 5000
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <PID> /F

# Or use different port in .env
PORT=5001
```

---

### Issue: "MONGODB_URI not found"

**Cause:** Missing .env file

**Fix:**
```bash
# In backend/ folder
cp .env.example .env

# Edit .env and add your MongoDB URI
```

---

### Issue: MongoDB Connection Fails

**Cause:** MongoDB not running or wrong URI

**Fix:**
```bash
# Check if MongoDB is running
mongod --version

# If not installed, install MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Or update MONGODB_URI to use MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/clocker
```

---

## 🧪 Manual Testing Flow

1. **Start Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Register:**
   - Go to http://localhost:5173
   - Click "Register"
   - Fill form and submit

4. **Check Token:**
   - Open DevTools (F12)
   - Go to Application tab
   - Check localStorage for "token" key

5. **View Dashboard:**
   - Should see statistics and charts
   - If stuck on login page, check errors in console

6. **Test Each Page:**
   - Dashboard - view stats
   - Links - create a test link
   - Logs - view request logs
   - Settings - view settings

---

## 📋 Debugging Checklist

Use this when reporting issues:

- [ ] Backend running (`npm run dev` in `backend/`)
- [ ] Frontend running (`npm run dev` in `frontend/`)
- [ ] MongoDB running locally or Atlas URI configured
- [ ] `.env` files created (backend and frontend)
- [ ] `VITE_API_URL` set in `frontend/.env`
- [ ] `JWT_SECRET` set in `backend/.env`
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal
- [ ] Can register new user successfully
- [ ] Token appears in localStorage after login
- [ ] Can view Dashboard after login

---

## 🐛 Enable Debug Logging

### Frontend Console
```javascript
// In browser console (F12 → Console)
localStorage.getItem('token')     // Should print token
localStorage.getItem('userId')    // Should print userId
```

### Backend Terminal
- Should show logs for each request
- If creating link: `POST /api/links`
- If fetching logs: `GET /api/logs`

---

## ✅ If Everything Works

1. You should see the Dashboard with statistics
2. You should be able to create links in "Links" page
3. You should see logs in "Logs" page
4. Settings should load in "Settings" page

If any page gives 401, follow the checklist above.

---

## 📞 Still Having Issues?

1. Check the server console for error messages
2. Open browser DevTools (F12) and check "Console" tab
3. Check "Network" tab to see request/response
4. Verify all `.env` files are created
5. Restart both backend and frontend
6. Clear browser cache: Ctrl+Shift+Del (or Cmd+Shift+Del on Mac)

---

**Remember:** 
- 🟢 **200 OK** = Success
- 🔴 **401 Unauthorized** = Missing or invalid token
- 🔴 **500 Internal Server Error** = Backend issue

