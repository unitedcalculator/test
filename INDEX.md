# 🎯 START HERE - Clocker Project Guide

Welcome to the **Clocker** - a full-stack educational cloaking system!

**⚠️ IMPORTANT:** This project is for **educational purposes only**. Do not use in production for SEO manipulation, as it violates search engine guidelines.

---

## 🚀 Get Started in 5 Minutes

### Option 1: Quick Start (Recommended)
```bash
# Backend
cd backend && npm install && cp .env.example .env && npm run dev

# Frontend (new terminal)
cd frontend && npm install && npm run dev
```

Visit: http://localhost:5173

### Option 2: Docker (All-in-One)
```bash
docker-compose up --build
```

Visit: http://localhost:5173

---

## 📚 Documentation Guide

Choose based on what you want to do:

| Goal | Read |
|------|------|
| **Understand the project** | [README.md](README.md) |
| **Setup quickly** | [QUICKSTART.md](QUICKSTART.md) |
| **Use the system** | [FEATURES.md](FEATURES.md) |
| **Learn how it works** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Test it** | [TESTING.md](TESTING.md) |
| **API reference** | [API.md](API.md) |
| **Fix problems** | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| **Deploy with Docker** | [DOCKER_SETUP.md](DOCKER_SETUP.md) |
| **Complete overview** | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |

---

## 🎯 First Time Users

### 1. Read README.md (3 min)
Overview of the entire project

### 2. Follow QUICKSTART.md (5 min)
Get the system running locally

### 3. Read FEATURES.md (10 min)
Understand what you can do

### 4. Test It (5 min)
Create a link and test bot detection

### 5. Explore Code (30 min)
Look at how it's implemented

---

## 🏗️ Project Architecture

```
Frontend (React + Vite)      Backend (Express)      Database (MongoDB)
├─ Login Page         →  ├─ JWT Auth       →  ├─ Users
├─ Dashboard          →  ├─ Link Manager   →  ├─ Links
├─ Link Manager       →  ├─ Bot Detection  →  ├─ Logs
├─ Log Viewer         →  ├─ Logging        →  └─ Settings
└─ Settings           →  └─ Settings       →
                          (Port 5000)           (Port 27017)
      (Port 5173)
```

---

## 👤 Default Test Account

After first setup:
- **Email:** test@example.com
- **Password:** password123

---

## 🔑 Key Features

✅ **Bot Detection**
- Detects Googlebot, Bingbot, and 11+ other bots
- IP-based detection
- Fully configurable

✅ **Link Management**
- Create cloaked links with custom slugs
- Track clicks and analytics
- Per-link cloaking control

✅ **Admin Dashboard**
- Real-time statistics
- Interactive charts
- Request logging
- Settings configuration

✅ **Security**
- JWT authentication
- Password hashing
- Rate limiting
- Protected routes

---

## 📊 What's Inside

**Backend:**
- 12 Express files (routes, controllers, models)
- MongoDB with Mongoose
- JWT authentication
- Bot detection middleware

**Frontend:**
- 10 React components and pages
- Tailwind CSS styling
- Recharts visualizations
- Responsive design

**Documentation:**
- 8 comprehensive guides
- 2,000+ lines of documentation
- Code examples and recipes

---

## 🧪 Quick Test

1. **Create a link:**
   - Go to "Cloaked Links"
   - Click "Create Link"
   - Slug: `demo`
   - Bot URL: `https://example.com`
   - User URL: `https://google.com`

2. **Test bot access:**
   ```bash
   curl -H "User-Agent: Googlebot" http://localhost:5000/go/demo
   ```

3. **Test user access:**
   ```bash
   curl http://localhost:5000/go/demo
   ```

4. **View logs:**
   - Go to "Logs"
   - See both requests recorded

---

## 📁 Project Structure

```
clocker/
├── backend/              (Node.js + Express)
│   ├── server.js
│   ├── config/db.js
│   ├── models/           (Mongoose schemas)
│   ├── controllers/      (Business logic)
│   ├── middleware/       (Auth, bot detection)
│   └── routes/           (API endpoints)
│
├── frontend/             (React + Vite)
│   ├── src/
│   │   ├── pages/        (Dashboard, Links, Logs, etc.)
│   │   ├── components/   (Navbar, Table, etc.)
│   │   └── services/     (API client)
│   └── index.html
│
├── Documentation/
│   ├── README.md         ← Start here
│   ├── QUICKSTART.md
│   ├── FEATURES.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── TESTING.md
│   ├── TROUBLESHOOTING.md
│   └── DOCKER_SETUP.md
└── docker-compose.yml
```

---

## ⚡ Common Commands

### Backend
```bash
cd backend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm test                 # Run tests (if configured)
```

### Frontend
```bash
cd frontend
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
```

### Docker
```bash
docker-compose up --build         # Start all services
docker-compose logs -f            # View logs
docker-compose down               # Stop services
docker-compose down -v            # Stop and remove volumes
```

---

## 🐛 Having Issues?

1. **Check TROUBLESHOOTING.md** first
2. **Verify MongoDB is running**
3. **Check .env files are created**
4. **Clear cache: `rm -rf node_modules && npm install`**
5. **Restart all services**

---

## 🎓 Learning Path

1. **Beginner:** Read README.md → QUICKSTART.md → Follow FEATURES.md
2. **Intermediate:** Study ARCHITECTURE.md → Review API.md → Examine code
3. **Advanced:** Deploy with Docker → Set up monitoring → Customize

---

## 🔗 Important Links

| Resource | Location |
|----------|----------|
| Setup Instructions | [QUICKSTART.md](QUICKSTART.md) |
| API Documentation | [API.md](API.md) |
| Architecture | [ARCHITECTURE.md](ARCHITECTURE.md) |
| Features Guide | [FEATURES.md](FEATURES.md) |
| Testing Guide | [TESTING.md](TESTING.md) |
| Troubleshooting | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) |
| Project Summary | [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) |

---

## ⚠️ Important Notes

### For Educational Use:
✅ Learn cloaking concepts
✅ Understand bot detection
✅ Study full-stack development
✅ Test detection mechanisms
✅ Experiment locally

### NOT For Production:
❌ SEO manipulation
❌ Bypassing security
❌ Commercial use
❌ Real websites
❌ Cloud deployment without warnings

---

## 🎯 Next Steps

1. **[Read the QUICKSTART →](QUICKSTART.md)** (5 min)
2. **[Setup the project →](QUICKSTART.md)** (5 min)
3. **[Create your first link →](FEATURES.md)** (5 min)
4. **[Explore the code →](ARCHITECTURE.md)** (30 min)

---

## 💡 What You'll Learn

- Full-stack MERN development
- JWT authentication
- Bot detection mechanisms
- API design principles
- Database modeling
- React component architecture
- Express middleware
- MongoDB queries
- Docker containerization

---

## 🤝 Contributing

This is an educational project. Feel free to:
- Study the code
- Modify for learning
- Create variations
- Test concepts
- Share knowledge

---

## 📞 Stuck?

1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review [README.md](README.md)
3. See [API.md](API.md)
4. Read [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🎉 Ready?

**[👉 START WITH QUICKSTART.md 👈](QUICKSTART.md)**

Or jump to:
- [README.md](README.md) - Complete overview
- [FEATURES.md](FEATURES.md) - What you can do
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Fix problems

---

**Made for learning. Made for teaching. Made for understanding cloaking concepts.**

⭐ Star this project if you found it useful!

---

*Last Updated: January 2024*
*Version: 1.0.0 - Complete Edition*
