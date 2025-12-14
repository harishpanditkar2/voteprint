# UI/UX Guide

## Overview
The frontend is built with Next.js (React) and is fully modern, responsive, and mobile-friendly. All features are accessible and easy to use for both admins and operators.

## Main Page: `/pages/search.js`

### Features
- **Search & Filter**: By name, voter ID, father/husband, ward, booth, gender, age range.
- **Card Layout**: Each voter is shown as a card with image, details, and status.
- **View Modal**: Clicking "View" opens a modal with:
  - Large image preview (click to zoom)
  - All details (always visible)
  - Edit mode (fields become editable)
  - Print button (prints only details, not image)
- **Edit**: All fields can be edited and saved; changes are tracked.
- **Print**: Prints a clean, detail-only layout for thermal printers.
- **Mobile Support**: All layouts adapt to small screens.

### UI Patterns
- **Modern Font**: Uses Inter/Segoe UI/Arial for clarity.
- **Soft Shadows & Rounded Corners**: For all cards and modals.
- **Consistent Spacing**: Uses grid/flex for alignment.
- **Accessible Buttons**: Large, clear, and with hover/focus states.
- **Audit Badges**: "✓ Manually Verified" badge for edited voters.

### Responsiveness
- Uses CSS grid/flex and media queries for all layouts.
- Modal and cards adapt to any device.

### Customization
- All styles are in the main file for easy tweaking.
- Add new filters or fields as needed.

---

See `/pages/search.js` for the full UI implementation and comments.
