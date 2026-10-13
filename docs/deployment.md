# CollegeSphere — Production Deployment Guide (Vercel & MongoDB Atlas)

## 1. Cloud Architecture Overview

- **Frontend**: React + TypeScript + Vite SPA hosted on Vercel.
- **Backend**: Node.js + Express + TypeScript running as Vercel Serverless Functions (`/api/v1/*`).
- **Database**: MongoDB Atlas M0/M10+ Replica Set.
- **Security**: HTTPS only, HttpOnly cookies/Bearer tokens, CORS restricted to frontend Vercel URL.

```
[Browser]
    | (HTTPS)
    v
[Vercel Frontend] (https://collegesphere.vercel.app)
    | (API calls to /api/v1)
    v
[Vercel Serverless Backend] (https://collegesphere-api.vercel.app/api/v1)
    | (TLS Connection Pool)
    v
[MongoDB Atlas Cluster]
```

## 2. Serverless Optimization Strategy
1. **Connection Pooling**: Mongoose connection is cached across warm lambda invocations via global singleton:
   ```typescript
   let cached = global.mongoose;
   if (!cached) cached = global.mongoose = { conn: null, promise: null };
   ```
2. **Stateless Operations**: No local state stored on server disk; files stored as metadata or uploaded to storage.
3. **Graceful Timeouts**: MongoDB connection options configured with `serverSelectionTimeoutMS: 5000` to prevent hanging lambda invocations.

## 3. Environment Variables

### Backend (Vercel Project 1: Backend)
- `MONGODB_URI`: MongoDB Atlas connection string (`mongodb+srv://...`)
- `DB_NAME`: `college_sphere`
- `JWT_SECRET`: 64-character cryptographically random secret
- `NODE_ENV`: `production`
- `FRONTEND_URL`: `https://your-frontend-project.vercel.app`

### Frontend (Vercel Project 2: Frontend)
- `VITE_API_BASE_URL`: `https://your-backend-project.vercel.app/api/v1`

## 4. Deployment Verification Checklist
- [ ] Backend health check responds `200 OK` with DB connected.
- [ ] User authentication succeeds for all roles.
- [ ] CORS permits frontend origin and blocks unauthorized origins.
- [ ] Role-based authorization rejects unauthorized actions.
- [ ] Students can view their records but cannot access others'.
- [ ] All SPA frontend routes resolve without 404 upon browser refresh.
