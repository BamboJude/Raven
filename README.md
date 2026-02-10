# Raven Support - AI Chatbot Platform

Raven Support is an AI-powered chatbot platform designed for businesses in Cameroon and francophone Africa. It enables business owners to embed an intelligent chat widget on their website, providing 24/7 customer support powered by AI.

## 🌟 Features

- **AI-Powered Chat**: Intelligent conversations using Groq's Llama 3 model
- **Appointment Booking**: Automated appointment scheduling with calendar integration
- **Multi-Language Support**: French and English with automatic language detection
- **Image Upload & Vision**: Support for image uploads with AI vision analysis (Llama 4 Scout)
- **Live Agent Handoff**: Seamless transition from AI to human agents
- **WhatsApp Integration**: Connect customer conversations via WhatsApp
- **Business Dashboard**: Manage conversations, appointments, and analytics
- **Team Management**: Invite team members with role-based access
- **Email & SMS Notifications**: Automated reminders and confirmations
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **Easy Widget Integration**: Simple JavaScript snippet to embed on any website

## 🏗️ Architecture

### Tech Stack

- **Backend**: FastAPI (Python 3.10+)
- **Frontend**: Next.js 14 + TypeScript
- **Widget**: TypeScript + Vite (standalone bundle)
- **Database**: Supabase (PostgreSQL)
- **AI**: Groq API (Llama 3.3 70B + Llama 4 Scout for vision)
- **Notifications**: Resend (Email), Twilio (SMS/WhatsApp)
- **Deployment**: Railway (Backend), Vercel (Frontend)

### Project Structure

```
raven/
├── backend/               # FastAPI backend
│   ├── app/
│   │   ├── api/          # API route modules
│   │   ├── services/     # Business logic (AI, database, notifications)
│   │   ├── models/       # Pydantic schemas
│   │   ├── main.py       # FastAPI application
│   │   └── config.py     # Environment configuration
│   ├── migrations/       # Database migrations
│   └── uploads/          # User-uploaded files
├── frontend/             # Next.js dashboard
│   └── src/
│       ├── app/          # Next.js app directory
│       ├── components/   # React components
│       └── lib/          # API client, utilities
├── widget/               # Embeddable chat widget
│   ├── src/
│   │   ├── index.ts      # Widget UI and DOM manipulation
│   │   ├── chat.ts       # API communication
│   │   └── styles.ts     # Widget CSS
│   └── dist/             # Built widget bundle
└── supabase/
    └── migrations/       # Supabase database migrations
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase account
- Groq API key (free tier available)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   Create a `.env` file in the `backend` directory:
   ```env
   # Database
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_service_role_key

   # AI
   GROQ_API_KEY=your_groq_api_key

   # Notifications
   RESEND_API_KEY=your_resend_api_key
   RESEND_FROM_EMAIL=noreply@yourdomain.com

   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

   # Optional
   DEBUG=true
   ```

3. **Run the backend:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment variables:**
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. **Run the frontend:**
   ```bash
   npm run dev
   ```

   The dashboard will be available at `http://localhost:3000`

### Widget Setup

1. **Install dependencies:**
   ```bash
   cd widget
   npm install
   ```

2. **Build the widget:**
   ```bash
   npm run build
   ```

3. **Copy to backend static directory:**
   ```bash
   mkdir -p ../backend/static
   cp dist/raven-widget.js ../backend/static/
   ```

4. **Embed on your website:**
   ```html
   <script>
     window.RAVEN_CONFIG = {
       businessId: 'YOUR_BUSINESS_ID',
       apiUrl: 'https://your-backend-url.com'
     };
   </script>
   <script src="https://your-backend-url.com/static/raven-widget.js"></script>
   ```

## 📚 Key Features Explained

### Appointment Booking

The AI automatically detects appointment booking intent and guides users through the process:

1. **Intent Detection**: Recognizes booking requests in both French and English
2. **Slot Selection**: Presents available time slots as clickable buttons
3. **Information Collection**: Gathers customer name and email
4. **Automatic Creation**: Creates appointment when all required info is provided
5. **Notifications**: Sends email confirmation and reminders (24h and 1h before)

### Human Takeover

Business owners can take over conversations from the AI:

1. Navigate to the Live Conversations dashboard
2. Click "Take Over" on any active conversation
3. Send messages directly to the customer
4. AI is paused while in takeover mode
5. Click "Return to AI" to hand back to the bot

### Multi-Language Support

- **Auto-Detection**: Automatically detects user's browser language
- **Business Language**: Set primary language per business
- **Widget Customization**: Choose auto, French, or English for welcome message
- **Bilingual Intent**: AI recognizes appointment requests in both languages

## 🔧 Configuration

### Business Settings

Configure your business through the dashboard at `/dashboard/setup`:

- Business name and description
- Welcome messages (French & English)
- FAQs (Frequently Asked Questions)
- Products/Services catalog
- Custom AI instructions
- Widget appearance (color, position)
- Business hours and availability
- Away messages

### Widget Customization

```javascript
window.RAVEN_CONFIG = {
  businessId: 'your-business-id',
  apiUrl: 'https://your-api-url.com',
  // Optional customizations are set via dashboard
};
```

## 📊 Database Schema

Key tables:

- **businesses**: Business accounts
- **business_configs**: Business settings and AI configuration
- **conversations**: Customer conversation sessions
- **messages**: Individual chat messages (with media support)
- **appointments**: Scheduled appointments
- **business_availability**: Weekly schedule for bookings
- **team_members**: Team access and roles
- **notification_settings**: Notification preferences
- **notification_log**: Notification history

## 🚢 Deployment

### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Railway will automatically detect `railway.json` and deploy
4. Widget will be served from `/static/raven-widget.js`

Production URL: `https://raven-production-980b.up.railway.app`

### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set root directory to `frontend`
3. Add environment variables
4. Deploy

### Widget Build & Deploy

After making widget changes:

```bash
cd widget
npm run build
cp dist/raven-widget.js ../backend/static/
git add ../backend/static/raven-widget.js
git commit -m "Update widget"
git push  # Railway will auto-deploy
```

## 🔒 Security

- **Supabase RLS**: Row-level security policies (backend uses service_role key)
- **User Authentication**: Supabase Auth for dashboard access
- **CORS**: Configured to allow widget embedding on any domain
- **Input Validation**: Pydantic models validate all API inputs
- **No Credentials in Widget**: Widget uses public business IDs only

## 📈 Scalability & Costs

### Current Capacity (Free Tier)

- **Groq**: 30 requests/minute (plenty for most SMBs)
- **Supabase**: 500MB database, 2GB bandwidth/month
- **Railway**: 500 hours/month ($5 credit)
- **Vercel**: 100GB bandwidth/month

### Estimated Cost at Scale

For 1,000 chats/month:
- Groq: Free (within limits)
- Supabase: $25/month (beyond free tier)
- Railway: $10-15/month
- Total: ~$40/month

## 🤝 Contributing

This is a production project for businesses in Cameroon. Key development practices:

1. **Test Locally**: Always test changes with both frontend and widget
2. **Database Migrations**: Use numbered migrations in both `supabase/migrations` and `backend/migrations`
3. **Code Quality**: Remove debug prints before committing
4. **Documentation**: Update README and inline comments for complex logic

## 📝 License

Proprietary - All rights reserved

## 🐛 Known Issues & Limitations

- **Email Sandbox**: Resend is in sandbox mode (only sends to verified owner email). Need domain verification for production.
- **No Real-time Push**: Live conversations dashboard polls every 5 seconds (no WebSocket/SSE yet)
- **Mobile Money**: Payment integration planned for Phase 3
- **Migration Files**: Split between `supabase/migrations` and `backend/migrations` (needs consolidation)

## 📞 Support

For issues or questions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/raven/issues)
- Email: jude.afanyu@gmail.com

## 🎯 Roadmap

### Phase 1: Core Platform ✅
- [x] AI chat widget
- [x] Appointment booking
- [x] Business dashboard
- [x] Team management
- [x] Notifications

### Phase 2: Enhancement 🚧
- [ ] Real-time updates (WebSocket/SSE)
- [ ] Advanced analytics
- [ ] Lead capture forms
- [ ] Email domain verification

### Phase 3: Monetization 💰
- [ ] Mobile Money integration (MTN, Orange Money)
- [ ] Subscription billing
- [ ] Premium features
- [ ] Multi-business accounts

---

**Built with ❤️ for African businesses**
