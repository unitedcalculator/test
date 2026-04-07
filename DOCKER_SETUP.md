# DOCKER_SETUP.md

## Running Clocker with Docker

### Prerequisites
- Docker installed and running
- Docker Compose installed

### Quick Start

1. **From the root directory (clocker/), run:**
   ```bash
   docker-compose up --build
   ```

2. **Wait for all services to start** (about 1-2 minutes)

3. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - MongoDB: localhost:27017

### Services

- **MongoDB**: Database at `mongodb://admin:password@localhost:27017`
- **Backend**: Node.js Express server at `http://localhost:5000`
- **Frontend**: React Vite dev server at `http://localhost:5173`

### Stop Services

```bash
docker-compose down
```

### Stop and Remove Volumes

```bash
docker-compose down -v
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb
```

### Database Access

**Connect to MongoDB from outside container:**
```bash
mongosh "mongodb://admin:password@localhost:27017"
```

**Inside container:**
```bash
docker-compose exec mongodb mongosh -u admin -p password
```

### Environment Variables

Edit `docker-compose.yml` to change:
- `MONGODB_URI`
- `PORT`
- `JWT_SECRET`
- `FRONTEND_URL`

### Rebuild Services

```bash
# Rebuild specific service
docker-compose up --build backend

# Force rebuild without cache
docker-compose up --build --no-cache
```

### Common Issues

**Port already in use:**
- Change ports in docker-compose.yml
- Example: `"5001:5000"` for backend

**MongoDB connection refused:**
- Wait for MongoDB to fully start
- Check Docker network: `docker network ls`

**Frontend can't connect to backend:**
- Ensure both services are running
- Check `VITE_API_URL` in docker-compose.yml
- Clear browser cache

### Production Deployment

For production, modify docker-compose.yml:
- Change `node:18-alpine` to production image
- Remove development dependencies
- Add environment: `NODE_ENV: production`
- Configure proper URLs
