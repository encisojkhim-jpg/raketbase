# RaketBase Frontend Plan - Phase 1

**Project:** RaketBase - Managed Freelance Services Marketplace  
**Milestone:** Phase 1: Foundation & Core Public Loop (0% - 25%)  
**Status:** Complete  
**Date Updated:** September 12, 2026  

---

## 1. Team Role Distribution & Deliverables

This frontend structure maps directly to the Phase 1 specification and role assignments:

### Member 4: Frontend Auth
* `frontend/src/pages/Register.jsx` - User registration form with role selection (customer/freelancer).
* `frontend/src/pages/Login.jsx` - User login form, saves JWT and user profile object into `localStorage`.
* `frontend/src/pages/ProtectedRoute.jsx` - Auth route wrapper that redirects unauthenticated users to `/login`.

### Member 5: Frontend Core UI
* `frontend/src/pages/Explore.jsx` - Job catalog with search, category tabs, and budget range filter slider.
* `frontend/src/pages/FreelancerProfile.jsx` - Job details page and proposal submission form with duplicate application guard.
* `frontend/src/pages/Dashboard.jsx` - Freelancer dashboard displaying proposal metrics and live submissions table.

### Shared & Supporting Components
* `frontend/src/components/Navbar.jsx` - Shared top navigation with navigable logo, search bar, Dashboard link, and user avatar logout dropdown.
* `frontend/src/components/Icons.jsx` - Reusable UI SVG icons.
* `frontend/src/services/api.js` - Centralized fetch helper for backend API endpoints.
* `backend/src/controllers/proposalsController.js` - Backend error handler catching Postgres duplicate key code `23505` to return a 409 Conflict.

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── components/
│   │   ├── Icons.jsx
│   │   └── Navbar.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Explore.jsx
│   │   ├── FreelancerProfile.jsx
│   │   ├── Login.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── Register.jsx
│   ├── services/
│   │   └── api.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## 3. Phase 1 Dataflow Implementation

### Step 0A: User Registration
* **File:** `frontend/src/pages/Register.jsx`
* **Behavior:** Takes user input (name, email, password, role), submits via `POST /api/v1/auth/register`, confirms registration, and redirects to `/login`.

### Step 0B: User Login & Session Persistence
* **File:** `frontend/src/pages/Login.jsx`
* **Behavior:** Posts credentials to `POST /api/v1/auth/login`. On 200 OK, stores `token` and `user` profile in `localStorage` and routes the user to `/dashboard`.

### Security: Protected Route Guard
* **File:** `frontend/src/pages/ProtectedRoute.jsx`
* **Behavior:** Checks for `token` in `localStorage`. If absent, redirects to `/login`. If present, renders nested protected views (`/dashboard`, `/explore`, `/explore/:id`).

### Step 1: Browsing Jobs
* **File:** `frontend/src/pages/Explore.jsx`
* **Behavior:** Calls `GET /api/v1/jobs` on mount. Displays open jobs in a 3-column card grid. Allows live client-side filtering by category tabs, keyword search, and budget slider.

### Step 2 & 3: Job Details & Proposal Submission
* **File:** `frontend/src/pages/FreelancerProfile.jsx`
* **Behavior:**
  * Fetches single job data via `GET /api/v1/jobs/:id`.
  * Renders budget with locale thousands formatting (`₱15,000`) using Inter (`font-sans`) so Unicode `U+20B1` displays properly.
  * Checks `GET /api/v1/proposals/me` on load. If already submitted for this job, shows an "Already Applied" badge and disables the form.
  * Validation rules run on field blur or form submit, preventing errors from showing on initial page load.
  * Submits proposals to `POST /api/v1/proposals` with `Authorization: Bearer <token>`.

### Step 4: Freelancer Proposals Dashboard
* **File:** `frontend/src/pages/Dashboard.jsx`
* **Behavior:** Calls `GET /api/v1/proposals/me` with JWT header. Calculates metrics for Active Rakets, Proposals Sent, and Pending Review, and displays proposal rows with status pills (`pending`, `accepted`, `rejected`).

---

## 4. Key Fixes & Architecture Notes

1. **Consolidation of Duplicate Job Pages:**
   * Initially, both `BrowseJobs.jsx` (`/jobs`) and `Explore.jsx` (`/explore`) existed after merging branches.
   * We standardized on `Explore.jsx` because it includes the dynamic budget slider, category pills, and responsive layout.
   * `BrowseJobs.jsx` and `JobDetails.jsx` were removed, and route redirects were added in `App.jsx` (`/jobs` -> `/explore`) so older links do not break.

2. **Currency Symbol Glyph Rendering:**
   * The budget value header was using `Space Grotesk` (`font-display`), which lacked native support for the Philippine Peso sign (`₱` / `U+20B1`), producing a broken/pixelated glyph.
   * Switched to `font-sans` (`Inter`) and applied `Number(budget).toLocaleString()` for clean `₱15,000` formatting.

3. **Duplicate Proposal Guard (Frontend + Backend):**
   * Submitting twice previously threw an unhandled Postgres unique key violation (`proposals_job_id_freelancer_id_key`).
   * Updated `proposalsController.js` to catch error code `23505` and return a user-friendly `409 Conflict`.
   * Updated `FreelancerProfile.jsx` to disable the submit button and show "Already Applied" once submitted.

4. **Form Validation Timing:**
   * Added `touched` state tracking on form inputs so validation messages only appear after a user interacts with a field (`onBlur`) or attempts to submit, not on clean page load.

5. **Navbar Alignment:**
   * Logo links to `/dashboard` when logged in.
   * Placed the `Dashboard` navigation link on the right side, directly to the left of the user avatar.
   * The circular user avatar dropdown contains user information and a dedicated "Log Out" button that clears storage and cookies.

---

## 5. AI Usage Log

| Date | AI Tool | Prompt | AI Output | What Student Changed | Reason |
|---|---|---|---|---|---|
| Sept 12, 2026 | Antigravity IDE | "Fix import error for supabaseClient in FreelancerProfile.jsx and resolve auth drop between login and explore routes." | Configured frontend Supabase client and replaced session fetch logic with `localStorage` JWT retrieval. | Unified all page authentication checks to read token from `localStorage.getItem('token')`. | Avoid session disconnects when navigating between client-side routes. |
| Sept 12, 2026 | Antigravity IDE | "Fix proposal submission and currency styling: broken peso glyph in header, missing number commas, duplicate proposal raw DB error, and premature validation." | Replaced `font-display` with `font-sans` for `U+20B1` support, added `.toLocaleString()`, caught Postgres code `23505` returning 409 in backend, and added `onBlur` touched validation. | Tested the proposal submission flow on `FreelancerProfile.jsx` and verified that `'Already Applied'` state disables inputs. | Ensure clean currency display and prevent duplicate submissions from leaking raw database errors. |
| Sept 12, 2026 | Antigravity IDE | "Make RaketBase logo navigable, add user profile dropdown with logout, and move Dashboard next to user avatar." | Created reusable `Navbar.jsx` with navigable `<Link>` for logo, direct `Dashboard` nav link, and avatar popover for identity and logout. | Adjusted layout so `Dashboard` sits directly to the left of the avatar and removed duplicate `Explore Jobs` link. | Adopt modern marketplace UX patterns (instant 1-click navigation + dedicated session dropdown). |
| Sept 12, 2026 | Antigravity IDE | "Consolidate duplicate job pages: delete BrowseJobs.jsx and JobDetails.jsx and redirect to Explore.jsx." | Deleted redundant files, updated `App.jsx` with `/jobs` -> `/explore` redirect routes, and tested production build. | Verified that all legacy job links route cleanly to the explore catalog without 404s. | Eliminate redundant duplicate code and standardize on the feature-rich explore catalog. |

---

## 6. Demo Walkthrough Checklist

1. **Auth & Registration (Member 4):**
   * Register a new user at `/register`.
   * Log in at `/login`, confirm redirect to `/dashboard`.
   * Check browser `localStorage` for `token` and `user`.
   * Test visiting `/dashboard` while logged out to verify `ProtectedRoute.jsx` redirects to `/login`.

2. **Marketplace Browsing (Member 5):**
   * Open `/explore`.
   * Test category pill filtering and budget range slider.
   * Search for jobs using the search bar in the navbar.

3. **Job Details & Application (Member 5):**
   * Click a job to open details.
   * Verify peso formatting (`₱`) and that no validation errors appear before typing.
   * Submit a bid and cover letter; confirm button changes to "Already Applied".
   * Refresh to confirm button remains disabled and prevents duplicate submission.

4. **Dashboard Tracking (Member 5):**
   * Click `Dashboard` next to the user avatar.
   * Confirm the submitted proposal appears with status `pending`.

5. **Session Logout (Member 4):**
   * Click user avatar, select "Log Out".
   * Confirm tokens are cleared and user is back on `/login`.
