# Appointment Booking - Testing Guide

## What Was Completed

### 1. Availability Settings Page ✅
- **Location**: `/dashboard/availability?id={business_id}`
- **Features**:
  - Configure weekly schedule (enable/disable days)
  - Add multiple time slots per day (e.g., 9-12, 14-17 for lunch breaks)
  - Set default appointment duration (15-480 minutes)
  - Set buffer time between appointments (0-120 minutes)
  - Full bilingual support (French/English)

### 2. Dashboard Integration ✅
- Added "Availability" / "Disponibilités" link in business cards
- Added availability quick access card in dashboard
- Link: `/dashboard/availability?id={business_id}`

### 3. Chat API Appointment Auto-Creation ✅
- **Location**: `backend/app/api/chat.py`
- **Features**:
  - Detects appointment booking intent in customer messages
  - Extracts customer information automatically:
    - Name (from "my name is X", "je m'appelle X")
    - Phone number (any format with 8+ digits)
    - Email (optional)
    - Date (today, tomorrow, DD/MM/YYYY, YYYY-MM-DD)
    - Time (14h30, 14:30, 2pm, etc.)
  - Creates appointment automatically when all required info is collected
  - Sends confirmation message to customer

### 4. Enhanced AI Service ✅
- **Location**: `backend/app/services/ai.py`
- **Features**:
  - AI knows when business has appointments enabled
  - Provides appointment booking instructions in system prompt
  - Intelligent appointment info extraction from natural conversation
  - Supports both French and English date/time formats

---

## End-to-End Testing Steps

### Step 1: Set Up Availability
1. Go to dashboard at `http://localhost:3000/dashboard`
2. Click on a business card
3. Click "Availability" or "Disponibilités" link
4. Configure your weekly schedule:
   - Enable days you want to accept appointments
   - Set time slots (e.g., Monday 9:00-17:00)
   - Set default duration (e.g., 60 minutes)
   - Set buffer time (e.g., 15 minutes)
5. Click "Save" / "Enregistrer"

### Step 2: Test Chat Widget Appointment Booking
1. Open your website with the chat widget embedded
2. Start a conversation with the chatbot
3. Test appointment booking conversation (French example):
   ```
   Customer: Bonjour, je voudrais prendre un rendez-vous
   Bot: [asks for information]
   Customer: Je m'appelle Jean Dupont
   Customer: Mon numéro est 0612345678
   Customer: Pour demain à 14h30
   ```
4. The bot should automatically:
   - Collect all the information
   - Create the appointment
   - Send confirmation: "✅ Rendez-vous confirmé pour le 2026-02-03 à 14:30..."

### Step 3: Verify Appointment Created
1. Go back to dashboard
2. Click "Appointments" / "Rendez-vous" link
3. You should see the new appointment with:
   - Customer name: Jean Dupont
   - Phone: 0612345678
   - Date: 2026-02-03
   - Time: 14:30
   - Status: Pending

### Step 4: Manage Appointment
1. Click "Modifier" button on the appointment
2. Change status to "Confirmed" / "Confirmé"
3. The appointment status should update
4. Test filtering by status (All, Pending, Confirmed, Completed)

### Step 5: Test English Language
Repeat steps 2-4 with English conversation:
```
Customer: Hello, I'd like to book an appointment
Bot: [asks for information]
Customer: My name is John Smith
Customer: 555-123-4567
Customer: Tomorrow at 2pm
```

---

## Appointment Info Extraction Patterns

### Name Patterns (Auto-detected)
- French: "je m'appelle Jean", "mon nom est Jean", "c'est Jean Dupont"
- English: "my name is John", "I'm John Smith", "this is John"
- Capitalized names at message start: "Jean Dupont 0612..."

### Date Patterns (Auto-detected)
- Relative: "aujourd'hui", "today", "demain", "tomorrow"
- Formats: "2026-02-03", "03/02/2026", "03-02-2026"

### Time Patterns (Auto-detected)
- Formats: "14h30", "14:30", "2pm", "14h", "2 pm"
- Converts 12-hour to 24-hour automatically

### Phone Patterns (Auto-detected)
- Any sequence with 8+ digits
- Examples: "0612345678", "+33612345678", "555-123-4567"

### Email Patterns (Auto-detected)
- Standard email format: "user@example.com"

---

## API Endpoints Reference

### Public Endpoints (No Auth)
- `POST /api/appointments/public/create` - Create appointment from widget
- `GET /api/appointments/public/availability/{business_id}` - Get business availability
- `GET /api/appointments/public/slots/{business_id}` - Get available time slots
- `GET /api/appointments/public/customer/{business_id}/{phone}` - Lookup appointments by phone

### Protected Endpoints (Require Auth)
- `GET /api/appointments/{business_id}` - List all appointments
- `GET /api/appointments/detail/{appointment_id}` - Get single appointment
- `PATCH /api/appointments/{appointment_id}` - Update appointment (status, etc.)
- `DELETE /api/appointments/{appointment_id}` - Delete appointment
- `PUT /api/appointments/availability/{business_id}` - Update business availability

---

## Troubleshooting

### Appointment Not Created Automatically
- **Check**: Business has availability configured (Step 1)
- **Check**: All required info provided (name, phone, date, time)
- **Check**: Backend logs for errors: `Failed to create appointment: {error}`

### Can't Access Availability Page
- **Check**: URL includes `?id={business_id}` parameter
- **Check**: You're logged in to dashboard
- **Check**: Business belongs to your account

### Date/Time Not Extracted
- **Check**: Using supported date/time formats (see patterns above)
- **Try**: More explicit format like "2026-02-03 at 14:30"
- **Note**: AI extraction is best-effort, may not catch all formats

### Appointment Status Not Updating
- **Check**: You're using the "Modifier" button in appointments page
- **Check**: Backend API is running
- **Check**: Network tab for API errors

---

## What Customers See

When a customer books an appointment through the chat widget:

1. **Before appointment created**:
   - Bot asks for: name, phone, email (optional), date, time
   - Bot is helpful and guides them through the process

2. **After appointment created**:
   - Bot confirms: "✅ Rendez-vous confirmé pour le {date} à {time}"
   - Customer receives confirmation with appointment details

3. **Appointment appears in dashboard**:
   - Business owner can see it in Appointments page
   - Status starts as "Pending"
   - Owner can confirm, cancel, or mark complete

---

## Next Steps (Optional Enhancements)

If you want to extend the appointment system further:

1. **Email Notifications**: Send confirmation emails to customers
2. **SMS Reminders**: Send SMS reminders before appointments
3. **Calendar Integration**: Sync with Google Calendar, Outlook
4. **Customer Portal**: Let customers view/cancel their appointments
5. **Recurring Appointments**: Support weekly/monthly recurring bookings
6. **Team Member Assignment**: Assign appointments to specific team members
7. **Payment Integration**: Collect deposits or full payment at booking
8. **Timezone Support**: Handle customers in different timezones

---

## Summary

The appointment booking system is now **fully functional** and includes:

✅ Business owners can set their availability
✅ Customers can book through chat widget
✅ AI automatically extracts booking information
✅ Appointments are created automatically
✅ Business owners can manage appointments in dashboard
✅ Full bilingual support (French/English)
✅ Multiple time slots per day
✅ Buffer time between appointments
✅ Status management (pending, confirmed, cancelled, completed, no_show)

Ready for production use! 🚀
