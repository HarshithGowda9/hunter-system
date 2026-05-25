# DEPLOYMENT GUIDE: Netlify + Railway

## Frontend Deployment (Netlify)

### Step 1: Prepare Frontend
1. Copy `.env.example` to `.env.production`
2. Set `VITE_API_URL` to your Railway backend URL (example: `https://your-app-api.railway.app`)

### Step 2: Deploy to Netlify
1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign in
3. Click "New site from Git"
4. Select your GitHub repository
5. Build settings:
   - **Build command**: `cd frontend && npm run build`
   - **Publish directory**: `frontend/dist`
6. Add environment variable in Netlify:
   - `VITE_API_URL` = Your Railway API URL
7. Click "Deploy"

---

## Backend Deployment (Railway)

### Step 1: Create Railway Project
1. Go to [railway.app](https://railway.app) and sign up
2. Create a new project
3. Select "Deploy from GitHub"
4. Connect your GitHub repository

### Step 2: Configure Railway
1. Go to your Railway project
2. Create a new service or update existing
3. Set environment variables:
   - `FRONTEND_URL` = Your Netlify domain (example: `https://your-app.netlify.app`)
   - Python version: 3.11 (or your preferred version)
4. Railway will automatically detect the `Procfile` and deploy

### Step 3: Get Your Backend URL
- Once deployed, Railway gives you a public URL
- Use this URL as `VITE_API_URL` in your Netlify environment variables

---

## Environment Variables Summary

### Frontend (.env)
```
VITE_API_URL=https://your-backend.railway.app
```

### Backend (Railway)
```
FRONTEND_URL=https://your-app.netlify.app
```

---

## Testing Deployed App
1. Visit your Netlify URL
2. Check browser console for CORS or API errors
3. If issues occur:
   - Verify `VITE_API_URL` in Netlify build settings
   - Verify `FRONTEND_URL` in Railway environment
   - Check Railway logs for backend errors

---

## Database Note
- SQLite database (`hunter.db`) is local to Railway
- Each Railway deployment gets its own database file
- Data persists across restarts but not across different deployments
- For production, consider migrating to PostgreSQL on Railway

---

## Git Workflow
```bash
# Push to main
git add .
git commit -m "Your message"
git push origin main

# Both Netlify and Railway will auto-deploy
```
