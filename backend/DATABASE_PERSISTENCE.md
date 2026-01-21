# Database Persistence Issue on Render Free Tier

## Problem
On Render's **free tier**, the filesystem is **ephemeral**, meaning:
- All files (including SQLite database) are deleted when the service restarts or goes to sleep
- User credentials and file metadata are lost
- This happens automatically after periods of inactivity

## Solution: Use PostgreSQL Database

Render provides a **free PostgreSQL database** that persists data. Follow these steps:

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `deepfake-db` (or your preferred name)
   - **Database**: `deepfake_db`
   - **User**: `deepfake_user` (auto-generated)
   - **Region**: Same as your backend service
   - **Plan**: Free (90 days free, then $7/month)
4. Click **"Create Database"**
5. **Copy the Internal Database URL** (you'll need this)

### Step 2: Update Backend to Use PostgreSQL

The backend needs to be updated to support PostgreSQL. Currently it only uses SQLite.

**Quick Fix (Temporary):**
- Upgrade to Render's **Starter plan** ($7/month) which includes persistent disk storage
- This allows SQLite to persist across restarts

**Proper Fix (Recommended):**
- Migrate to PostgreSQL (requires code changes)
- Add `psycopg2-binary` to `requirements.txt`
- Update database connection code to use PostgreSQL
- This is the production-ready solution

### Step 3: Environment Variables

Add the PostgreSQL connection string to your backend service:
- **Key**: `DATABASE_URL`
- **Value**: The Internal Database URL from Step 1

## Current Status

**Current Setup:**
- Uses SQLite database (`uploads/file_metadata.db`)
- Database is **ephemeral** on free tier
- Data is lost on service restart/sleep

**Recommended:**
- Use PostgreSQL for persistent storage
- Or upgrade to Starter plan for persistent disk

## Temporary Workaround

If you need immediate persistence without code changes:
1. Upgrade backend service to **Starter plan** ($7/month)
2. This provides persistent disk storage
3. SQLite database will persist across restarts

## Migration to PostgreSQL

To migrate to PostgreSQL, the following changes are needed:
1. Add `psycopg2-binary>=2.9.0` to `requirements.txt`
2. Update `init_database()` to support PostgreSQL
3. Update `get_db_connection()` to use PostgreSQL
4. Update all SQL queries to be PostgreSQL-compatible (mostly the same, but some differences)

Would you like me to implement PostgreSQL support?


