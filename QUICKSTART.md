# Clocker - Quick Start Guide

## ⚡ 5-Minute Setup

### Prerequisites
- Node.js installed
- MongoDB running (local or cloud)

### Step 1: Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
echo 'MONGODB_URI=mongodb://localhost:27017/clocker
PORT=5000
JWT_SECRET=test-secret-key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development' > .env

# Start backend
npm run dev
```

Backend will run at: **http://localhost:5000**

### Step 2: Frontend Setup (New Terminal)

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start frontend
npm run dev
```

Frontend will run at: **http://localhost:5173**

## 🎯 First Test

1. Open http://localhost:5173
2. Click "Register" and create account:
   - Username: `testuser`
   - Email: `test@example.com`
   - Password: `password123`
3. Login with credentials
4. Go to "Cloaked Links" → "Create Link"
5. Fill form:
   ```
   Slug: demo
   Bot URL: https://www.example.com
   User URL: https://google.com
   Title: Demo Link
   ```
6. Copy the link URL and test it!

## 🤖 Test Bot Detection

Open terminal and run:

```bash
# Simulate Googlebot access
curl -H "User-Agent: Googlebot" http://localhost:5000/go/demo

# Simulate user access
curl http://localhost:5000/go/demo
```

## 📊 View Analytics

1. Dashboard - see total clicks and stats
2. Links - manage your cloaked links
3. Logs - view all requests
4. Settings - configure bot detection

## 🐛 Troubleshooting

**Backend won't start?**
- Check MongoDB is running: `mongod`
- Check port 5000 is free
- Check `.env` file exists

**Frontend won't connect?**
- Check backend is running
- Check browser console for errors
- Try clearing browser cache

**Links not working?**
- Check cloaking is enabled (Settings)
- Check MongoDB connection
- Check .env variables

## 📚 Next Steps

See full documentation:
- [README.md](README.md) - Complete guide
- [TESTING.md](TESTING.md) - Testing guide
- [API.md](API.md) - API documentation

---

**⚠️ Educational Purpose Only**: Do not use in production for SEO cloaking.
