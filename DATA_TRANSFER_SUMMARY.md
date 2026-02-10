# Data Transfer Summary - Raven → Raven Support

## Date: February 10, 2026

## Transfer Completed Successfully ✅

### Source
- **Business Name**: Raven
- **Business ID**: `56edfb60-17eb-45fc-9943-98b56e44b048`

### Destination
- **Business Name**: Raven Support
- **Business ID**: `f2939e5f-9367-4110-9113-60748fc2cddb`

## What Was Transferred

### 1. Basic Configuration
- ✅ Welcome messages (French & English)
- ✅ Widget settings (position, color, language)
- ✅ Lead capture configuration
- ✅ Away mode settings

### 2. Content (Enhanced with Support-Specific Data)
The original Raven business had test data, so we upgraded Raven Support with comprehensive support content:

**FAQs**: 14 bilingual questions covering:
- What is Raven Support? (FR/EN)
- Pricing information (FR/EN)
- Getting started guide (FR/EN)
- Language support (FR/EN)
- WhatsApp integration (FR/EN)
- Free trial info (FR/EN)
- Contact/help information (FR/EN)

**Products**: 4 product listings:
- Plan Basic (FR/EN)
- Basic Plan
- Plan Professional (FR/EN)
- Professional Plan

**Custom Instructions**: AI behavior guidelines in French and English

## Current Raven Support Configuration

### Welcome Messages
- **French**: 👋 Bienvenue sur Raven Support ! Comment puis-je vous aider aujourd'hui ?
- **English**: 👋 Welcome to Raven Support! How can I help you today?

### Widget Settings
- **Position**: Bottom-right
- **Primary Color**: #0ea5e9 (Raven blue)
- **Language Detection**: Automatic

### Features Enabled
- ✅ Bilingual support (French/English)
- ✅ 14 comprehensive FAQs
- ✅ 4 product listings
- ✅ Custom AI instructions
- ✅ Lead capture (currently disabled)
- ✅ Away mode configured

## Widget Integration

The Raven Support widget is now live on all pages:

### Business ID
```
f2939e5f-9367-4110-9113-60748fc2cddb
```

### Widget Implementation
- **Frontend**: Added to root layout (`src/app/layout.tsx`)
- **Component**: `src/components/RavenWidget.tsx`
- **Availability**: All pages (landing, dashboard, auth, setup, etc.)

### API Endpoint
```
http://localhost:8000/api/chat/business/f2939e5f-9367-4110-9113-60748fc2cddb/public
```

## Scripts Created

1. **transfer_to_support.py**: Transfers data from any business to Raven Support
2. **update_support_content.py**: Updates Raven Support with comprehensive support FAQs and products
3. **setup_support_business.py**: Creates the Raven Support business (already exists)

## Testing

### Test the Widget
1. Visit http://localhost:3000
2. Look for chat widget in bottom-right corner
3. Click to open
4. Try asking in French or English

### Test Standalone
Open [test-widget.html](file:///Users/bambojude/Desktop/Raven/test-widget.html) in browser

## Next Steps (Optional)

1. **Customize Content**
   - Add more FAQs specific to your use case
   - Update product pricing if needed
   - Adjust custom instructions for AI behavior

2. **Widget Customization**
   - Change primary color in widget_settings
   - Enable lead capture if desired
   - Configure away mode schedule

3. **Production Deployment**
   - Update SUPPORT_BUSINESS_ID in production build
   - Verify business exists in production database
   - Test widget on production domain

---

**All data successfully transferred and enhanced! The Raven Support widget is now providing comprehensive bilingual support on all pages.** 🎉
