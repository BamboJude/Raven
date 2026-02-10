# Remote Testing Preparation Guide

**Date**: February 10, 2026
**Version**: 1.0
**Status**: Ready for Team Testing

---

## Overview

This guide prepares the Raven Support platform for remote testing by other teams. It covers deployment, configuration, test accounts, and testing scenarios.

---

## 1. Pre-Deployment Checklist

### ✅ Completed Fixes (Ready for Testing)
- [x] System business visibility (admin-only access)
- [x] Appointment booking flow (name + email extraction)
- [x] Conversation closing detection
- [x] Database schema fix (email required, phone optional)
- [x] Global support widget (available on all pages)
- [x] Post-appointment follow-up question

### 🔧 Environment Configuration

**Backend** (`backend/.env`):
```bash
# Required variables to verify:
SUPABASE_URL=<your-supabase-url>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
GROQ_API_KEY=<your-groq-api-key>
RESEND_API_KEY=<your-resend-key>
TWILIO_ACCOUNT_SID=<your-twilio-sid>
TWILIO_AUTH_TOKEN=<your-twilio-token>
TWILIO_PHONE_NUMBER=<your-twilio-number>
```

**Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

---

## 2. Database Migrations Status

### Applied Migrations:
1. ✅ `001_initial_schema.sql` - Core tables (businesses, conversations, messages)
2. ✅ `002_appointments.sql` - Appointments and availability
3. ✅ `003_notifications.sql` - Notification system
4. ✅ `003_team_members` (backend) - Team management
5. ✅ `004_message_media` (backend) - Media uploads
6. ✅ `005_conversation_takeover` (backend) - Live chat takeover
7. ✅ `007_fix_appointment_fields.sql` - **CRITICAL FIX** (email NOT NULL, phone NULL)

### ⚠️ Pending Migration (Optional):
- `006_welcome_message_en + widget_settings` - Not critical for testing

### Run All Migrations:
```bash
# In Supabase SQL Editor, run in order:
# 1. supabase/migrations/001_initial_schema.sql
# 2. supabase/migrations/002_appointments.sql
# 3. supabase/migrations/003_notifications.sql
# 4. supabase/migrations/007_fix_appointment_fields.sql
```

---

## 3. Deployment Options

### Option A: Local Testing (Recommended for Initial Tests)

**Start Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Start Frontend:**
```bash
cd frontend
npm run dev
```

**Access URLs:**
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### Option B: Production Deployment

**Backend (Railway/Heroku/DigitalOcean):**
1. Deploy FastAPI app with requirements.txt
2. Set environment variables
3. Ensure port 8000 is exposed
4. Update CORS settings in `main.py` with production domain

**Frontend (Vercel/Netlify):**
1. Deploy Next.js app
2. Set environment variables:
   - `NEXT_PUBLIC_API_URL` → production backend URL
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Widget (CDN):**
1. Build widget: `cd widget && npm run build`
2. Upload `dist/raven-widget.js` to CDN or static hosting
3. Update `NEXT_PUBLIC_API_URL` in frontend `.env.local`

---

## 4. Test Accounts

### Admin Account
- **Email**: `bambojude@gmail.com`
- **Role**: Platform Admin
- **Access**: All businesses (including Raven Support system business)
- **Features**: Full dashboard access, team management, analytics

### Regular User Accounts (Create for Testers)

Create test accounts via Supabase Auth or sign-up flow:

**Test User 1:**
- Email: `tester1@example.com`
- Role: Business Owner
- Should see: Empty dashboard initially, can create businesses

**Test User 2:**
- Email: `tester2@example.com`
- Role: Business Owner
- Should see: Only their own businesses (no system businesses)

---

## 5. Testing Scenarios

### 🎯 Core Features to Test

#### A. User Registration & Authentication
1. Sign up with new email
2. Verify email (check Supabase Auth)
3. Sign in / Sign out
4. Password reset (if implemented)

**Expected Result**: User can register, login, and access dashboard

---

#### B. Business Management
1. Create new business
2. Configure business settings:
   - Name, description, language (French/English)
   - Contact info (phone, email, address)
3. Add FAQs (at least 3)
4. Add products (at least 2)
5. Customize welcome message
6. Save configuration

**Expected Result**: Business created successfully, config saved

---

#### C. Chat Widget (Public - No Login Required)

**Test on: `http://localhost:3000` (any page)**

1. **Basic Chat:**
   - Widget appears in bottom-right corner
   - Click to open chat
   - Send message: "Hello"
   - AI responds in business language

2. **FAQ Testing:**
   - Ask a question related to configured FAQs
   - AI should provide FAQ answer

3. **Product Inquiry:**
   - Ask: "What products do you have?"
   - AI should list configured products

---

#### D. Appointment Booking (Critical Test)

**Prerequisites:**
- Business has availability configured (Mon-Fri 9am-5pm)
- Run `backend/setup_support_availability.py` for Raven Support

**Test Flow:**
1. User: "I want to book an appointment"
2. AI: Shows available time slots as clickable buttons
3. User: Clicks a slot (e.g., "Tuesday 10 February at 15:00")
4. AI: "To complete your booking, please provide your full name and email address."
5. User: Types (on separate lines):
   ```
   John Doe
   john@example.com
   ```
6. AI: "Let me process your booking..."
7. AI: "✅ Appointment confirmed for 2026-02-10 at 15:00. We'll send you a reminder."
8. AI: "Is there anything else I can help you with?"
9. User: "No thanks"
10. AI: "Thank you for contacting [Business]! Feel free to come back if you need help. See you soon! 👋"

**Expected Result:**
- Appointment created in database
- Email notification sent (if Resend configured)
- Appears in dashboard → Appointments

**Edge Cases to Test:**
- Lowercase name: "bambo\nbambo@example.com" ✅ Should work
- Full name: "John Doe\njohn@example.com" ✅ Should work
- With phone: "John Doe, john@example.com, +237673377962" ✅ Should work
- Email only: "john@example.com" (no name) ❌ Should ask for name

---

#### E. Live Conversations Dashboard

**Login as business owner:**

1. Navigate to Dashboard → Live Conversations
2. Should see active conversations in real-time
3. Click "Take Over" button on a conversation
4. Send messages as human agent
5. Click "End Takeover" to return to AI

**Expected Result:**
- Conversations update every 5 seconds (polling)
- Human takeover works
- Messages sent successfully

---

#### F. Appointments Dashboard

**Login as business owner:**

1. Navigate to Dashboard → Appointments
2. View list of appointments
3. Filter by date range
4. Update appointment status (confirm/cancel)
5. Export appointments (if implemented)

**Expected Result:**
- All appointments visible
- Status updates work
- Filters apply correctly

---

#### G. Team Management

**Login as business owner:**

1. Navigate to Dashboard → Team
2. Invite team member (enter email)
3. Set role (owner/admin/agent)
4. Remove team member

**Expected Result:**
- Invitation sent (email if configured)
- Team member appears in list
- Removal works

---

#### H. Analytics

**Login as business owner:**

1. Navigate to Dashboard → Analytics
2. View conversation metrics
3. Check appointment statistics
4. Filter by date range

**Expected Result:**
- Charts render correctly
- Data accurate
- Filters work

---

#### I. Availability Management

**Login as business owner:**

1. Navigate to Dashboard → Availability
2. Configure weekly schedule:
   - Enable/disable days
   - Set time slots (e.g., 9:00-17:00)
3. Set appointment duration (e.g., 60 minutes)
4. Set buffer time (e.g., 15 minutes)
5. Save configuration

**Expected Result:**
- Schedule saved successfully
- Slots appear in chat widget
- Buffer time respected

---

#### J. Raven Support Widget (Global)

**Test on ALL pages (logged in or out):**

1. Visit any page: dashboard, setup, conversations, etc.
2. Widget should appear in bottom-right corner
3. Click to chat with "Raven Support"
4. Book appointment with support team
5. Ask questions about platform

**Expected Result:**
- Widget available everywhere
- Chat works correctly
- Appointments can be booked

**Admin-Only Check:**
- Login as `bambojude@gmail.com`
- Go to Dashboard → Businesses
- ✅ Should see "Raven Support" system business
- Login as regular user
- Go to Dashboard → Businesses
- ❌ Should NOT see "Raven Support" (only widget available)

---

## 6. Known Limitations & Workarounds

### Email Notifications
- **Issue**: Resend is in sandbox mode
- **Limitation**: Can only send to verified email: `jude.afanyu@gmail.com`
- **Workaround**: Use this email for testing, or verify domain in Resend dashboard
- **Production Fix**: Verify domain before go-live

### SMS Notifications
- **Issue**: Twilio trial account
- **Limitation**: Can only send to verified phone numbers
- **Workaround**: Verify test phone numbers in Twilio console
- **Production Fix**: Upgrade Twilio account

### Real-Time Updates
- **Issue**: No WebSocket/SSE
- **Current**: Live conversations poll every 5 seconds
- **Impact**: Slight delay in message updates
- **Future**: Implement WebSocket for instant updates

### WhatsApp Integration
- **Status**: Implemented but requires WhatsApp Business API approval
- **Testing**: Use test phone numbers provided by Meta

---

## 7. Troubleshooting

### Backend Won't Start
```bash
# Check Python version (need 3.9+)
python --version

# Reinstall dependencies
cd backend
pip install -r requirements.txt

# Check environment variables
cat .env
```

### Frontend Won't Start
```bash
# Check Node version (need 18+)
node --version

# Reinstall dependencies
cd frontend
rm -rf node_modules package-lock.json
npm install

# Check environment variables
cat .env.local
```

### Widget Not Showing
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_API_URL` in frontend `.env.local`
3. Check network tab: `raven-widget.js` should load from `/static/`
4. Verify RavenWidget component in `frontend/src/app/layout.tsx`

### Appointments Not Creating
1. ✅ Verify migration 007 was applied (check Supabase SQL Editor)
2. Check browser console for errors
3. Check backend logs for extraction failures
4. Verify availability schedule exists for business

### Email/SMS Not Sending
1. Check Resend API key in `.env`
2. Verify recipient email is `jude.afanyu@gmail.com` (sandbox limitation)
3. Check Twilio credentials
4. Check notification_log table in database for errors

---

## 8. Success Criteria

### Before Declaring "Test Ready":
- [ ] Both servers start without errors
- [ ] User can sign up and login
- [ ] User can create a business
- [ ] Chat widget appears and responds
- [ ] Appointment booking completes end-to-end
- [ ] Admin sees system business, regular users don't
- [ ] Conversation closing works correctly
- [ ] Dashboard pages load without errors

### After Remote Testing:
- [ ] All critical bugs identified and logged
- [ ] Performance issues documented
- [ ] UX improvements noted
- [ ] Security concerns addressed
- [ ] Production deployment plan created

---

## 9. Files Created for Testing

### Documentation:
- ✅ `SYSTEM_BUSINESS_FIX.md` - System business visibility fix
- ✅ `CONVERSATION_CLOSING.md` - Conversation closing feature
- ✅ `APPOINTMENT_FIX.md` - Appointment name extraction fix
- ✅ `REMOTE_TESTING_PREP.md` - This file

### Scripts:
- ✅ `backend/setup_support_business.py` - Create Raven Support business
- ✅ `backend/setup_support_availability.py` - Configure appointment slots
- ✅ `backend/run_migration_007.py` - Apply appointment field fix

### Migrations:
- ✅ `supabase/migrations/007_fix_appointment_fields.sql` - Email/phone requirements fix

---

## 10. Contact & Support

**Platform Admin:**
- Name: Jude Bambo Afanyu
- Email: bambojude@gmail.com / jude.afanyu@gmail.com
- Role: Full platform access, can troubleshoot issues

**For Testing Support:**
- Check backend logs: `backend/nohup.out` (if running with nohup)
- Check frontend logs: Browser console + terminal
- Database access: Supabase dashboard
- API testing: `http://localhost:8000/docs` (Swagger UI)

---

## 🚀 Quick Start Commands

```bash
# Start everything (from project root)
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend && npm run dev

# Access:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

---

**Ready for testing!** 🎉

Share this document with your remote testing team and provide them with:
1. Access to test accounts
2. Backend/Frontend URLs (or local setup instructions)
3. This testing guide
4. A bug reporting template/tool (Jira, GitHub Issues, etc.)
