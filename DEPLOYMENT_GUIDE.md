# Production Deployment Guide for Testing

**Easier and more reliable than ngrok!**

---

## Overview

We'll deploy:
- **Backend** → Railway (free tier, easy setup)
- **Frontend** → Vercel (free tier, automatic deployment)

Total setup time: ~15 minutes

---

## Part 1: Deploy Backend to Railway

### 1. Sign up for Railway
- Go to: https://railway.app
- Click "Login with GitHub"
- Authorize Railway

### 2. Create New Project
- Click "New Project"
- Select "Deploy from GitHub repo"
- Connect your GitHub account (if not connected)
- Select your repository OR use "Deploy from local"

### 3. If deploying from local (easier):

**Create these files in `backend/` directory:**

#### A. Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### B. Create `runtime.txt`:
```
python-3.10.0
```

#### C. Ensure `requirements.txt` exists in `backend/`:
```bash
cd backend
pip freeze > requirements.txt
```

### 4. Deploy via Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# OR using brew
brew install railway

# Login
railway login

# Initialize project
cd backend
railway init

# Add environment variables (Railway dashboard)
# Go to: Variables tab and add:
```

### 5. Add Environment Variables in Railway Dashboard:

**Required Variables:**
```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GROQ_API_KEY=your_groq_key
RESEND_API_KEY=your_resend_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number
PLATFORM_ADMIN_EMAIL=bambojude@gmail.com
```

### 6. Deploy:
```bash
railway up
```

### 7. Get Your Backend URL:
- Go to Railway dashboard
- Click on your service
- Under "Settings" → "Public Networking"
- Click "Generate Domain"
- Copy URL (e.g., `https://your-app.up.railway.app`)

**Your Backend URL**: `https://your-app.up.railway.app`

---

## Part 2: Deploy Frontend to Vercel

### 1. Sign up for Vercel
- Go to: https://vercel.com
- Click "Sign Up" with GitHub
- Authorize Vercel

### 2. Install Vercel CLI (Optional but easier):

```bash
npm install -g vercel
```

### 3. Deploy from `frontend/` directory:

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel
```

**Follow prompts:**
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- Project name? **raven-support** (or your choice)
- Directory? **./** (current directory)
- Want to override settings? **Yes**

**Build settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### 4. Add Environment Variables:

During deployment, you'll be asked to add environment variables.

**OR add them in Vercel Dashboard:**
- Go to: https://vercel.com/dashboard
- Select your project
- Go to "Settings" → "Environment Variables"

**Add these variables:**
```
NEXT_PUBLIC_API_URL=https://your-app.up.railway.app
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Redeploy after adding variables:
```bash
vercel --prod
```

### 6. Get Your Frontend URL:
Vercel will show: `https://raven-support.vercel.app` (or similar)

**Your Frontend URL**: `https://raven-support.vercel.app`

---

## Part 3: Update Backend CORS

### 1. Edit `backend/app/main.py`:

Update CORS to include your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://raven-support.vercel.app",  # Add your Vercel URL
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 2. Push changes and redeploy:

```bash
# If using Railway CLI
cd backend
railway up

# OR push to GitHub and Railway auto-deploys
```

---

## Part 4: Test Deployment

### 1. Check Backend Health:
```bash
curl https://your-app.up.railway.app/health
```

Expected: `{"status":"healthy"}`

### 2. Check API Docs:
Open: `https://your-app.up.railway.app/docs`

Should show FastAPI Swagger UI

### 3. Check Frontend:
Open: `https://raven-support.vercel.app`

Should show login/signup page

### 4. Test Widget:
- Frontend should load
- Widget should appear in bottom-right
- Click widget, send message
- AI should respond

### 5. Test Appointment Booking:
- Say "I want to book an appointment"
- Slots should appear
- Complete booking flow
- Check Railway logs for confirmation

---

## Monitoring & Logs

### Railway (Backend):
```bash
# View logs in real-time
railway logs

# OR check Railway dashboard → Deployments → Logs
```

### Vercel (Frontend):
- Go to: Vercel Dashboard → Project → Deployments
- Click on deployment
- View "Build Logs" and "Function Logs"

---

## Share with Testers

**Email Template:**

---

Subject: Raven Support - Remote Testing Access

Hi Team,

The Raven Support platform is deployed and ready for testing!

**Access:**
- App URL: https://raven-support.vercel.app
- API Docs: https://your-app.up.railway.app/docs

**Test Accounts:**
(You'll need to create these in Supabase Auth)
- tester1@example.com / password
- tester2@example.com / password

**Documentation:**
- Review REMOTE_TESTING_PREP.md
- Complete TESTING_CHECKLIST.md
- Report bugs using BUG_REPORT_TEMPLATE.md

**Focus Areas:**
1. Appointment booking (critical)
2. Chat widget functionality
3. System business visibility

**Timeline:**
Please complete by: [date]

Thank you!

---

---

## Advantages of Cloud Deployment

✅ **No computer needed** - Runs 24/7 in cloud
✅ **Stable URLs** - Don't change
✅ **Fast** - CDN-powered
✅ **Free tier** - Both Railway and Vercel offer free plans
✅ **Auto-scaling** - Handles multiple testers
✅ **Real environment** - Tests actual production setup
✅ **Easy updates** - Push code, auto-deploys

---

## Cost

**Railway (Backend):**
- Free tier: $5/month credit (enough for testing)
- After free credit: ~$0.01/hour

**Vercel (Frontend):**
- Free tier: Unlimited for personal projects
- Includes: 100GB bandwidth, 100 builds/day

**Total for testing: FREE** (within free tier limits)

---

## Troubleshooting

### Backend deployment fails on Railway:
- Check `requirements.txt` exists in backend/
- Verify Python version in `runtime.txt`
- Check Railway logs for errors
- Ensure all env variables are set

### Frontend deployment fails on Vercel:
- Verify `package.json` has correct scripts
- Check Node version (18+ required)
- Ensure `.env.local` variables are in Vercel settings
- Check build logs for errors

### CORS errors:
- Verify Vercel URL is in `main.py` CORS list
- Include `https://*.vercel.app` for preview deployments
- Redeploy backend after CORS changes

### Widget not loading:
- Verify `NEXT_PUBLIC_API_URL` points to Railway backend
- Check browser console for errors
- Verify backend is running: visit `/health` endpoint

### 500 errors:
- Check Railway logs: `railway logs`
- Verify database connection (Supabase URL/key)
- Check all environment variables are set

---

## Alternative: Quick Deploy Button

Create a one-click deploy:

### Railway Button:
Add to your README.md:
```markdown
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/YOUR_USERNAME/YOUR_REPO)
```

### Vercel Button:
```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/YOUR_REPO)
```

---

## Next Steps After Deployment

1. **Create Test Accounts** in Supabase Auth
2. **Share URLs** with testing team
3. **Monitor logs** during testing
4. **Collect feedback** via bug reports
5. **Iterate** - fix bugs and redeploy

---

**Your app is now accessible worldwide!** 🌍🚀

**Quick Reference:**
- Backend: Railway → https://your-app.up.railway.app
- Frontend: Vercel → https://raven-support.vercel.app
- Logs: Railway CLI: `railway logs` | Vercel Dashboard
- Updates: Git push → Auto-deploy
