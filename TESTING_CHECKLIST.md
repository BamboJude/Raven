# Raven Support - Testing Checklist

**Tester Name**: _______________
**Date**: _______________
**Environment**: ☐ Local  ☐ Production

---

## 🔐 Authentication & User Management

- [ ] Sign up with new account
- [ ] Verify email (check inbox)
- [ ] Login successfully
- [ ] Logout and login again
- [ ] Access denied when not logged in (dashboard pages)

**Issues Found**: _______________________________________________

---

## 🏢 Business Setup

- [ ] Create new business
- [ ] Add business name, description, contact info
- [ ] Select language (French/English)
- [ ] Save configuration
- [ ] Edit business details
- [ ] Delete business (optional - creates new after)

**Issues Found**: _______________________________________________

---

## ⚙️ Business Configuration

### FAQs
- [ ] Add at least 3 FAQs
- [ ] Edit FAQ
- [ ] Delete FAQ
- [ ] FAQs saved correctly

### Products
- [ ] Add at least 2 products with prices
- [ ] Edit product
- [ ] Delete product
- [ ] Products saved correctly

### Welcome Message
- [ ] Customize welcome message
- [ ] Message appears in chat widget
- [ ] Correct language displayed

**Issues Found**: _______________________________________________

---

## 💬 Chat Widget (Public)

- [ ] Widget appears on homepage
- [ ] Widget appears on dashboard pages
- [ ] Click to open chat
- [ ] Send simple message: "Hello"
- [ ] AI responds in correct language
- [ ] Ask FAQ question - AI provides answer
- [ ] Ask about products - AI lists products
- [ ] Widget can be minimized
- [ ] Widget can be reopened

**Issues Found**: _______________________________________________

---

## 📅 Appointment Booking (CRITICAL)

### Setup
- [ ] Configure availability (Mon-Fri 9am-5pm)
- [ ] Set appointment duration (60 min)
- [ ] Save availability

### Booking Flow
- [ ] User: "I want to book an appointment"
- [ ] AI: Shows time slot buttons
- [ ] Click a time slot button
- [ ] AI: Asks for name and email
- [ ] Provide name on one line, email on next line:
  ```
  Your Name
  your@email.com
  ```
- [ ] AI: "Let me process your booking..."
- [ ] AI: "✅ Appointment confirmed..."
- [ ] AI: "Is there anything else I can help you with?"
- [ ] Reply: "No thanks"
- [ ] AI: Sends closing message with 👋

### Verification
- [ ] Appointment appears in Dashboard → Appointments
- [ ] Appointment details correct (name, email, date, time)
- [ ] Email notification sent (check inbox)

### Edge Cases
- [ ] Test lowercase name: "bambo\nbambo@email.com"
- [ ] Test full name: "John Doe\njohn@email.com"
- [ ] Test with comma: "John Doe, john@email.com"
- [ ] Test without name (should ask for it)

**Issues Found**: _______________________________________________

---

## 🗨️ Live Conversations

- [ ] Navigate to Dashboard → Live Conversations
- [ ] See active conversations
- [ ] List updates (wait 5-10 seconds)
- [ ] Click "Take Over" on a conversation
- [ ] Send message as human agent
- [ ] Message appears in chat widget
- [ ] Click "End Takeover"
- [ ] AI resumes responding

**Issues Found**: _______________________________________________

---

## 👥 Team Management

- [ ] Navigate to Dashboard → Team
- [ ] Invite team member (use test email)
- [ ] Select role (owner/admin/agent)
- [ ] Team member appears in list
- [ ] Remove team member
- [ ] Invitation email sent (check inbox)

**Issues Found**: _______________________________________________

---

## 📊 Analytics

- [ ] Navigate to Dashboard → Analytics
- [ ] View conversation count
- [ ] View message count
- [ ] View appointment statistics
- [ ] Charts render correctly
- [ ] Filter by date range
- [ ] Data appears accurate

**Issues Found**: _______________________________________________

---

## 🎯 Raven Support Widget (System Business)

### As Regular User:
- [ ] Login as non-admin user
- [ ] Go to Dashboard → Businesses
- [ ] ❌ "Raven Support" NOT in business list
- [ ] ✅ Raven Support widget still visible (bottom-right)
- [ ] Click widget, chat works
- [ ] Can book appointment with support

### As Admin (bambojude@gmail.com):
- [ ] Login as admin
- [ ] Go to Dashboard → Businesses
- [ ] ✅ "Raven Support" visible in list
- [ ] Can access and manage system business
- [ ] Widget also available

**Issues Found**: _______________________________________________

---

## 🔍 Conversation Closing

Test that conversation DOES close:
- [ ] "No thanks" → Closes ✅
- [ ] "No" (single word) → Closes ✅
- [ ] "Nothing else" → Closes ✅
- [ ] "Bye" → Closes ✅
- [ ] "Au revoir" → Closes ✅

Test that conversation DOES NOT close:
- [ ] "I would like to know..." → Continues ✅
- [ ] "Can you show me..." → Continues ✅
- [ ] "I have a question about..." → Continues ✅

**Issues Found**: _______________________________________________

---

## 📱 Responsive Design

- [ ] Test on desktop (Chrome)
- [ ] Test on desktop (Firefox)
- [ ] Test on desktop (Safari)
- [ ] Test on mobile (Chrome/Safari)
- [ ] Test on tablet
- [ ] Widget appears correctly on all devices
- [ ] Dashboard navigation works on mobile

**Issues Found**: _______________________________________________

---

## 🐛 Bugs & Issues Summary

### Critical (Blocks core functionality):
1. _______________________________________________
2. _______________________________________________

### Major (Important but workaround exists):
1. _______________________________________________
2. _______________________________________________

### Minor (UI/UX improvements):
1. _______________________________________________
2. _______________________________________________

---

## 💡 Suggestions & Improvements

1. _______________________________________________
2. _______________________________________________
3. _______________________________________________

---

## ✅ Overall Assessment

**System Stability**: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**User Experience**: ☐ Excellent  ☐ Good  ☐ Fair  ☐ Poor

**Performance**: ☐ Fast  ☐ Acceptable  ☐ Slow  ☐ Very Slow

**Ready for Production**: ☐ Yes  ☐ Needs Minor Fixes  ☐ Needs Major Fixes  ☐ No

**Comments**: _______________________________________________

---

**Tester Signature**: _______________
**Date Completed**: _______________
