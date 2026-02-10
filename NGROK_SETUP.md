# Remote Access Setup with ngrok

## What is ngrok?
ngrok creates secure public URLs that tunnel to your localhost, allowing remote testers to access your local servers.

---

## Installation

### 1. Install ngrok
```bash
# Using Homebrew (macOS)
brew install ngrok

# OR download from: https://ngrok.com/download
```

### 2. Sign up and get auth token
1. Go to: https://dashboard.ngrok.com/signup
2. Copy your auth token
3. Run: `ngrok authtoken YOUR_AUTH_TOKEN`

---

## Expose Your Servers

### Terminal 1 - Backend (Port 8000)
```bash
ngrok http 8000
```

**Output will show:**
```
Forwarding    https://abc123.ngrok.io -> http://localhost:8000
```

Copy the `https://abc123.ngrok.io` URL - this is your **Backend Public URL**

### Terminal 2 - Frontend (Port 3000)
```bash
ngrok http 3000
```

**Output will show:**
```
Forwarding    https://xyz789.ngrok.io -> http://localhost:3000
```

Copy the `https://xyz789.ngrok.io` URL - this is your **Frontend Public URL**

---

## Update Frontend Configuration

### Edit `frontend/.env.local`:
```bash
# Change from:
NEXT_PUBLIC_API_URL=http://localhost:8000

# To your ngrok backend URL:
NEXT_PUBLIC_API_URL=https://abc123.ngrok.io
```

### Restart Frontend:
```bash
cd frontend
# Press Ctrl+C to stop
npm run dev
```

---

## Update Backend CORS

### Edit `backend/app/main.py`:

Find the CORS section and add your ngrok URLs:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://xyz789.ngrok.io",  # Add your frontend ngrok URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Restart Backend:
```bash
cd backend
# Press Ctrl+C to stop
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## Share with Testers

Send testers this information:

**Access URLs:**
- Frontend: `https://xyz789.ngrok.io`
- Backend API: `https://abc123.ngrok.io`
- API Docs: `https://abc123.ngrok.io/docs`

**Test Accounts:**
- Email: tester1@example.com
- Password: [Provide password]

**Important Notes:**
- ⚠️ These URLs change each time you restart ngrok (unless you have a paid plan)
- ⚠️ Keep your computer running while testing
- ⚠️ ngrok free plan has bandwidth limits
- ✅ Sessions remain active for 8 hours on free plan

---

## Monitoring ngrok

### View Traffic:
Open in browser: `http://localhost:4040`

You'll see:
- All HTTP requests/responses
- Request details
- Response times
- Errors

This helps debug issues during testing!

---

## Advantages:
✅ Quick setup (5 minutes)
✅ No deployment needed
✅ See live logs on your machine
✅ Easy to debug
✅ Free plan available

## Disadvantages:
❌ Computer must stay on
❌ URLs change on restart (free plan)
❌ Bandwidth limits
❌ Not suitable for long-term testing

---

## Alternative: ngrok Paid Plan ($8/month)

Benefits:
- Fixed URLs (don't change)
- Custom domains (test.yourapp.com)
- Higher bandwidth
- More concurrent tunnels

---

## Troubleshooting

### ngrok not found
```bash
# Verify installation
which ngrok

# If not found, install:
brew install ngrok
```

### Connection refused
- Verify backend is running: `curl http://localhost:8000/health`
- Verify frontend is running: `curl http://localhost:3000`

### CORS errors
- Make sure you added ngrok URLs to `main.py` CORS settings
- Restart backend after changes

### Widget not loading
- Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
- Restart frontend with `npm run dev`

---

## Testing Checklist

Before sharing URLs:
- [ ] Both servers running (backend + frontend)
- [ ] ngrok tunnels started (2 terminals)
- [ ] Frontend `.env.local` updated with backend ngrok URL
- [ ] Backend CORS updated with frontend ngrok URL
- [ ] Both servers restarted after config changes
- [ ] Test URLs in your browser first
- [ ] Widget appears and works
- [ ] Appointment booking works end-to-end

---

## Quick Start Commands

```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev

# Terminal 3: ngrok backend
ngrok http 8000

# Terminal 4: ngrok frontend
ngrok http 3000

# Then:
# 1. Copy ngrok URLs
# 2. Update frontend/.env.local with backend ngrok URL
# 3. Update backend/app/main.py CORS with frontend ngrok URL
# 4. Restart both servers
# 5. Share frontend ngrok URL with testers
```

---

**You're now ready for remote testing!** 🚀
