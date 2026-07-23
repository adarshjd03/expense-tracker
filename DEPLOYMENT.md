# 🚀 Vercel Deployment Guide

## Deploy Full-Stack Expense Tracker to Vercel

### Prerequisites
1. Push your code to GitHub
2. Create a Vercel account at https://vercel.com/signup

---

## 📦 Step 1: Create Vercel Postgres Database

### 1.1 Create a Storage Database
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Click on the **Storage** tab
3. Click **Create Database**
4. Select **Postgres**
5. Name it: `expense-tracker-db`
6. Select a region (closest to your users)
7. Click **Create**

### 1.2 Note Your Database Credentials
After creation, you'll see connection strings. Keep this tab open - you'll need these values!

---

## 🖥️ Step 2: Deploy Backend

### 2.1 Push Your Code to GitHub
```bash
cd c:\blueberry project\expense-tracker
git push origin main
```

If you get authentication errors, you may need to set up a Personal Access Token:
1. Go to GitHub → Settings → Developer settings → Personal access tokens
2. Generate a new token with `repo` scope
3. Use the token as your password when pushing

### 2.2 Create Backend Project in Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository: `adarshjd03/expense-tracker`
3. Configure the project:
   - **Project Name**: `expense-tracker-backend`
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 2.3 Connect Database to Backend Project
1. In the backend project settings, go to **Storage** tab
2. Click **Connect Store**
3. Select your `expense-tracker-db` Postgres database
4. Click **Connect**

This will automatically add these environment variables:
- `POSTGRES_URL`
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_USER`
- `POSTGRES_HOST`
- `POSTGRES_PASSWORD`
- `POSTGRES_DATABASE`

### 2.4 Add Additional Environment Variables
In **Settings → Environment Variables**, add:

```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_32_chars
NODE_ENV=production
```

⚠️ **Important**: Change `JWT_SECRET` to a long random string (minimum 32 characters) for security!

Example: `JWT_SECRET=k8Hf2Lm9Np4Qr5St6Uv7Ww8Xx9Yy0Zz1Aa2Bb3`

### 2.5 Deploy Backend
1. Click **Deploy** button
2. Wait for deployment to complete (~2-3 minutes)
3. Check deployment logs for any errors

### 2.6 Get Your Backend URL
After deployment, you'll get a URL like:
```
https://expense-tracker-backend-xxxxx.vercel.app
```

**Copy this URL - you'll need it for the frontend!**

### 2.7 Test Backend
Visit: `https://your-backend-url.vercel.app/api/health`

You should see: `{"status":"ok"}`

---

## 🎨 Step 3: Deploy Frontend

### 3.1 Create Frontend Project
1. Go to https://vercel.com/new again
2. Import the same GitHub repository
3. Configure the project:
   - **Project Name**: `expense-tracker-frontend`
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 3.2 Add Environment Variable
Add this environment variable (use your backend URL from Step 2.6):

```
VITE_API_URL=https://expense-tracker-backend-xxxxx.vercel.app/api
```

⚠️ **Important**: 
- Replace with YOUR actual backend URL
- Must end with `/api`
- Don't add trailing slash

### 3.3 Deploy Frontend
1. Click **Deploy**
2. Wait for it to complete (~1-2 minutes)

### 3.4 Get Your Frontend URL
You'll get a URL like:
```
https://expense-tracker-frontend-xxxxx.vercel.app
```

**This is your live app! 🎉**

---

## ✅ Step 4: Initialize Database Schema

The database tables will be created automatically when the backend starts. To verify:

1. Visit your backend health endpoint: `https://your-backend-url.vercel.app/api/health`
2. Check the deployment logs in Vercel dashboard
3. Look for: `✓ Database initialized (Vercel Postgres)`

If you see any errors, check:
- Database connection variables are set correctly
- Postgres database is in the same region as your backend
- No typos in environment variables

---

## ✅ Step 5: Test Your Full-Stack Deployment

1. Visit your frontend URL: `https://expense-tracker-frontend-xxxxx.vercel.app`
2. Click **Sign Up** and create an account
3. Add some transactions (income and expenses)
4. Test all features:
   - ✅ Transactions (add, edit, delete)
   - ✅ Categories (view, add)
   - ✅ Goals (create, contribute, track progress)
   - ✅ Investments (add, update, calculate ROI)
   - ✅ Reports (filter by date, category)
   - ✅ Dashboard charts (pie chart, bar chart)
   - ✅ Light/Dark theme toggle
5. Log out and log back in to verify auth

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Build fails with "better-sqlite3" error
**Solution**: Make sure you pushed the latest code that uses @vercel/postgres (not better-sqlite3)

**Problem**: Database connection errors
**Solution**: 
1. Go to backend project → Storage tab
2. Make sure database is connected
3. Check environment variables include `POSTGRES_URL`
4. Redeploy backend

**Problem**: "Database initialization error"
**Solution**: Check deployment logs. Common issues:
- Invalid SQL syntax (should be PostgreSQL, not SQLite)
- Connection timeout (try different region)
- Missing environment variables

**Problem**: Tables not created
**Solution**: The `initializeDatabase()` function runs on startup. Check:
1. Deployment logs for errors
2. Make sure `server.js` imports and calls `initializeDatabase()`
3. Try redeploying backend

### Frontend Issues

**Problem**: API calls failing / CORS errors
**Solution**: 
1. Check `VITE_API_URL` in Vercel environment variables
2. Must end with `/api` (no trailing slash)
3. Redeploy frontend after updating env variables

**Problem**: "Network Error" or blank dashboard
**Solution**:
1. Open browser DevTools (F12) → Console
2. Check for API errors
3. Verify backend URL is correct
4. Test backend health endpoint separately

**Problem**: 404 errors on page refresh
**Solution**: Vercel handles this automatically for Vite. If it persists, add to `frontend/vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### Database Issues

**Problem**: "password authentication failed"
**Solution**: 
1. Go to Storage → your database
2. Click "Reconnect" to refresh credentials
3. Redeploy backend

**Problem**: Data disappears between requests
**Solution**: You might still be using SQLite. Verify:
1. Check `backend/package.json` has `@vercel/postgres` (not `better-sqlite3`)
2. Check `backend/db.js` imports from `@vercel/postgres`
3. Redeploy backend

---

## 🔄 Update Your Deployment

### Automatic Updates
When you push new code to GitHub:
1. Vercel detects the push automatically
2. Builds and deploys both frontend and backend
3. Your site updates in ~2-3 minutes

### Manual Redeploy
In Vercel dashboard:
1. Go to Deployments tab
2. Click the three dots (⋮) on latest deployment
3. Click "Redeploy"

---

## 📊 Vercel Postgres Database Management

### View Your Database
1. Go to Vercel dashboard → Storage tab
2. Click on your database
3. Click **Data** tab to browse tables
4. Use the **Query** tab to run SQL

### Run SQL Queries
```sql
-- View all users
SELECT id, name, email, created_at FROM users;

-- View transactions count
SELECT COUNT(*) FROM transactions;

-- View all tables
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

### Backup Your Database
1. Go to database → **Settings** tab
2. Click **Backups**
3. Vercel automatically creates daily backups (on paid plans)

### Free Tier Limits
- Storage: 256 MB
- Rows: ~10,000-50,000 (depends on data)
- Queries: Unlimited
- Suitable for personal projects and small apps

---

## 📝 Environment Variables Summary

### Backend Environment Variables
```env
# Auto-added by Vercel when connecting Postgres database:
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# Manually add these:
PORT=5000
JWT_SECRET=your_very_long_random_secret_key_here_min_32_characters
NODE_ENV=production
```

### Frontend Environment Variables
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

---

## 🎯 Next Steps

1. **Custom Domain** (Optional): 
   - Add your own domain in Vercel dashboard → Settings → Domains
   - Example: `expense-tracker.yourdomain.com`

2. **Monitor Usage**:
   - Analytics tab shows visitors, page views
   - Speed Insights for performance monitoring

3. **Upgrade Database** (if needed):
   - Upgrade to Vercel Pro for more storage
   - Or migrate to PlanetScale/Supabase for larger apps

4. **Add Features**:
   - Email notifications
   - Export data to CSV
   - Recurring transactions
   - Budget alerts

---

## 💡 Pro Tips

### Development Workflow
```bash
# Make changes locally
cd frontend
npm run dev

# Test backend locally (requires local Postgres or use Vercel dev)
cd backend
npm start

# Commit and push
git add .
git commit -m "Add new feature"
git push origin main
# Vercel auto-deploys!
```

### Vercel CLI (Optional)
```bash
npm i -g vercel

# Deploy from command line
cd backend
vercel --prod

cd ../frontend
vercel --prod
```

### Environment Variables for Different Branches
- Production: Uses env vars from dashboard
- Preview (PRs): Can have separate preview env vars
- Development: Use local `.env` files

---

## 🔐 Security Best Practices

1. **Never commit `.env` files** to GitHub
2. **Use long JWT secrets** (minimum 32 characters)
3. **Enable 2FA** on your Vercel account
4. **Rotate secrets** periodically
5. **Use HTTPS** (automatic with Vercel)
6. **Validate user input** (already implemented in validators)

---

## 📊 Architecture Overview

```
┌─────────────────────────────────────────────┐
│  User Browser                               │
│  https://expense-tracker-frontend.vercel.app│
└────────────┬────────────────────────────────┘
             │
             │ HTTPS API Requests
             │
┌────────────▼────────────────────────────────┐
│  Backend (Node.js + Express)                │
│  https://expense-tracker-backend.vercel.app │
│  - Authentication (JWT)                     │
│  - RESTful API                              │
│  - Business Logic                           │
└────────────┬────────────────────────────────┘
             │
             │ @vercel/postgres
             │
┌────────────▼────────────────────────────────┐
│  Vercel Postgres Database                   │
│  - Users, Transactions, Categories          │
│  - Goals, Investments                       │
│  - Automatic backups                        │
└─────────────────────────────────────────────┘
```

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Postgres Docs**: https://vercel.com/docs/storage/vercel-postgres
- **Vercel Community**: https://vercel.com/community
- **GitHub Issues**: Create an issue in your repository

---

## ✅ Deployment Checklist

Before going live, verify:

- [ ] Backend deployed successfully
- [ ] Frontend deployed successfully  
- [ ] Database connected to backend
- [ ] All environment variables set correctly
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] Can sign up and create account
- [ ] Can log in with created account
- [ ] Can add, edit, delete transactions
- [ ] Charts display correctly
- [ ] Goals feature works
- [ ] Investments feature works
- [ ] Reports generate correctly
- [ ] Light/Dark theme toggle works
- [ ] Mobile responsive (test on phone)

---

**Congratulations! Your full-stack expense tracker is now live! 🎉**

Share your app URL and start tracking your finances!
