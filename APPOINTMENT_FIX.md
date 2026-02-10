# Appointment Booking Fix

## Date: February 10, 2026

## Problem Identified

Appointment bookings were failing because the name extraction regex patterns didn't handle the case where users type their name on one line and email on the next line.

### Example User Input:
```
Bambo
bambojude@gmail.com
```

### What Was Happening:
- ✅ Email was extracted correctly: `bambojude@gmail.com`
- ✅ Date/time was extracted from slot selection
- ❌ Name was NOT extracted: `None`
- ❌ Appointment creation failed (missing required field: name)

### Root Cause:
The name extraction patterns in `app/services/ai.py` expected:
- "My name is X"
- "Name: X"
- "X, email@example.com" (comma-separated)
- Two capitalized words for full names

But did NOT handle:
- Single name followed by newline then email: `"Bambo\nemail@..."`
- Single name followed by newline then phone: `"John\n+237..."`

## Fix Applied

### File Modified:
`backend/app/services/ai.py` (lines 394-410)

### Changes:
Added two new regex patterns to `name_patterns` list:

```python
# NEW: Single name followed by newline and then email/phone
rf"^{greeting_blacklist}([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\n\s*[\w.+-]+@",  # Name + newline + email
rf"^{greeting_blacklist}([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s*\n\s*\+?\d{{6,}}",  # Name + newline + phone
```

### Pattern Details:
- `^` - Matches start of message
- `{greeting_blacklist}` - Negative lookahead to exclude greetings like "Hi Raven"
- `([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)` - Captures one or two capitalized words (name)
- `\s*\n\s*` - Matches optional whitespace, newline, optional whitespace
- `[\w.+-]+@` or `\+?\d{6,}` - Matches email or phone number

### Supported Formats Now:
1. **Single name + newline + email**:
   ```
   Bambo
   bambo@example.com
   ```

2. **Full name + newline + email**:
   ```
   John Doe
   john@example.com
   ```

3. **Name + newline + phone**:
   ```
   Marie
   +237673377962
   ```

4. **Still supports all previous formats**:
   - "My name is John Doe"
   - "John Doe, john@example.com"
   - "Name: John"
   - etc.

## Testing

### Test Scenario:
1. User: "I would like to book an appointment"
2. AI: Shows available slots with buttons
3. User: Clicks "Tuesday 10 February at 15:00"
4. AI: "To complete your booking, could you please provide me with your full name and email address?"
5. User: Types:
   ```
   Bambo
   bambojude@gmail.com
   ```
6. AI: "Let me process your booking..."
7. ✅ **Appointment created successfully with:**
   - Name: "Bambo"
   - Email: "bambojude@gmail.com"
   - Date: "2026-02-10"
   - Time: "15:00"

### Before Fix:
```
🔍 Final extracted info: {'name': None, ...}
🔍 Has all required fields: name=False, email=True, date=True, time=True
❌ Appointment NOT created (missing name)
```

### After Fix:
```
🔍 Found potential name: 'Bambo' in message: 'Bambo\nbambojude@gmail.com'
🔍 Accepted name: 'Bambo'
🔍 Final extracted info: {'name': 'Bambo', ...}
🔍 Has all required fields: name=True, email=True, date=True, time=True
✅ Creating appointment with: name=Bambo, email=bambojude@gmail.com, date=2026-02-10, time=15:00
✅ Appointment created successfully
```

## Files Modified

1. **backend/app/services/ai.py** - Added newline-separated name extraction patterns

## How to Test

1. Visit http://localhost:3000
2. Open the chat widget (bottom-right)
3. Type: "I want to book an appointment"
4. Click any available time slot button
5. When prompted for name and email, type:
   ```
   YourName
   your@email.com
   ```
6. ✅ Appointment should be created successfully!

### Alternative Test Formats:
- Single line: `"John, john@email.com"`
- With keywords: `"My name is John, john@email.com"`
- Multi-line: `"John Doe\n+237673377962"`

## Production Deployment

- ✅ Fix is backward compatible
- ✅ All existing name formats still work
- ✅ No database changes required
- ✅ Ready for deployment

---

**Issue resolved! Appointment bookings now work with newline-separated name and contact info.** ✅
