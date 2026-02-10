# Bug Report Template

Use this template to report bugs found during testing.

---

## Bug #_____

**Reporter**: _______________
**Date**: _______________
**Environment**: ☐ Local  ☐ Production

---

### 📋 Summary
Brief one-line description of the issue:

_______________________________________________

---

### 🔴 Severity
- [ ] **Critical** - System crash, data loss, security issue
- [ ] **Major** - Core feature broken, no workaround
- [ ] **Minor** - Feature broken but workaround exists
- [ ] **Trivial** - UI/UX issue, cosmetic

---

### 📍 Location
Where did the bug occur?

- **Page/Feature**: _______________
- **URL** (if applicable): _______________
- **Component** (if known): _______________

---

### 🔄 Steps to Reproduce

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________
4. _______________________________________________

---

### ❌ Expected Behavior
What should happen?

_______________________________________________
_______________________________________________

---

### ❌ Actual Behavior
What actually happened?

_______________________________________________
_______________________________________________

---

### 📸 Screenshots / Videos
Attach screenshots or screen recordings if available:

- Screenshot 1: _______________
- Screenshot 2: _______________
- Video: _______________

---

### 🖥️ Environment Details

**Browser**: _______________
**OS**: _______________
**Device**: ☐ Desktop  ☐ Mobile  ☐ Tablet
**Screen Size**: _______________

---

### 📝 Additional Notes / Console Errors

Any error messages from browser console or additional context:

```
Paste error messages here
```

_______________________________________________
_______________________________________________

---

### 🔧 Suggested Fix (Optional)
If you have ideas on how to fix this:

_______________________________________________
_______________________________________________

---

### ✅ Verification Checklist
- [ ] Bug is reproducible (happened more than once)
- [ ] Steps to reproduce are clear
- [ ] Screenshots/videos attached (if UI issue)
- [ ] Console errors copied (if applicable)
- [ ] Tested on different browser (if possible)

---

**Status**: ☐ Open  ☐ In Progress  ☐ Fixed  ☐ Won't Fix  ☐ Duplicate

**Assigned To**: _______________

**Fixed Date**: _______________

---

## Example Bug Report

**Bug #1**

**Reporter**: Jane Doe
**Date**: 2026-02-10
**Environment**: ☑ Local  ☐ Production

---

### 📋 Summary
Appointment booking fails when user provides only email (no phone number)

---

### 🔴 Severity
- [x] **Critical** - System crash, data loss, security issue
- [ ] **Major** - Core feature broken, no workaround
- [ ] **Minor** - Feature broken but workaround exists
- [ ] **Trivial** - UI/UX issue, cosmetic

---

### 📍 Location
- **Page/Feature**: Chat Widget - Appointment Booking
- **URL**: http://localhost:3000 (widget on any page)
- **Component**: backend/app/api/chat.py (appointment creation)

---

### 🔄 Steps to Reproduce

1. Open chat widget
2. Type: "I want to book an appointment"
3. Click a time slot button
4. When asked for details, type:
   ```
   John Doe
   john@example.com
   ```
5. AI says "processing booking..."
6. Wait for response

---

### ❌ Expected Behavior
Appointment should be created successfully with name and email. Phone should be optional.

---

### ❌ Actual Behavior
Error occurs (check console). Appointment is NOT created. AI doesn't confirm booking.

---

### 📸 Screenshots / Videos
- Screenshot: Console error showing "customer_phone cannot be null"

---

### 🖥️ Environment Details

**Browser**: Chrome 120
**OS**: macOS 14.0
**Device**: ☑ Desktop  ☐ Mobile  ☐ Tablet
**Screen Size**: 1920x1080

---

### 📝 Additional Notes / Console Errors

Console error:
```
POST http://localhost:8000/api/chat 500 (Internal Server Error)
Error: null value in column "customer_phone" violates not-null constraint
```

---

### 🔧 Suggested Fix (Optional)
Change database schema to make `customer_phone` nullable, since code and AI only ask for email.

---

### ✅ Verification Checklist
- [x] Bug is reproducible (happened more than once)
- [x] Steps to reproduce are clear
- [x] Screenshots/videos attached (if UI issue)
- [x] Console errors copied (if applicable)
- [x] Tested on different browser (if possible)

---

**Status**: ☑ Fixed  ☐ Open  ☐ In Progress  ☐ Won't Fix  ☐ Duplicate

**Assigned To**: Development Team

**Fixed Date**: 2026-02-10 (Migration 007 applied)
