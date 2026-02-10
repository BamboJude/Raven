# Email & SMS Notifications - Implementation Plan

## Overview
Add email and SMS notifications to keep customers informed about their appointments and reduce no-shows.

## Architecture

### Services Used
1. **Email**: [Resend](https://resend.com) - Modern email API
   - Free tier: 3,000 emails/month
   - Simple API, great deliverability
   - Template support

2. **SMS**: [Twilio](https://www.twilio.com) - Industry standard
   - Pay-as-you-go pricing (~$0.0075/SMS in US)
   - Global coverage
   - Reliable delivery

### Notification Types

#### Immediate Notifications (Real-time)
1. **Appointment Confirmation** - Sent when appointment is created
   - Email: Full details with calendar invite
   - SMS: Brief confirmation with date/time

2. **Appointment Cancelled** - Sent when status changes to cancelled
   - Email: Cancellation notice
   - SMS: Brief cancellation message

3. **Appointment Updated** - Sent when details change
   - Email: Updated details
   - SMS: Brief update notice

#### Scheduled Notifications (Background jobs)
4. **24-Hour Reminder** - Sent 24 hours before appointment
   - Email: Reminder with details
   - SMS: Brief reminder

5. **1-Hour Reminder** - Sent 1 hour before appointment
   - SMS only: Last-minute reminder

## Database Schema

### New Table: `notification_settings`
```sql
CREATE TABLE notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  -- Email settings
  email_enabled BOOLEAN DEFAULT true,
  email_from_name TEXT,
  email_from_address TEXT,

  -- SMS settings
  sms_enabled BOOLEAN DEFAULT false,
  twilio_phone_number TEXT,

  -- Notification preferences
  send_confirmation BOOLEAN DEFAULT true,
  send_reminder_24h BOOLEAN DEFAULT true,
  send_reminder_1h BOOLEAN DEFAULT true,
  send_cancellation BOOLEAN DEFAULT true,
  send_update BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(business_id)
);
```

### New Table: `notification_log`
```sql
CREATE TABLE notification_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,

  type TEXT NOT NULL, -- 'confirmation', 'reminder_24h', 'reminder_1h', 'cancellation', 'update'
  channel TEXT NOT NULL, -- 'email', 'sms'

  recipient TEXT NOT NULL, -- email or phone
  status TEXT NOT NULL, -- 'sent', 'failed', 'pending'
  error_message TEXT,

  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_notification_appointment (appointment_id),
  INDEX idx_notification_created (created_at)
);
```

## Backend Implementation

### File Structure
```
backend/app/
├── services/
│   ├── email.py          # Resend email service
│   ├── sms.py            # Twilio SMS service
│   └── notifications.py  # Main notification orchestrator
├── api/
│   └── notifications.py  # Notification settings API
└── jobs/
    └── reminder_scheduler.py  # Background job for reminders
```

### Environment Variables
```env
# Email (Resend)
RESEND_API_KEY=re_xxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1234567890

# Feature flags
ENABLE_EMAIL_NOTIFICATIONS=true
ENABLE_SMS_NOTIFICATIONS=true
```

### Dependencies
```
resend>=0.7.0
twilio>=8.10.0
jinja2>=3.1.0  # For email templates
```

## Notification Templates

### Email Templates (HTML + Text)
1. **Confirmation Email**
   - Subject: "Appointment Confirmed - {business_name}"
   - Body: Details + Add to Calendar button

2. **Reminder Email (24h)**
   - Subject: "Reminder: Appointment Tomorrow"
   - Body: Details + Cancel/Reschedule links

3. **Cancellation Email**
   - Subject: "Appointment Cancelled"
   - Body: Cancellation notice + Rebook link

### SMS Templates (160 chars max)
1. **Confirmation SMS**
   ```
   {business_name}: Appointment confirmed for {date} at {time}. Reply CANCEL to cancel.
   ```

2. **Reminder SMS (24h)**
   ```
   Reminder: Appointment tomorrow at {time} with {business_name}. Reply CANCEL to cancel.
   ```

3. **Reminder SMS (1h)**
   ```
   Reminder: Appointment in 1 hour at {time} with {business_name}.
   ```

## Frontend Implementation

### New Page: `/dashboard/notifications`
- Toggle email/SMS notifications
- Configure sender details
- Set which notifications to send
- Preview templates
- View notification history

### Dashboard Integration
- Add "Notifications" link to business card
- Add quick access card for notifications
- Show notification status on appointments page

## Implementation Steps

### Phase 1: Email Notifications (Immediate)
1. ✅ Create database migration
2. ✅ Install Resend SDK
3. ✅ Create email service
4. ✅ Create email templates
5. ✅ Add notification triggers
6. ✅ Create settings API
7. ✅ Build settings page
8. ✅ Test email delivery

### Phase 2: SMS Notifications
1. Install Twilio SDK
2. Create SMS service
3. Add SMS templates
4. Add SMS triggers
5. Update settings page
6. Test SMS delivery

### Phase 3: Background Reminders
1. Install APScheduler or similar
2. Create reminder job
3. Schedule 24h reminders
4. Schedule 1h reminders
5. Add job monitoring

### Phase 4: Polish
1. Notification history view
2. Template customization
3. Testing dashboard
4. Analytics/metrics
5. Error handling & retries

## Testing Strategy

### Email Testing
- Use Resend test mode
- Test with real email addresses
- Verify deliverability
- Check spam score

### SMS Testing
- Use Twilio test credentials
- Test with real phone numbers
- Verify international delivery
- Check message formatting

### Integration Testing
- Test all notification triggers
- Test with/without settings
- Test error scenarios
- Test rate limiting

## Cost Estimation

### Email (Resend)
- Free: 3,000 emails/month
- Paid: $20/month for 50,000 emails
- Per business: ~30-60 emails/month

### SMS (Twilio)
- US: ~$0.0075/SMS
- International: $0.05-$0.30/SMS
- Per business: ~30-60 SMS/month
- Monthly: $0.45-$18/business

### Total Monthly Cost (100 businesses)
- Email: Free (within limits)
- SMS: $45-$1,800/month
- Average: ~$500/month

## Security & Privacy

1. **Data Protection**
   - Store only hashed/encrypted API keys
   - Log minimal PII
   - Auto-delete logs after 30 days

2. **Opt-out/Compliance**
   - GDPR-compliant unsubscribe
   - CAN-SPAM compliance
   - TCPA compliance for SMS
   - Easy opt-out in settings

3. **Rate Limiting**
   - Max 5 notifications per appointment
   - Max 100 notifications per business/day
   - Exponential backoff for retries

## Future Enhancements

1. **Advanced Features**
   - WhatsApp notifications
   - Push notifications
   - Voice calls for reminders
   - Multi-language templates

2. **Customization**
   - Custom email templates
   - Custom SMS templates
   - Brand colors in emails
   - Custom sender domain

3. **Analytics**
   - Delivery rates
   - Open rates (email)
   - Click rates
   - No-show correlation

4. **Automation**
   - Auto-reschedule on cancellation
   - Smart reminder timing
   - Follow-up after appointment
   - Review requests

---

## Quick Start (Development)

1. **Get API Keys**
   ```bash
   # Resend: https://resend.com/api-keys
   # Twilio: https://console.twilio.com/
   ```

2. **Set Environment Variables**
   ```bash
   export RESEND_API_KEY="re_xxx"
   export TWILIO_ACCOUNT_SID="ACxxx"
   export TWILIO_AUTH_TOKEN="xxx"
   ```

3. **Install Dependencies**
   ```bash
   cd backend
   pip install resend twilio jinja2
   ```

4. **Run Migration**
   ```bash
   # Apply notification tables migration
   ```

5. **Test**
   ```bash
   python -m app.services.email test
   python -m app.services.sms test
   ```

---

## Success Metrics

- ✅ 95%+ email delivery rate
- ✅ 98%+ SMS delivery rate
- ✅ < 2% unsubscribe rate
- ✅ 20% reduction in no-shows
- ✅ < 500ms notification send time
- ✅ 100% notification uptime

Ready to implement! 🚀
