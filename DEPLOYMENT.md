# Raven Production Deployment Guide

## Current Deployment Status

### Backend (Railway)
- **Status**: ✅ Deployed
- **URL**: `https://raven-production-980b.up.railway.app`
- **Port**: 8000
- **Health Check**: Visit `/` or `/docs` to verify

### Frontend (Next.js)
- **Status**: ⏳ Needs Deployment
- **Environment**: Updated to use production API
- **Next Step**: Deploy to Vercel/Netlify/Railway

## What's Been Configured

### ✅ Backend Changes
1. **CORS**: Updated to allow all origins (required for widget embeds)
2. **Environment**: Production URL documented in `.env`
3. **Railway Config**: Properly configured with `railway.json` and `Procfile`

### ✅ Frontend Changes
1. **API URL**: Updated `.env.local` to point to Railway backend:
   ```
   NEXT_PUBLIC_API_URL=https://raven-production-980b.up.railway.app
   ```

### ✅ Widget
1. **Example Created**: See `widget-example-production.html`
2. **Configuration**: Ready to use with production API URL

## Next Steps

### 1. Deploy Frontend to Production

Choose one of these platforms:

#### Option A: Vercel (Recommended for Next.js)
```bash
cd frontend
npx vercel
```

Follow prompts and add environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL=https://raven-production-980b.up.railway.app`

#### Option B: Railway
```bash
cd frontend
railway init
railway up
```

Add the same environment variables in Railway dashboard.

### 2. Build and Deploy Widget

The widget needs to be accessible at `/static/raven-widget.js` on your backend:

```bash
# Build the widget
cd widget
npm run build

# Copy to backend static directory
mkdir -p ../backend/static
cp dist/raven-widget.js ../backend/static/

# Commit and push to Railway
git add ../backend/static/raven-widget.js
git commit -m "Add built widget for production"
git push
```

Railway will automatically redeploy the backend with the widget.

### 3. Verify Deployment

1. **Backend Health Check**:
   ```bash
   curl https://raven-production-980b.up.railway.app/
   ```

2. **Widget Availability**:
   ```bash
   curl https://raven-production-980b.up.railway.app/static/raven-widget.js
   ```

3. **Frontend** (after deployment):
   Visit your Vercel URL and test:
   - Login/signup
   - Dashboard access
   - Widget settings page

### 4. Test Widget on Real Site

Get a business ID from your dashboard, then add to any website:

```html
<script>
  window.RAVEN_CONFIG = {
    businessId: 'YOUR_BUSINESS_ID',
    apiUrl: 'https://raven-production-980b.up.railway.app'
  };
</script>
<script src="https://raven-production-980b.up.railway.app/static/raven-widget.js"></script>
```

## Environment Variables Checklist

### Backend (Railway)
Make sure these are set in Railway dashboard:
- [x] `SUPABASE_URL`
- [x] `SUPABASE_KEY`
- [x] `GROQ_API_KEY`
- [x] `RESEND_API_KEY`
- [x] `RESEND_FROM_EMAIL`
- [x] `TWILIO_ACCOUNT_SID`
- [x] `TWILIO_AUTH_TOKEN`
- [x] `TWILIO_WHATSAPP_NUMBER`
- [ ] `DEBUG=false` (set to false for production)
- [ ] `PORT=8000` (Railway sets this automatically)

### Frontend (Vercel/Railway)
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `NEXT_PUBLIC_API_URL=https://raven-production-980b.up.railway.app`

## Production Considerations

### Security
1. **Set DEBUG=false** in production backend
2. **Enable HTTPS only** (Railway does this automatically)
3. **Verify Supabase RLS** policies are correct
4. **Resend Email**: Verify domain to send to all users (currently in sandbox mode)

### Performance
1. **Database Indexes**: Ensure Supabase tables have proper indexes
2. **Caching**: Consider adding Redis for session storage (future)
3. **CDN**: Use CDN for widget distribution (future)

### Monitoring
1. **Railway Logs**: Monitor backend logs in Railway dashboard
2. **Supabase Logs**: Check database query performance
3. **Error Tracking**: Consider adding Sentry (future)

## Troubleshooting

### Backend not accessible
- Check Railway deployment logs
- Verify PORT environment variable
- Check if service is running: Railway dashboard → Deployments

### CORS errors
- Backend is configured to allow all origins
- If issues persist, check browser console for specific error

### Widget not loading
1. Verify widget is at `/static/raven-widget.js`
2. Check browser network tab for 404 errors
3. Ensure `RAVEN_CONFIG` is set before loading script

### Database connection issues
- Verify `SUPABASE_URL` and `SUPABASE_KEY` in Railway
- Check Supabase dashboard for service status
- Verify network connectivity from Railway to Supabase

## URLs Reference

- **Backend API**: https://raven-production-980b.up.railway.app
- **API Docs**: https://raven-production-980b.up.railway.app/docs (if DEBUG=true)
- **Widget Script**: https://raven-production-980b.up.railway.app/static/raven-widget.js
- **Frontend**: (Deploy to get URL)

## Support

For issues:
1. Check Railway deployment logs
2. Verify all environment variables are set
3. Test endpoints individually using curl/Postman
4. Check Supabase connection and data
