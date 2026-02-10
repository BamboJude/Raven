# Raven → Raven Support Rebranding Summary

## Date: February 10, 2026

## Changes Made

### 1. Backend Updates ✅
- **config.py**: Changed `app_name` from "Raven" to "Raven Support"
- **main.py**: Updated API title and description
  - `title="Raven Support API"`
  - Documentation updated
  - Root endpoint returns "Raven Support API"
- **Email Templates**: Updated all email footers (5 templates)
  - confirmation.html
  - reminder.html
  - update.html
  - cancellation.html
  - transcript.html
  - Changed "Cet email a été envoyé via Raven" → "...via Raven Support"
  - Changed "This email was sent via Raven" → "...via Raven Support"

### 2. Frontend Updates ✅
- **layout.tsx**: Updated metadata title and description
- **page.tsx** (Landing):
  - Header logo text
  - Footer text
  - Copyright notice
- **dashboard/page.tsx**: Updated dashboard header
- **i18n.ts**: Updated translations
  - French: "Pourquoi choisir Raven Support?"
  - English: "Why Choose Raven Support?"
  - Subtitle descriptions updated

### 3. Widget Integration ✅
Created new **RavenWidget.tsx** component:
- Loads widget script globally
- Added to root layout.tsx
- Now appears on ALL pages (landing, dashboard, auth, etc.)
- Uses demo business ID: `72faa6e6-c4cf-4cb1-8108-780424d23b65`

### 4. Static Files ✅
- Widget file copied to `backend/static/raven-widget.js`
- Available at: `http://localhost:8000/static/raven-widget.js`

## Testing

### Verified Working:
- ✅ Backend API returns "Raven Support API"
- ✅ Frontend shows "Raven Support" branding
- ✅ Widget script loads on all pages
- ✅ Dashboard header updated
- ✅ Landing page updated
- ✅ Email templates updated

## Next Steps (If Needed)

1. **Create Dedicated Support Business**
   - Currently using demo business ID
   - Create a real "Raven Support" business in the database
   - Update SUPPORT_BUSINESS_ID in RavenWidget.tsx

2. **Configure Welcome Message**
   - Set up FAQs for Raven Support
   - Add product/service information
   - Customize welcome message

3. **Production Considerations**
   - Update domain in email templates if needed
   - Verify Resend email sender domain
   - Test widget on production domain

## Files Modified

### Backend (8 files)
- app/config.py
- app/main.py
- app/templates/emails/confirmation.html
- app/templates/emails/reminder.html
- app/templates/emails/update.html
- app/templates/emails/cancellation.html
- app/templates/emails/transcript.html
- static/raven-widget.js

### Frontend (5 files)
- src/app/layout.tsx
- src/app/page.tsx
- src/app/dashboard/page.tsx
- src/lib/i18n.ts
- src/components/RavenWidget.tsx (NEW)

---

**All changes committed and tested successfully!**
