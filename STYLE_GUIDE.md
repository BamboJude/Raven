# Raven - Frontend Style Guide

## Overview
This document outlines the utility classes and styling conventions used in the Raven appointment booking system.

## Color Palette

### Primary Colors (Sky Blue)
- `primary-50`: #f0f9ff (Lightest)
- `primary-100`: #e0f2fe
- `primary-200`: #bae6fd
- `primary-300`: #7dd3fc
- `primary-400`: #38bdf8
- `primary-500`: #0ea5e9
- `primary-600`: #0284c7 (Brand color)
- `primary-700`: #0369a1
- `primary-800`: #075985
- `primary-900`: #0c4a6e (Darkest)

## Utility Classes

### Form Elements

#### Input Fields
```css
.input
```
- Standard input styling for text, time, number, etc.
- Full width, padding, border, focus ring
- Automatically applied to `input[type="time"]` and `input[type="number"]`

**Usage:**
```tsx
<input type="text" className="input" />
<input type="time" className="input text-sm" />
```

#### Checkboxes
```css
input[type="checkbox"]
```
- Styled automatically
- Primary color, focus ring, cursor pointer

**Usage:**
```tsx
<input type="checkbox" checked={enabled} onChange={handleChange} />
```

### Buttons

#### Primary Button
```css
.btn-primary
```
- Primary brand color background
- White text
- Hover and focus states

**Usage:**
```tsx
<button className="btn-primary">Save</button>
```

#### Secondary Button
```css
.btn-secondary
```
- Gray background
- Dark text
- Hover and focus states

**Usage:**
```tsx
<button className="btn-secondary">Cancel</button>
```

#### Danger Button
```css
.btn-danger
```
- Red background
- White text
- Hover and focus states

**Usage:**
```tsx
<button className="btn-danger">Delete</button>
```

#### Icon Buttons
```css
.icon-btn          /* Neutral icon button */
.icon-btn-danger   /* Danger/delete icon button */
```

**Usage:**
```tsx
<button className="icon-btn">
  <svg>...</svg>
</button>
<button className="icon-btn-danger" title="Delete">
  <svg>...</svg>
</button>
```

### Cards

#### Standard Card
```css
.card
```
- White background
- Rounded corners
- Shadow and border

**Usage:**
```tsx
<div className="card">
  <h2>Card Title</h2>
  <p>Card content</p>
</div>
```

#### Quick Access Card
```css
.quick-access-card
```
- Same as card but with hover effects
- Border color changes on hover
- Enhanced shadow on hover

**Usage:**
```tsx
<Link href="/dashboard/appointments" className="quick-access-card">
  <div className="flex items-center gap-4">
    {/* Icon and content */}
  </div>
</Link>
```

#### Appointment Card
```css
.appointment-card
```
- Enhanced card with hover effects
- Slightly larger shadow on hover
- Border transitions to primary color

**Usage:**
```tsx
<div className="appointment-card">
  {/* Appointment details */}
</div>
```

### Appointment-Specific

#### Filter Buttons
```css
.filter-btn-active     /* Selected filter */
.filter-btn-inactive   /* Unselected filter */
```

**Usage:**
```tsx
<button
  className={status === "all" ? "filter-btn-active" : "filter-btn-inactive"}
  onClick={() => setStatus("all")}
>
  All ({count})
</button>
```

#### Status Badges
```css
.status-badge
```

**Usage:**
```tsx
<span className="status-badge bg-green-100 text-green-800">
  Confirmed
</span>
```

#### Schedule Day Card
```css
.schedule-day           /* Enabled day */
.schedule-day-disabled  /* Disabled day */
```

**Usage:**
```tsx
<div className={enabled ? "schedule-day" : "schedule-day-disabled"}>
  {/* Day schedule */}
</div>
```

#### Time Slot Row
```css
.time-slot
```

**Usage:**
```tsx
<div className="time-slot">
  <input type="time" />
  <span>→</span>
  <input type="time" />
  <button className="icon-btn-danger">×</button>
</div>
```

#### Add Slot Button
```css
.add-slot-btn
```

**Usage:**
```tsx
<button className="add-slot-btn" onClick={addSlot}>
  + Add slot
</button>
```

### Navigation

#### Back Button
```css
.back-btn
```

**Usage:**
```tsx
<Link href="/dashboard" className="back-btn">
  <svg>...</svg>
</Link>
```

#### Export Button
```css
.export-btn
```

**Usage:**
```tsx
<a href="/api/export" className="export-btn">
  <svg>...</svg>
  Export
</a>
```

### Modals

#### Modal Overlay
```css
.modal-overlay
```

**Usage:**
```tsx
<div className="modal-overlay">
  <div className="modal-content">
    {/* Modal content */}
  </div>
</div>
```

#### Status Option Buttons (in modals)
```css
.status-option-selected     /* Currently selected status */
.status-option-unselected   /* Other statuses */
```

**Usage:**
```tsx
<button
  className={
    current === status
      ? "status-option-selected"
      : "status-option-unselected"
  }
  onClick={() => updateStatus(status)}
>
  {statusLabel}
</button>
```

### Empty States

#### Empty State Container
```css
.empty-state
```

#### Empty State Icon
```css
.empty-state-icon
```

**Usage:**
```tsx
<div className="empty-state">
  <div className="empty-state-icon">
    <svg>...</svg>
  </div>
  <h2>No appointments yet</h2>
  <p>Appointments will appear here</p>
</div>
```

### Loading Spinner

```css
.spinner
```

**Usage:**
```tsx
<div className="spinner h-12 w-12"></div>
```

## Component Patterns

### Availability Page

```tsx
// Day card with toggle and slots
<div className={enabled ? "schedule-day" : "schedule-day-disabled"}>
  <label>
    <input type="checkbox" checked={enabled} />
    <span>Monday</span>
  </label>

  {enabled && (
    <button className="add-slot-btn">+ Add slot</button>
  )}

  {enabled && slots.map((slot, i) => (
    <div className="time-slot" key={i}>
      <input type="time" value={slot.start} />
      <span>→</span>
      <input type="time" value={slot.end} />
      {slots.length > 1 && (
        <button className="icon-btn-danger">×</button>
      )}
    </div>
  ))}
</div>
```

### Appointments Page

```tsx
// Filter tabs
<div className="flex gap-2 overflow-x-auto pb-2">
  <button className={filter === "all" ? "filter-btn-active" : "filter-btn-inactive"}>
    All ({total})
  </button>
  <button className={filter === "pending" ? "filter-btn-active" : "filter-btn-inactive"}>
    Pending ({pending})
  </button>
</div>

// Appointment card
<div className="appointment-card">
  <div className="flex items-center gap-3">
    <h3>{customerName}</h3>
    <span className="status-badge bg-green-100 text-green-800">
      Confirmed
    </span>
  </div>
  {/* Rest of appointment details */}
</div>

// Status update modal
{showModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Update Status</h3>
      {statuses.map(status => (
        <button
          className={
            current === status
              ? "status-option-selected"
              : "status-option-unselected"
          }
        >
          {statusLabel}
        </button>
      ))}
    </div>
  </div>
)}
```

### Dashboard Quick Access

```tsx
<Link href="/dashboard/appointments" className="quick-access-card">
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
      <svg className="w-6 h-6 text-primary-600">...</svg>
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">Appointments</h3>
      <p className="text-sm text-gray-600">Manage bookings</p>
    </div>
  </div>
</Link>
```

## Animation & Transitions

All interactive elements include smooth transitions:
- Buttons: `transition-all duration-200`
- Cards: `transition-all duration-200`
- Hover states: Subtle color and shadow changes
- Modal: Backdrop blur effect

## Responsive Design

- Mobile-first approach
- Grid layouts adapt with Tailwind breakpoints:
  - `md:grid-cols-2` - 2 columns on medium screens
  - `md:grid-cols-3` - 3 columns on medium screens
- Horizontal scroll for filter buttons on mobile
- Flexible card layouts

## Accessibility

- Focus rings on all interactive elements
- Semantic HTML structure
- Keyboard navigation support
- ARIA labels where appropriate
- Sufficient color contrast (WCAG AA)

## Best Practices

1. **Consistency**: Use utility classes instead of inline styles
2. **Reusability**: Leverage defined utility classes across components
3. **Semantic**: Use appropriate HTML elements (button, Link, etc.)
4. **Performance**: Utility classes are optimized by Tailwind's purge
5. **Maintainability**: All styles defined in globals.css for easy updates

## File Locations

- **Global Styles**: `/frontend/src/app/globals.css`
- **Tailwind Config**: `/frontend/tailwind.config.ts`
- **Availability Page**: `/frontend/src/app/dashboard/availability/page.tsx`
- **Appointments Page**: `/frontend/src/app/dashboard/appointments/page.tsx`
- **Dashboard**: `/frontend/src/app/dashboard/page.tsx`

---

**Note**: All styles are built on Tailwind CSS and follow utility-first principles. When adding new components, prefer using existing utility classes or create new ones in globals.css rather than inline styles.
