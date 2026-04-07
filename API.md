# Clocker API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All endpoints except `/auth/*` and `/go/:slug` require JWT token in header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Authentication Endpoints

### Register User
- **Endpoint**: `POST /auth/register`
- **Auth**: Not required
- **Body**:
  ```json
  {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "confirmPassword": "password123"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGc...",
    "userId": "507f1f77bcf86cd799439011"
  }
  ```

### Login User
- **Endpoint**: `POST /auth/login`
- **Auth**: Not required
- **Body**:
  ```json
  {
    "email": "test@example.com",
    "password": "password123"
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Login successful",
    "token": "eyJhbGc...",
    "userId": "507f1f77bcf86cd799439011"
  }
  ```

---

## Links Endpoints

### Create Link
- **Endpoint**: `POST /links`
- **Auth**: Required
- **Body**:
  ```json
  {
    "slug": "product-name",
    "botUrl": "https://example.com/seo-content",
    "userUrl": "https://redirect.com",
    "title": "Product Title",
    "description": "Optional description"
  }
  ```
- **Response** (201):
  ```json
  {
    "message": "Link created successfully",
    "link": {
      "_id": "507f...",
      "slug": "product-name",
      "botUrl": "https://example.com/seo-content",
      "userUrl": "https://redirect.com",
      "title": "Product Title",
      "cloakingEnabled": true,
      "clicks": 0,
      "botClicks": 0,
      "userClicks": 0,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  }
  ```

### Get All Links
- **Endpoint**: `GET /links`
- **Auth**: Required
- **Query Params**: None
- **Response** (200): Array of link objects

### Get Specific Link
- **Endpoint**: `GET /links/:slug`
- **Auth**: Required
- **Params**: `slug` - Link slug
- **Response** (200): Single link object

### Update Link
- **Endpoint**: `PUT /links/:slug`
- **Auth**: Required
- **Params**: `slug` - Link slug
- **Body** (all optional):
  ```json
  {
    "botUrl": "https://new-bot-url.com",
    "userUrl": "https://new-user-url.com",
    "title": "New Title",
    "description": "New description",
    "cloakingEnabled": false
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Link updated successfully",
    "link": { ... }
  }
  ```

### Delete Link
- **Endpoint**: `DELETE /links/:slug`
- **Auth**: Required
- **Params**: `slug` - Link slug
- **Response** (200):
  ```json
  {
    "message": "Link deleted successfully"
  }
  ```

### Get Link Statistics
- **Endpoint**: `GET /links/stats/overview`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "totalClicks": 150,
    "totalBotClicks": 50,
    "totalUserClicks": 100,
    "totalLinks": 5
  }
  ```

---

## Logs Endpoints

### Get Logs
- **Endpoint**: `GET /logs`
- **Auth**: Required
- **Query Params**:
  - `slug` (optional) - Filter by link slug
  - `type` (optional) - Filter by "bot" or "user"
  - `startDate` (optional) - ISO date string
  - `endDate` (optional) - ISO date string
  - `limit` (optional, default: 100) - Number of records
  - `skip` (optional, default: 0) - Number to skip
  
- **Example**: `GET /logs?type=bot&limit=50&skip=0`
- **Response** (200):
  ```json
  {
    "logs": [
      {
        "_id": "507f...",
        "slug": "product-name",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "detectedType": "user",
        "botName": null,
        "timestamp": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 500,
    "limit": 50,
    "skip": 0
  }
  ```

### Get Log Statistics
- **Endpoint**: `GET /logs/stats/overview`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "total": 150,
    "bot": 50,
    "user": 100
  }
  ```

### Clear All Logs
- **Endpoint**: `DELETE /logs/clear`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "message": "All logs cleared"
  }
  ```

---

## Settings Endpoints

### Get Settings
- **Endpoint**: `GET /settings`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "_id": "507f...",
    "cloakingEnabled": true,
    "botUserAgents": [
      "Googlebot",
      "Bingbot",
      "Slurp",
      "DuckDuckBot"
    ],
    "botIPs": [
      "66.249",
      "207.241",
      "202.97"
    ],
    "ipWhitelist": [],
    "ipBlacklist": [],
    "updatedAt": "2024-01-15T10:30:00Z"
  }
  ```

### Update Settings
- **Endpoint**: `PUT /settings`
- **Auth**: Required
- **Body** (all optional):
  ```json
  {
    "cloakingEnabled": true,
    "botUserAgents": ["Googlebot", "Bingbot"],
    "botIPs": ["66.249", "207.241"],
    "ipWhitelist": [],
    "ipBlacklist": []
  }
  ```
- **Response** (200):
  ```json
  {
    "message": "Settings updated successfully",
    "settings": { ... }
  }
  ```

### Toggle Global Cloaking
- **Endpoint**: `POST /settings/toggle`
- **Auth**: Required
- **Response** (200):
  ```json
  {
    "message": "Cloaking enabled",
    "cloakingEnabled": true
  }
  ```

---

## Public Cloaking Route

### Access Cloaked Link
- **Endpoint**: `GET /go/:slug`
- **Auth**: Not required
- **Params**: `slug` - Link slug
- **Behavior**:
  - If **bot detected**: Returns HTML page with metadata
  - If **user**: HTTP 303 redirect to user URL
  - If **not found**: 404 error
- **Response**:
  - Bot: 200 with HTML content
  - User: 303 redirect
  - Not found: 404 JSON error

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 401 Unauthorized
```json
{
  "error": "No token provided"
}
```

### 404 Not Found
```json
{
  "error": "Link not found"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Rate Limiting

The API implements rate limiting:
- **Window**: 15 minutes
- **Limit**: 100 requests per IP
- **Response** (429):
  ```json
  {
    "error": "Too many requests from this IP, please try again later."
  }
  ```

---

## Example API Workflows

### Complete Workflow: Create and Test a Link

1. **Register**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "username": "testuser",
       "email": "test@example.com",
       "password": "pass123",
       "confirmPassword": "pass123"
     }'
   ```

2. **Save token from response**
   ```bash
   TOKEN="eyJhbGc..."  # Save from response
   ```

3. **Create a link**
   ```bash
   curl -X POST http://localhost:5000/api/links \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "slug": "test",
       "botUrl": "https://example.com",
       "userUrl": "https://google.com",
       "title": "Test Link"
     }'
   ```

4. **Test cloaking**
   ```bash
   # As bot
   curl -H "User-Agent: Googlebot" http://localhost:5000/go/test
   
   # As user
   curl http://localhost:5000/go/test
   ```

5. **View logs**
   ```bash
   curl -H "Authorization: Bearer $TOKEN" \
     http://localhost:5000/api/logs
   ```

---

## CORS

The API allows requests from:
- Default: `http://localhost:5173` (frontend)
- Configure via `FRONTEND_URL` environment variable

---

## Pagination

For endpoints returning lists (links, logs):
- Use `limit` and `skip` query parameters
- Default limit: 100
- Maximum limit: Limited by server settings

Example:
```
GET /logs?limit=50&skip=100
```

This returns items 100-149.

---

For more details, see [README.md](README.md) and [TESTING.md](TESTING.md)
