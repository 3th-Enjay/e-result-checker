# Sign-Up And Onboarding Specification

## Purpose
This document defines the onboarding model for the School Result Management System and now reflects both:
- the target product direction
- the current implementation status in this codebase

The goal remains the same:
- start a school in under 1 minute
- verify trust before activation
- keep the experience premium, clear, and scalable

---

## Current Status Snapshot

### What is already implemented
The codebase now ships a working **Phase 1 onboarding foundation**:
- public school signup endpoint
- guided one-step-at-a-time signup UI
- local draft save and resume on the signup flow
- school code and subdomain suggestion logic
- AI-assisted onboarding hints for trust, subjects, and class recommendations
- pending school creation
- pending school-admin creation
- email verification link generation
- resend verification flow
- verification success page
- login blocking until verification and approval requirements are met
- backend activation is blocked until the primary admin email is verified
- super-admin review queue
- approve school flow
- reject school flow
- approval and rejection notifications
- provider-aware onboarding email service with `google`, `resend`, and `console` fallback modes

### What is partially implemented
These ideas exist in simplified form and should be strengthened later:
- onboarding state is still modeled mainly through `isActive` plus audit logs rather than explicit status enums
- post-login school setup is still limited compared to the full onboarding vision
- AI assistance is rule-based and heuristic, not LLM-driven
- verification metadata is stored through audit history rather than a dedicated verification schema

### What is not yet implemented
- full post-login onboarding wizard for school profile, classes, subjects, and staff
- completion percentages tied to real onboarding records
- document upload for legitimacy review
- suspension workflow with reason history and recovery path
- automated trust scoring or low-risk auto-approval
- reminder sequences for stale pending signups

---

## Product Goals
- Reduce signup friction so a school can begin quickly.
- Keep verification strong enough for academic operations.
- Separate account creation from full setup completion.
- Give Super Admin a clean review workflow.
- Maintain a premium SaaS feel across all onboarding moments.

### Success criteria
- A school can begin signup in 60 seconds or less.
- Users always understand the next action.
- Verification is mandatory before approval.
- Super Admin can review, approve, or reject schools clearly.
- The system can scale to large signup volume without becoming chaotic.

---

## Roles

### Super Admin
- Reviews newly registered schools.
- Verifies legitimacy.
- Activates or rejects schools.
- Owns trust, compliance, and platform onboarding quality.

### School Admin
- Primary owner of the school workspace.
- Created automatically during signup.
- Receives verification and approval notifications.
- Completes deeper setup after activation.

### Teacher
- Invited after school activation.
- Does not participate in the public onboarding flow.

### Student
- Usually created later through school-managed student records or result access workflows.

---

## Current North-Star Flow

```text
Visitor opens guided signup
-> enters school name
-> enters admin email
-> creates password
-> optionally chooses preferred subdomain
-> reviews a summary screen
-> system creates pending school + pending school-admin
-> verification email is sent
-> admin verifies email
-> school enters super-admin review queue
-> super admin approves or rejects
-> approved school gets login access
-> school completes the rest of setup after activation
```

---

## Phase Breakdown

## Phase 1: Fast Signup, Verification, And Review

### Target outcome
A school should be able to create a pending account quickly, verify the admin email, and wait for Super Admin approval without confusion.

### Implemented in this repo
- guided modal-style signup with one focused input at a time
- progress indicator and animated step transitions
- keyboard-friendly flow with Enter-to-next behavior
- real-time validation on each step
- password visibility toggles
- live subdomain and school code preview
- AI assistant guidance at each signup step
- pre-submit review screen
- school and school-admin pending creation
- verification email sending
- verification page and resend verification endpoint
- approval and rejection flows from the super-admin school review page

### Suggested improvements inside Phase 1
- add explicit onboarding status enums for schools and users
  - recommended values: `pending_verification`, `pending_review`, `active`, `rejected`, `suspended`
- store `email_verified_at` directly on the user record
- add `approved_at`, `approved_by`, and `rejection_reason` to school records
- block approval unless email is verified (implemented: enforced in `PATCH /api/schools/:id/status`)
- add review filters to the Super Admin queue
  - verified only
  - pending too long
  - generic email domains
- add audit log detail for which provider sent the email and whether delivery fell back
- improve inline subdomain availability feedback directly on the signup step

### UX improvements still worth adding in Phase 1
- tiny success animation after each completed step
- sticky mobile action bar for back/next buttons
- clearer countdown or expiry copy on verification emails
- inline badge showing whether the email domain looks branded or generic

---

## Phase 2: Post-Login Progressive Setup

### Target outcome
After approval, the school admin should be guided through the rest of school setup without being forced to do everything during signup.

### Recommended scope
- school profile completion
- logo and branding
- address and contact details
- class structure setup
- subject setup
- score metric setup
- staff invitation setup

### Current status
- Phase 2 onboarding MVP implemented (status endpoint + onboarding UI + redirect gating)
- some related configuration screens already exist elsewhere in the app

### Suggested improvements for Phase 2
- build a real onboarding dashboard with:
  - completion percentage
  - checklist cards
  - next recommended action
- persist onboarding progress in a dedicated table or structured JSON record (implemented: client-side structured snapshot for MVP)
- auto-save every onboarding step (implemented: onboarding dashboard caches progress and refreshes on each visit)
- allow schools to pause and resume setup later (implemented: redirect gating lets admins work on setup pages without being trapped)
- add contextual AI help
  - suggest class ladders from school type
  - suggest starter subject lists by school type
  - recommend grading defaults (partial: recommended classes/subjects + trust help implemented; grading defaults still next)
- unlock parts of the dashboard progressively
  - configuration pages available first
  - operational flows available once minimum setup is complete

### UX improvements still worth adding in Phase 2
- ùYou are 40% readyù onboarding bar
- empty-state cards for classes, subjects, and staff
- ùapply suggested setupù buttons generated from onboarding heuristics
- side-by-side preview of school branding before it goes live

---

## Phase 3: Trust, Compliance, And Automation

### Target outcome
Make onboarding more robust for scale and legitimacy without slowing normal schools down.

### Recommended scope
- document upload for school verification
- stronger trust scoring
- suspension and recovery workflow
- automated reminders for stalled signups
- low-risk auto-approval rules

### Current status
- not yet implemented

### Suggested improvements for Phase 3
- add a `verification_requests` table
- support document upload for:
  - school registration evidence
  - official letterhead
  - authorization letter
- add manual request-for-more-information workflow
- add stale signup reminders
  - day 1 verification reminder
  - day 3 pending review reminder
  - day 7 archive or manual intervention flag
- add trust scoring signals:
  - branded domain
  - completed school profile
  - uploaded verification documents
  - suspicious duplicate name patterns
- add school suspension reason tracking and read-only suspension view

### UX improvements still worth adding in Phase 3
- trusted badge after full verification
- review timeline visible to the school admin
- status history panel for approval, rejection, and re-review events
- support inbox or help CTA directly on blocked states

---

## 1-Minute Signup Strategy

### Current implementation direction
The signup now follows a true low-friction path:
- School Name
- Admin Email
- Password
- Confirm Password
- Optional preferred subdomain
- Review screen

This is intentionally smaller than the earlier two-page full form.

### Why this is the better flow
- Less cognitive load
- Faster completion time
- Better mobile experience
- Stronger focus on one decision at a time
- Cleaner visual hierarchy

### Fields deferred after activation
- School logo
- Address
- Phone
- Motto and branding
- Classes and arms
- Subjects
- Score metrics
- Staff setup
- Verification documents

---

## Trust And Verification Layer

### What is implemented
- email verification is required before approval should proceed
- generic domain awareness exists through onboarding heuristics
- super admin review queue exists
- rejection path exists with reason

### What should still be improved
- hard enforcement that approval cannot happen before verification
- dedicated verification status fields instead of audit-only detection
- document upload support
- review notes and structured decision metadata

### Recommended verification sequence
1. Create pending school and pending school-admin.
2. Send verification email.
3. Verify the admin email.
4. Move the school into the review queue.
5. Approve or reject the school.
6. Allow full login and deeper onboarding only after approval.

---

## System States And Flow Logic

### Current practical states in the repo
Although the repo still uses `isActive`, the real workflow now behaves like this:
- `pending_verification`
  - school created
  - admin cannot log in yet
- `pending_review`
  - admin email verified
  - super admin decision still pending
- `active`
  - school approved
  - admin can log in
- `rejected`
  - signup rejected with reason
  - login stays blocked

### Recommended future explicit states
- `pending_verification`
- `pending_review`
- `active`
- `rejected`
- `suspended`

### What each state should show

#### Pending Verification
- school sees verification messaging
- can resend verification email
- cannot access dashboard

#### Pending Review
- school sees approval-pending messaging
- can contact support if needed
- should eventually enter a limited onboarding workspace if product wants pre-approval completion

#### Active
- school can log in normally
- onboarding dashboard guides the rest of setup

#### Rejected
- school sees rejection reason
- school can restart or resubmit via a defined path

#### Suspended
- school sees suspension reason
- access becomes blocked or read-only

---

## Developer Notes

### Current implementation model
The current onboarding flow is built mainly from:
- `schools.isActive`
- `users.isActive`
- `audit_logs`
- `notifications`
- provider-aware onboarding email service

### Recommended schema evolution
Add or plan for:
- `schools.status`
- `schools.approvedAt`
- `schools.approvedBy`
- `schools.rejectionReason`
- `users.emailVerifiedAt`
- `school_onboarding.completionPercent`
- `verification_requests`

### Current useful endpoints
- `POST /api/public/register-school`
- `POST /api/public/onboarding-assistant`
- `GET /api/public/subdomains/check`
- `POST /api/public/verify-email`
- `POST /api/public/resend-verification`
- `GET /api/schools/review-queue`
- `PATCH /api/schools/:id/status`
- `POST /api/schools/:id/reject`

### Suggested next endpoints
- `GET /api/onboarding/status`
- `PATCH /api/onboarding/profile`
- `PATCH /api/onboarding/structure`
- `PATCH /api/onboarding/staff`
- `POST /api/schools/:id/request-info`
- `POST /api/schools/:id/suspend`

---

## UI And UX Notes

### Current signup direction
- centered premium card
- one input at a time
- progress bar
- assistant sidebar
- review screen before submit
- validation without reload
- keyboard-friendly interactions

### Suggested refinements
- richer micro-animations between steps
- more obvious mobile sticky action buttons
- subtle background state changes by step
- inline status hint for generic vs branded email domains
- review screen confirmation checkbox for enterprise-style confidence

---

## Final Recommendation
The current foundation is strong enough to keep building on.

The best next move is:
- keep Phase 1 lean and reliable
- make Phase 2 the real post-login onboarding experience
- move trust/compliance depth into Phase 3
- replace implicit state logic with explicit onboarding state models as the next technical cleanup

That path keeps the signup fast today while making the system more scalable, reviewable, and production-safe over time.
