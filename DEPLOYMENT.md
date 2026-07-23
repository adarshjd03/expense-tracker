# 🚀 Vercel Deployment Guide

## Deploy Backend and Frontend to Vercel

### Prerequisites
1. Push your code to GitHub first
2. Create a Vercel account at https://vercel.com/signup

---

## 📦 Step 1: Deploy Backend

### 1.1 Create New Project in Vercel
1. Go to https://vercel.com/new
2. Import your GitHub repository: `adarshjd03/expense-tracker`
3. Configure the project:
   - **Project Name**: `expense-tracker-api` (or any name)
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

### 1.2 Add Environment Variables
In the Vercel project settings, add these environment variables:

```
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_use_long_random_string
NODE_ENV=production
```

⚠️ **Important**: Change `JWT_SECRET` to a long random string for security!

### 1.3 Deploy
Click **Deploy** button and wait for deployment to complete.

### 1.4 Get Your Backend URL
After deployment, you'll get a URL like:
```
https://expense-tracker-api-xxxxx.vercel.app
```

**Copy this URL - you'll need it for the frontend!**

---

## 🎨 Step 2: Deploy Frontend

### 2.1 Create Another New Project
1. Go to https://vercel.com/new again
2. Import the same GitHub repository
3. Configure the project:
   - **Project Name**: `expense-tracker-app` (or any name)
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 2.2 Add Environment Variable
Add this environment variable (use your backend URL from Step 1.4):

```
VITE_API_URL=https://expense-tracker-api-xxxxx.vercel.app/api
```

Replace `https://expense-tracker-api-xxxxx.vercel.app` with YOUR actual backend URL!

### 2.3 Deploy
Click **Deploy** and wait for it to complete.

### 2.4 Get Your Frontend URL
You'll get a URL like:
```
https://expense-tracker-app-xxxxx.vercel.app
```

**This is your live app! 🎉**

---

## ✅ Step 3: Test Your Deployment

1. Visit your frontend URL
2. Click "Sign Up" and create an account
3. Add some transactions
4. Test all features (Goals, Investments, Reports, Theme toggle)

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: "Module not found" errors
**Solution**: Make sure `vercel.json` is in the root directory with correct paths

**Problem**: Database errors
**Solution**: Vercel serverless functions are stateless. Each request creates a new database connection. This is fine for SQLite in development but for production, consider using:
- Vercel Postgres
- PlanetScale (MySQL)
- MongoDB Atlas
- Supabase

### Frontend Issues

**Problem**: API calls failing / CORS errors
**Solution**: 
1. Check `VITE_API_URL` is set correctly in Vercel environment variables
2. Make sure it ends with `/api`
3. Redeploy frontend after updating env variables

**Problem**: 404 errors on page refresh
**Solution**: Vercel automatically handles this for Vite/React apps. If it persists, add this to `vercel.json`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🔄 Update Your Deployment

When you push new code to GitHub:
1. Vercel automatically detects the push
2. Builds and deploys automatically
3. Your site updates in ~2 minutes

---

## 🗄️ Database Consideration (Important!)

**SQLite Limitation on Vercel:**
- Serverless functions are stateless
- Each request might get a different instance
- Database file won't persist between deployments
- **Your data will be lost on each deployment!**

### Recommended Database Solutions for Production:

#### Option 1: Vercel Postgres (Easiest)
```bash
npm install @vercel/postgres
```
- Free tier: 256 MB
- Managed by Vercel
- Easy integration

#### Option 2: PlanetScale (MySQL)
- Free tier: 5 GB
- Serverless MySQL
- No connection limits

#### Option 3: MongoDB Atlas
- Free tier: 512 MB
- NoSQL database
- Global clusters

#### Option 4: Supabase (PostgreSQL)
- Free tier: 500 MB
- Includes auth, storage
- Real-time subscriptions

Would you like help migrating to any of these databases?

---

## 📝 Environment Variables Summary

**Backend (.env):**
```env
PORT=5000
JWT_SECRET=your_very_long_random_secret_key_here
NODE_ENV=production
```

**Frontend (.env):**
```env
VITE_API_URL=https://your-backend-url.vercel.app/api
```

---

## 🎯 Next Steps

1. **Custom Domain** (Optional): Add your own domain in Vercel dashboard
2. **Upgrade Database**: Migrate from SQLite to a production database
3. **Monitor**: Use Vercel Analytics to track usage
4. **Optimize**: Enable edge caching for static assets

---

## 💡 Tips

- **Free Tier Limits**: Vercel free tier gives you:
  - 100 GB bandwidth
  - Unlimited static sites
  - Serverless function execution limits apply

- **Automatic HTTPS**: Both frontend and backend get SSL certificates automatically

- **Custom Domains**: You can add your own domain for free in Vercel settings

---

Need help? Check Vercel docs: https://vercel.com/docs
