# UI Style Guide

This document outlines the "look & feel" for the Diet App, establishing a lightweight design system that feels warm, modern, and fast to use.

## 1. Core Principles

- **Clarity First:** The UI must be intuitive and easy to navigate. Information should be presented clearly, reducing cognitive load.
- **Mobile-First:** Design for small screens first, then scale up to larger devices. This ensures a great experience for all users.
- **Consistency is Key:** A consistent design language across the app builds trust and makes the app easier to learn and use.
- **Modern & Appealing:** The visual design should feel crafted and calm, with purposeful typography, a warm neutral base, and confident color accents.

## 2. Typography

We will use a dual-font system to create hierarchy without noise.

- **Font Family (Body):** `DM Sans`, friendly and highly readable.
- **Font Family (Display):** `Space Grotesk`, for headings and brand emphasis.
- **Base Font Size:** 16px
- **Scale (using a 1.25 ratio):**
  - `font-size-xs`: 12px (0.75rem) - for helper text, captions
  - `font-size-sm`: 14px (0.875rem) - for secondary text
  - `font-size-md`: 16px (1rem) - for body text
  - `font-size-lg`: 20px (1.25rem) - for subheadings
  - `font-size-xl`: 25px (1.563rem) - for headings
  - `font-size-xxl`: 31px (1.953rem) - for page titles
- **Weights:**
  - `font-weight-regular`: 400
  - `font-weight-medium`: 500
  - `font-weight-bold`: 700

## 3. Spacing

A consistent spacing scale based on a 4px grid will be used for all margins, paddings, and layout gaps.

- `space-xs`: 4px (0.25rem)
- `space-sm`: 8px (0.5rem)
- `space-md`: 12px (0.75rem)
- `space-lg`: 16px (1rem)
- `space-xl`: 24px (1.5rem)
- `space-xxl`: 32px (2rem)
- `space-xxxl`: 48px (3rem)

## 4. Colors & Design Tokens

We will use CSS variables for our color palette to allow for easy theming and consistency.

### Primary Palette
- `primary`: Deep teal for primary actions and active nav.
- `primary-contrast`: Light text for primary surfaces.
- `accent`: Warm orange for secondary highlights and badges.
- `accent-contrast`: Light text for accent surfaces.

### Neutrals
- `surface-ground`: Warm neutral background, paired with a subtle gradient.
- `surface-a`: The background for cards, modals, and other elevated surfaces.
- `surface-b`: A slightly different background for hover states or selected items.
- `text-color`: The primary text color.
- `text-color-secondary`: For secondary or less important text.
- `border-color`: For borders and dividers.

### Semantic Colors
- `success`: For success messages and confirmations.
- `info`: For informational messages.
- `warning`: For warnings.
- `danger`: For errors and destructive actions.

*(Specific values are defined as CSS variables in `frontend/src/styles.scss` and wired into PrimeNG in `frontend/src/assets/theme.scss`.)*

## 5. Component States

Components must provide clear visual feedback for user interactions.

- **Default:** The standard, resting state of a component.
- **Hover:** A subtle change (e.g., background color, shadow) to indicate that a component is interactive.
- **Focus:** A clear, visible outline (e.g., a ring or border) to show which element has keyboard focus. This is crucial for accessibility.
- **Disabled:** A reduced opacity and `not-allowed` cursor to indicate that a component is not interactive.
- **Error:** A distinct visual state (e.g., red border, error icon, error message) to indicate a validation error or other problem.

## 6. Component Patterns

### Buttons (CTAs)

- **Primary CTA:** Solid background (`primary`), used for the single main action on a screen or dialog.
- **Secondary CTA:** Subtle or outlined button for supporting actions.
- **Text/Link Button:** A button that looks like a link, for less important actions.
- **Destructive Action:** A button with a `danger` color, used for actions like "Delete" or "Remove".

### Forms

- **Labels:** Clearly associated with their inputs, placed above the input.
- **Input Fields:** Clean and simple, with a clear focus state.
- **Validation:** Inline validation with clear error messages appearing below the field.
- **Help Text:** Smaller, secondary-colored text to provide hints or instructions.

### Tables / Lists

- **Density:** Comfortable spacing between rows for readability. On mobile, consider a card-based list view.
- **Headers:** Clear and distinct from the table body.
- **Sorting/Filtering:** Clear affordances for sorting and filtering columns.
- **Empty State:** A helpful message with an icon and (if applicable) a primary CTA to guide the user (e.g., "No ingredients found. Add one now!").
- **Loading State:** Use skeleton loaders that mimic the shape of the content to reduce layout shift.

### Cards

- **Elevation:** Soft shadow with rounded corners for a premium feel.
- **Padding:** Consistent internal padding using the spacing scale.
- **Structure:** Clear hierarchy within the card for title, content, and actions.

### Modals / Dialogs

- **Header:** A clear title and an obvious close button (e.g., an 'X' icon).
- **Actions:** Buttons should be placed in a consistent location (e.g., bottom right), with a clear primary and secondary action.
- **Responsive:** Modals should be responsive, taking up most of the screen on mobile and being a reasonable size on desktop.

### Toasts / Notifications

- **Position:** Consistently appear in the same place (e.g., top right of the screen).
- **Iconography:** Use icons to quickly convey the type of message (success, error, info).
- **Dismissable:** Allow users to dismiss notifications.

## 7. Mobile-First Guidelines

- **Layout:** Use a single-column layout for most content.
- **Navigation:** A bottom navigation bar is ideal for the main pages (Menu, Shopping, Ingredients).
- **Tap Targets:** Ensure all interactive elements (buttons, links, form inputs) are large enough to be easily tapped.
- **Sticky Elements:** Use sticky headers or footers for important actions that need to be accessible at all times.
