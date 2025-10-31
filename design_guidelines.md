# Design Guidelines: Shipping Timeline Calculator

## Design Approach
**System-Based Approach**: Clean, utility-focused design prioritizing clarity and readability over decorative elements. Drawing from Material Design principles for structured information hierarchy and Stripe's restraint for professional appearance.

**Design Principles**:
- Clarity first: Information should be immediately scannable
- Trustworthy presentation: Professional, reliable appearance
- Focused urgency: Countdown as primary visual anchor
- Data-forward: Table content should be effortlessly readable

---

## Core Design Elements

### A. Typography

**Font Family**: 
- Primary: 'Inter' or 'DM Sans' (Google Fonts)
- Fallback: system-ui, -apple-system, sans-serif

**Type Scale**:
- Countdown numbers: 48px, font-weight 700, tabular-nums
- Countdown labels: 14px, font-weight 500, uppercase, letter-spacing 0.5px
- Section heading: 20px, font-weight 600
- Body text: 16px, font-weight 400, line-height 1.6
- Table headers: 14px, font-weight 600, uppercase, letter-spacing 0.3px
- Table cells: 15px, font-weight 500
- Fine print: 13px, font-weight 400, italic

### B. Layout System

**Spacing Primitives**: Tailwind units of 2, 3, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section spacing: mb-6, mb-8
- Table cell padding: p-4
- Card container: p-8 on desktop, p-6 on mobile

**Container Structure**:
- Max-width: 900px centered
- Outer margin: mx-auto with px-4 on mobile
- Card elevation: subtle shadow, rounded corners (8px radius)

### C. Component Library

**Countdown Timer Component**:
- Large card with subtle background differentiation
- Four-segment display (Days, Hours, Minutes, Seconds)
- Each segment: number above, label below in vertical stack
- Equal-width segments with dividers between them
- Emphasized through size and contained background
- Smooth number transitions with subtle scale animation

**Information Banner**:
- Clean text container above countdown
- Center-aligned with breathing room (mb-4)
- Supports inline dynamic text (cutoff date) with subtle emphasis

**Data Table**:
- Clean borders with subtle color (not harsh black)
- Alternating row backgrounds for scannability (very subtle zebra striping)
- Sticky header on scroll for long tables
- Responsive: stack or horizontal scroll on mobile
- Column headers with subtle background distinction
- Generous cell padding for readability
- Bold labels in first row for delivery dates

**Holiday Message**:
- Right-aligned, italic, smaller text
- Subtle color to de-emphasize (not primary information)
- Asterisk system for noting affected dates
- Conditional visibility based on holiday presence

**Container Card**:
- Single unified card containing all elements
- Subtle shadow for elevation (not heavy)
- Rounded corners throughout
- Light background with sufficient contrast from page background
- Proper internal spacing hierarchy

### D. Visual Hierarchy

**Primary Focus**: Countdown timer - largest, most prominent
**Secondary**: Delivery dates table
**Tertiary**: Informational text and holiday notices

**Emphasis Techniques**:
- Size contrast (countdown significantly larger)
- Background containers to group related information
- Strategic use of font weights (not colors initially)
- Spacing to create clear sections

### E. Responsive Behavior

**Desktop (lg and above)**:
- Full table display with all columns visible
- Countdown segments in horizontal row
- Generous spacing throughout

**Tablet (md)**:
- Table remains horizontal with potential horizontal scroll
- Maintain countdown horizontal layout
- Reduce padding slightly

**Mobile (base)**:
- Countdown segments stack to 2x2 grid
- Table scrolls horizontally OR stacks important columns
- Reduce font sizes proportionally
- Tighter spacing (p-4 instead of p-8)

### F. Animations (Minimal)

**Number Changes**:
- Quick fade and slight scale animation when countdown updates
- Duration: 300ms ease-in-out
- No color flash (preserve visual stability)

**State Transitions**:
- Smooth visibility transitions when hiding/showing segments
- Fade in/out over 200ms

**Avoid**: Excessive motion, distracting effects, rotating elements, bouncing

---

## Component Details

### Countdown Display Structure
- Container with subtle background and border
- Four equal-width segments
- Vertical dividers between segments (subtle, 1px)
- Each segment: centered number (large) + label (small, uppercase)
- Entire countdown has breathing room with padding

### Table Design
- Remove harsh black borders
- Use subtle gray borders (1px solid)
- Header row: slightly darker background, bold text, uppercase labels
- First data row labeled "Guaranteed Delivery On or Before"
- Date cells: comfortable padding, medium font weight
- Asterisk notation for holiday-affected dates aligned to text
- Hover state on rows: very subtle background change

### Information Text
- "Order before" message clearly states cutoff time and date
- Dynamic date portion subtly emphasized (medium weight)
- Center-aligned for importance
- Adequate margin below before countdown

### Page Structure
- Clean page background (very light gray or white)
- Card floats with margin on page
- No harsh edges - everything rounded subtly
- Professional, trustworthy appearance

---

## Images
No images required for this utility application. The design relies on clear typography and structured information presentation.