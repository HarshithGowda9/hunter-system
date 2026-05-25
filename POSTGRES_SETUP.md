# PostgreSQL Setup for Render

This guide walks you through setting up a persistent PostgreSQL database for your Hunter System backend on Render.

## Step-by-Step Setup

### 1. Create PostgreSQL Database on Render

1. Go to [render.com](https://render.com) and sign in
2. Click "New +" button → Select "PostgreSQL"
3. Fill in the details:
   - **Name**: `hunter-system-db` (or any name you prefer)
   - **Database**: `hunterdb`
   - **Region**: Select closest to you (same as backend)
   - **PostgreSQL Version**: 15
4. Click "Create Database"
5. **Wait 2-3 minutes** for the database to initialize

### 2. Get Connection String

Once the database is ready:
1. You'll see a connection string like: `postgresql://user:password@host:5432/hunterdb`
2. **Copy the full connection string** (you'll need it in the next step)

### 3. Set Environment Variable in Backend

1. Go to your **hunter-system** backend service on Render
2. Click "Environment"
3. Add new environment variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste the PostgreSQL connection string from Step 2
4. Click "Save"
5. Render will automatically redeploy your backend

### 4. Verify Connection

1. Check the backend deployment logs
2. Look for messages like "CREATE TABLE" or successful database connections
3. If successful, your data will now persist!

---

## Connection String Format

Your `DATABASE_URL` should look like:
```
postgresql://user:password@host:5432/hunterdb
```

**Note**: Render automatically converts `postgres://` URLs to `postgresql://` - the code handles both.

---

## Testing the Connection

1. Go to your Netlify app: https://your-site.netlify.app
2. Create a daily log entry
3. If it saves without errors, PostgreSQL is working! ✅

---

## Troubleshooting

### "Connection refused" error
- Make sure `DATABASE_URL` is set in Render environment variables
- Verify the database exists and is in "Available" status
- Check that the connection string is correct

### "Authentication failed"
- Double-check the username and password in the connection string
- The password might contain special characters - make sure they're encoded correctly

### Data not persisting
- Verify `DATABASE_URL` is set (not empty)
- Check backend logs for any database connection errors
- Restart the backend service in Render dashboard

---

## Local Development

To use PostgreSQL locally instead of SQLite:

1. Install PostgreSQL locally
2. Create a database: `createdb hunterdb`
3. Create `.env` file in project root:
   ```
   DATABASE_URL=postgresql://localhost/hunterdb
   FRONTEND_URL=http://localhost:5173
   ```
4. Start backend: `uvicorn backend.main:app --reload`

---

## Next Steps

Once PostgreSQL is connected:
- Your data persists across deployments
- You can analyze trends over time
- Add more features that rely on historical data
- Consider adding backups (Render can auto-backup for paid plans)

Questions? Check Render's [PostgreSQL docs](https://render.com/docs/databases)
