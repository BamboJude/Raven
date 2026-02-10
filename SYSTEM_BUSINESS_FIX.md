# System Business Visibility Fix

## Date: February 10, 2026

## Problem

The "Raven Support" system business was appearing in all user dashboards, not just the admin dashboard. This caused confusion as regular users saw a business they didn't create and couldn't delete.

### What Was Happening:
- ❌ Non-admin users saw "Raven Support" in their dashboard
- ❌ They couldn't modify or delete it (correctly)
- ❌ It cluttered their business list
- ✅ Admin could see it (correct)
- ✅ Widget was available to all users (correct)

## Solution

Modified the business listing API to exclude system businesses for non-admin users.

### File Modified:
`backend/app/api/business.py` (lines 62-73)

### Changes:

**Before:**
```python
@router.get("", response_model=list[BusinessResponse])
async def list_businesses(authorization: Optional[str] = Header(None)):
    """List all businesses for the authenticated user. Admin sees all."""
    user_id = get_user_id_from_header(authorization)

    if is_platform_admin(user_id):
        return db.get_all_businesses()

    return db.get_businesses_for_user_with_system(user_id)  # ❌ Included system businesses
```

**After:**
```python
@router.get("", response_model=list[BusinessResponse])
async def list_businesses(authorization: Optional[str] = Header(None)):
    """List all businesses for the authenticated user. Admin sees all including system businesses."""
    user_id = get_user_id_from_header(authorization)

    if is_platform_admin(user_id):
        # Admin sees all businesses including system businesses
        return db.get_all_businesses()

    # Non-admin users only see their own businesses (no system businesses)
    return db.get_businesses_by_user(user_id)  # ✅ Only user's own businesses
```

## Behavior After Fix

### For Admin Users (bambojude@gmail.com):
- ✅ See **ALL** businesses including "Raven Support"
- ✅ Can manage all businesses
- ✅ Can access system businesses
- ✅ Has support widget available

### For Regular Users:
- ✅ See **ONLY** their own created businesses
- ✅ Start with empty dashboard (no businesses)
- ✅ Can create their own businesses
- ❌ Cannot see "Raven Support" in their list
- ✅ Still have support widget available on all pages

### Support Widget Access:
The Raven Support chat widget is still available to **all users** globally because:
- Widget uses business ID directly (`f2939e5f-9367-4110-9113-60748fc2cddb`)
- Widget is loaded in root layout (`frontend/src/app/layout.tsx`)
- Widget endpoints are public (no auth required)
- Users can chat with support without seeing it in their business list

## Testing

### Test as Admin:
1. Sign in as: `bambojude@gmail.com`
2. Go to: http://localhost:3000/dashboard
3. ✅ Should see "Raven Support" business
4. ✅ Should see all other businesses

### Test as Regular User:
1. Sign in as: any other user
2. Go to: http://localhost:3000/dashboard
3. ✅ Should see only your own businesses (or empty if none)
4. ❌ Should NOT see "Raven Support"
5. ✅ Support widget still available in bottom-right corner

### Test Support Widget:
1. Sign in as **any user** (admin or regular)
2. Visit **any page** on the site
3. ✅ Support widget appears in bottom-right
4. ✅ Click to chat with "Raven Support"
5. ✅ Can book appointments, ask questions, etc.

## Database Schema Context

### System Business Flag:
The "Raven Support" business has `is_system: true` flag in the database, which identifies it as a platform-wide system business rather than a user-created business.

### Functions Used:
- `get_all_businesses()` - Returns ALL businesses (admin only)
- `get_businesses_by_user(user_id)` - Returns only user's own businesses
- `get_businesses_for_user_with_system(user_id)` - Returns user's + system businesses (removed for regular users)
- `get_system_businesses()` - Returns only system businesses

## Benefits

### User Experience:
- ✅ Clean dashboard for new users
- ✅ No confusion about "Raven Support" business
- ✅ Users only see what they created
- ✅ Support is still easily accessible

### Admin Experience:
- ✅ Full visibility of all businesses
- ✅ Can manage system businesses
- ✅ Clear distinction between admin and regular users

### Security:
- ✅ System businesses protected from regular users
- ✅ Proper authorization boundaries
- ✅ Admin privileges clearly defined

## Implementation Details

### Admin Check:
```python
from app.services.admin import is_platform_admin

# In business.py
if is_platform_admin(user_id):
    return db.get_all_businesses()  # Includes system businesses
else:
    return db.get_businesses_by_user(user_id)  # Only user's own
```

### Admin User:
Configured in `backend/app/config.py`:
```python
platform_admin_email: str = "bambojude@gmail.com"
```

## Files Modified

1. **backend/app/api/business.py**
   - Changed line 70 from `get_businesses_for_user_with_system()` to `get_businesses_by_user()`
   - Updated docstring to clarify admin vs regular user behavior

## Future Enhancements (Optional)

- Add admin panel to manage system businesses
- Support multiple admin users
- Add role-based permissions (admin, manager, viewer)
- Allow businesses to be marked as "template" or "demo"
- Track which users have accessed support widget

---

**System business visibility is now properly restricted to admin users only!** ✅
