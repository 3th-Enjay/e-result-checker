# Design Guidelines: School Result Management System

## Design Approach
**System-Based Design** utilizing Material Design principles with dashboard-focused patterns inspired by Linear and Google Classroom. This educational platform prioritizes clarity, trust, and efficiency across multiple user roles (Super Admin, School Admin, Teacher, Student).

## Core Design Principles
1. **Role-Appropriate Interfaces**: Each user type gets tailored dashboards optimized for their specific tasks
2. **Data Clarity**: Tables, forms, and results must be instantly scannable and error-free
3. **Trust & Professionalism**: Parents and schools need to feel confident in result accuracy
4. **Efficient Workflows**: Minimize clicks for common tasks (uploading results, checking grades, generating PINs)

---

## Typography System

**Font Families**:
- Primary: Inter (Google Fonts) - Clean, professional, excellent for data tables
- Accent: DM Sans (Google Fonts) - For headings and emphasis

**Hierarchy**:
- Page Titles: 2xl (36px), font-bold
- Section Headers: xl (24px), font-semibold
- Card Titles: lg (18px), font-medium
- Body Text: base (16px), font-normal
- Table Data: sm (14px), font-normal
- Labels/Meta: xs (12px), font-medium, uppercase tracking

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16** for consistent rhythm
- Component padding: p-4, p-8
- Section spacing: space-y-8, gap-4
- Card margins: m-4, mb-8
- Tight groups: space-y-2

**Grid Structure**:
- Dashboard containers: max-w-7xl mx-auto px-4
- Form containers: max-w-2xl mx-auto
- Data tables: Full width with horizontal scroll on mobile

---

## Component Library

### A. Navigation & Layout

**Super Admin/School Admin Sidebar**:
- Fixed left sidebar (w-64) with school logo at top
- Navigation items with icons (Heroicons)
- Collapsible sections for different modules
- Active state with subtle indicator
- User profile dropdown at bottom

**Teacher/Student Top Navigation**:
- Horizontal navbar with school branding
- User menu on right with role badge
- Breadcrumb navigation below for context

### B. Dashboard Components

**Stats Cards** (Super Admin & School Admin):
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4
- Each card: rounded-lg border p-6
- Icon (48px) + Label (sm, uppercase) + Large Number (3xl, font-bold) + Trend indicator
- Hover: subtle shadow lift

**Quick Action Buttons**:
- Prominent CTAs: "Upload Results", "Generate PINs", "Request PINs"
- Size: px-6 py-3, rounded-lg, font-semibold
- Icons inline with text (icon-left pattern)

### C. Data Display

**Result Tables** (Teacher Upload & Student View):
- Sticky header row with sort indicators
- Alternating row backgrounds for scannability
- Subject columns with numeric alignment (text-right)
- Total/Average columns with font-bold emphasis
- Grade column with badge styling
- Mobile: Horizontal scroll with fixed first column

**Student Result Card**:
- Prominent school header with logo
- Student info section (Name, Class, Term) in bordered box
- Results table below
- Summary footer (Total, Average, Position, Grade) in highlighted section
- Print-friendly layout
- Download/Print buttons at bottom

### D. Forms

**Result Upload Form** (Teacher):
- Subject selection dropdown
- Student list with inline grade inputs
- Auto-calculation display in real-time
- Batch save with progress indicator
- Error validation inline (red text, icon)

**PIN Request Form** (School Admin):
- Quantity input with stepper controls
- Purpose textarea
- Request history table below form

**School Registration** (Super Admin):
- Multi-step form with progress indicator
- School details, admin credentials, subdomain assignment
- Subdomain preview with live validation

### E. Authentication Screens

**Student Result Check** (Public Page):
- Centered card (max-w-md) on clean background
- School subdomain displayed prominently
- PIN input field (large, monospace font)
- Submit button (full width)
- "How to get PIN" help text

**Admin/Teacher Login**:
- Split screen: left = branding/image, right = form
- Email + Password fields
- Remember me checkbox
- Role indicator badge after login

### F. PIN Management

**PIN Display** (Super Admin):
- Generated PINs in copyable cards
- Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Each PIN: large monospace font, copy button, status badge
- Bulk download option

**PIN Status Badges**:
- Used/Unused indicators
- Expiry date if applicable
- Rounded-full, px-3 py-1, text-xs

---

## Responsive Behavior

**Mobile (< 768px)**:
- Sidebar collapses to hamburger menu
- Stats cards stack (grid-cols-1)
- Tables: horizontal scroll with sticky columns
- Forms: full-width inputs
- Spacing reduces: py-12 → py-8, gap-8 → gap-4

**Tablet (768px - 1024px)**:
- Two-column grids for stats/cards
- Sidebar remains visible
- Tables: better readability

**Desktop (> 1024px)**:
- Full multi-column layouts
- Maximum spacing for breathing room
- Side-by-side forms and previews

---

## Accessibility & UX Details

- All form inputs: clear labels, aria-labels, error states
- Tables: proper th scope, sortable column indicators
- Focus states: 2px solid ring on all interactive elements
- Keyboard navigation: tab order follows logical flow
- Loading states: spinner + descriptive text ("Calculating results...")
- Empty states: helpful illustrations + CTA ("No results uploaded yet. Upload your first batch.")

---

## Images

**Hero Section** (Public Landing/Marketing Page - if created):
- Large hero image using school environments, desks, books, dashboards, or abstract education visuals
- No student faces or human subjects in marketing hero assets
- Overlay text: "Transparent, Efficient School Result Management"
- Blurred background on CTA button

**Dashboard Illustrations**:
- Empty state SVG illustrations (undraw.co style) for:
  - No results found
  - No PINs generated yet
  - Welcome screens for new schools

**School Logos**:
- Displayed in navbar (max-h-12)
- On result cards (max-h-16)
- In subdomain previews

---

## Animation Philosophy

**Minimal, Purposeful Animations**:
- Page transitions: subtle fade (150ms)
- Modal/dropdown appearance: slide + fade (200ms)
- Success confirmations: checkmark animation (400ms)
- NO scroll animations, parallax, or decorative effects
- Focus on instant feedback for user actions
---

## Current Implementation Snapshot (March 22, 2026)

### Completed In Repo
- Premium visual system now uses a deeper trust-driven blue/slate palette, stronger card hierarchy, gradient mesh backgrounds, glassy shell surfaces, and tighter typography.
- The shared brand layer now includes the reusable `SR` mark, a matching favicon, a theme toggle, and monospace treatment for operational data such as PINs and dashboard metrics.
- Public-facing pages were redesigned for a more premium SaaS feel: landing page, login, school registration, and result checker now share a more polished narrative and stronger trust cues.
- The main app shell was upgraded with a more refined sidebar, sticky dashboard header, and a richer notifications surface.
- Dashboard and analytics experiences now include charts, insight cards, activity timelines, result-status views, PIN usage views, and clearer executive summaries.
- The results workspace now has a premium hero section, operational summary cards, and cleaner result-sheet/result-management framing.
- The PIN workspace now supports a more polished register, copy feedback, export flows, usage summaries, and better filtering.
- School signup was expanded to capture the real backend fields for public registration: school name, school code, school email, school phone, school address, admin first name, admin last name, admin email, password, and logo.

### Prompt Alignment Notes
- Public marketing visuals should continue to avoid student faces or human subjects and instead use school environments, books, desks, dashboards, and abstract education visuals.
- Motion should remain subtle and functional: fade, slide, stagger, and feedback states only where they clarify actions.
- Academic and administrative screens should continue to prioritize trust over decoration.

## Recommended Next UX Improvements

### Highest-Value Next Steps
1. Add global search across students, results, PINs, and schools so admins can jump directly to entities without navigating multiple pages.
2. Add inline editing and auto-save drafts to result-sheet workflows so teachers can correct entries without reopening multiple dialogs.
3. Add stronger empty states and skeleton loaders across analytics, results, and PIN screens to make loading and first-use moments feel more intentional.
4. Add styled PDF exports for result sheets with watermarking, verification badges, timestamps, and school branding for a more official parent-facing output.
5. Connect notifications to real backend events so approval, rejection, PIN generation, and publication updates feel live instead of static.
6. Add a clearer onboarding progress pattern for new schools, including approval status, next steps, and what happens before first login.

### Additional UX Refinements
- Add debounce and column-level filtering to more admin tables, not just search inputs.
- Add a reusable mobile action bar or sticky CTA pattern on the highest-frequency mobile workflows.
- Add a stronger dark-mode QA pass to confirm chart contrast, badge readability, and overlay behavior.
- Add analytics callouts for top-performing students, classes needing attention, and approval bottlenecks.
- Add QR support only if there is a verified operational use case for PIN distribution; avoid it if it adds complexity without clear value.

## Signup Status
- Public signup now aligns with `POST /api/public/register-school` and captures the required school and school-admin fields on the client.
- Newly registered schools and their initial school-admin accounts remain inactive until a super admin approves them.
- Login should only be expected after that approval step is complete.
