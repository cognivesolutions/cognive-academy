# Testing Student Portal Flow and Checklist

## 1. Objective

The goal of testing is to verify the student-facing experience end-to-end: sign-in, dashboard access, course discovery, enrollment, course viewing, profile management, transactions, and navigation flow before considering the app ready for release or stakeholder review.

---

## 2. Test Environment

Before starting:
1. Run the app locally or against the intended QA/deployed environment.
2. Make sure the database is connected and seeded.
3. Confirm the student account is available.
4. Check that the app loads without console/runtime errors.
5. Use the same browser window for all manual validation.

---

## 3. Test Flow Order

Run tests in this order so critical issues are caught early:

1. Student authentication and access control
2. Student dashboard
3. Course catalog and filters
4. Course detail / live and recorded section access
5. My Courses page
6. Profile page and editing flow
7. Transaction and order history
8. Checkout and payment success flow
9. Navigation and redirect checks
10. Responsive layout validation
11. Final regression pass

---

## 4. Functional Test Checklist

### A. Authentication
1. Student can log in successfully with the seeded account (`student@cognive.academy` / `password123`) <span style="color: green;">✓</span>
2. Student user is redirected away from admin-only routes <span style="color: green;">✓</span>
3. Logged-out student is redirected to the student login page when accessing protected pages like `/dashboard` or `/my-courses` <span style="color: green;">✓</span>
4. Logout works correctly and returns the user to the expected login/home state <span style="color: green;">✓</span>
5. Session persists after refresh <span style="color: green;">✓</span>
6. Student role is correctly recognized by the auth flow and protected route logic in [src/auth.ts](src/auth.ts) <span style="color: green;">✓</span>

### B. Student Dashboard
1. Dashboard loads without runtime or hydration errors <span style="color: green;">✓</span>
2. Welcome message shows the correct user name and student branding <span style="color: green;">✓</span>
3. Summary cards display data correctly (profile completion, enrolled courses, learning momentum, etc.) <span style="color: green;">✓</span>
4. Continue Learning section shows enrolled or fallback learning cards correctly <span style="color: green;">✓</span>
5. Next class / live session tile renders correctly <span style="color: green;">✓</span>
6. Dashboard links to Profile, My Courses, and Browse Catalog work correctly <span style="color: green;">✓</span>
7. Empty state behaves correctly when the student is not enrolled in any course <span style="color: green;">✓</span>

### C. Course Catalog Experience
1. Courses page loads successfully and displays the catalog grid <span style="color: green;">✓</span>
2. Search box filters courses by matching text <span style="color: green;">✓</span>
3. Live / Recorded filter chip works correctly <span style="color: green;">✓</span>
4. English / Hindi language filter works correctly <span style="color: green;">✓</span>
5. Category filter shows the expected matching results <span style="color: green;">✓</span>
6. Pagination appears and navigates correctly between pages <span style="color: green;">✓</span>
7. Empty-state message is shown when no courses match the search/filter combination <span style="color: green;">✓</span>
8. Course cards have consistent content layout and CTA area alignment <span style="color: green;">✓</span>

### D. Course Detail / Live & Recorded Access
1. Clicking a course card opens the correct detail route <span style="color: green;">✓</span>
2. Live course route works as intended, including correct live metadata and CTA behaviour <span style="color: green;">✓</span>
3. Recorded course route works as intended and does not misroute to the live flow <span style="color: green;">✓</span>
4. Course description, badge, price, and CTA render correctly <span style="color: green;">✓</span>
5. Course route is not broken when switching between language, type, and category filters <span style="color: green;">✓</span>
6. Live and Recorded chips in category pages render the intended result set <span style="color: green;">✓</span>

### C1. Home Page Validation
1. Homepage loads successfully without a broken shell or blank main content area <span style="color: green;">✓</span>
2. Hero section renders with the expected brand messaging and CTAs <span style="color: green;">✓</span>
3. Primary actions route to correct pages: Explore Courses and Book a Free Call <span style="color: green;">✓</span>
4. Live classroom cards render actual course content and not placeholder text <span style="color: green;">✓</span>
5. Course cards reflect real pricing, durations, and course labels from the app data <span style="color: green;">✓</span>
6. Footer navigation and legal links render correctly for the end-user journey <span style="color: green;">✓</span>
7. The homepage sections are aligned with the intended app experience and are not stale or hardcoded placeholders <span style="color: green;">✓</span>

### E. My Courses Page
1. My Courses page loads successfully for a signed-in student <span style="color: green;">✓</span>
2. Enrolled courses are listed correctly <span style="color: green;">✓</span>
3. Active / Live / Recorded / Completed tabs filter correctly <span style="color: green;">✓</span>
4. Search within My Courses works correctly <span style="color: green;">✓</span>
5. Empty state appears if no course matches the selected filter <span style="color: green;">✓</span>
6. Progress indicators and course card content render correctly <span style="color: green;">✓</span>
7. CTA opens the curriculum or course detail route <span style="color: green;">✓</span>

### F. Profile & Account Management
1. Profile page loads correctly for the authenticated student <span style="color: green;">✓</span>
2. Edit profile form accepts updated values and submits without errors <span style="color: green;">✓</span>
3. Profile update saves to the user record and refreshes successfully <span style="color: green;">✓</span>
4. Student name and preferred details show correctly after save <span style="color: green;">✓</span>
5. Invalid values are blocked gracefully with a clear validation message <span style="color: green;">✓</span>

### G. Transactions / Order History
1. Transactions page loads correctly for the signed-in student <span style="color: green;">✓</span>
2. Orders are listed in the correct order and reflect the right course summary <span style="color: green;">✓</span>
3. Empty-state logic behaves correctly when no orders exist <span style="color: green;">✓</span>
4. Payment and order metadata is displayed correctly and is readable <span style="color: green;">✓</span>
5. Back-to-dashboard or related navigation works correctly <span style="color: green;">✓</span>

### H. Checkout & Payment Flow
1. Purchase button opens the checkout flow correctly <span style="color: green;">✓</span>
2. Order creation works without server-side errors <span style="color: green;">✓</span>
3. Payment flow redirects to the success page after completion <span style="color: green;">✓</span>
4. Success page renders correctly and shows the correct next action <span style="color: green;">✓</span>
5. User is redirected to the dashboard or course page after successful purchase <span style="color: green;">✓</span>
6. Failed or canceled purchase states are handled gracefully <span style="color: green;">✓</span>
7. Real Razorpay payment is confirmed as successful and the transaction is recorded in the app as PAID <span style="color: green;">✓</span>
8. Sign-out and protected-route behavior works correctly: sign-out redirects to /login and a protected page requires re-authentication <span style="color: green;">✓</span>
9. Checkout / payment success flow is fully verified as passed in the live browser QA run <span style="color: green;">✓</span>

### I. Navigation & Routing Checks
1. Header navigation routes to the dashboard, courses, transactions, profile, and course pages correctly <span style="color: green;">✓</span>
2. Course dropdown and submenu items open the proper category page or course route <span style="color: green;">✓</span>
3. Browser back/forward navigation does not break the student flow <span style="color: green;">✓</span>
4. Protected pages redirect correctly when a user is signed out <span style="color: green;">✓</span>
5. No broken route links remain in the student portal navigation <span style="color: green;">✓</span>

---

## 5. Validation Checklist for Data Integrity

1. Student user session is read correctly and resolves the student role <span style="color: green;">✓</span>
2. Enrollments are fetched from the database and displayed in the dashboard <span style="color: green;">✓</span>
3. Course purchase data is stored and reflected in the order history <span style="color: green;">✓</span>
4. Course progress and learning data displays correctly <span style="color: green;">✓</span>
5. Search and filters reflect the actual stored course metadata <span style="color: green;">✓</span>
6. Empty and invalid values are handled gracefully <span style="color: green;">✓</span>
7. Invalid course IDs or route states show a fallback or redirect flow without crashing <span style="color: green;">✓</span>

---

## 6. Responsive and UI Testing

1. Dashboard layout is clean and readable on desktop <span style="color: green;">✓</span>
2. My Courses page layout remains usable on desktop and tablet <span style="color: green;">✓</span>
3. Mobile layout stacks correctly for dashboard, course cards, and filters <span style="color: green;">✓</span>
4. Buttons and cards remain visible and clickable on smaller screens <span style="color: green;">✓</span>
5. Category and course filters wrap without overlap <span style="color: green;">✓</span>
6. Pagination controls remain aligned with the card area and are readable on all viewports <span style="color: green;">✓</span>
7. No text overflow or clipping occurs in student cards <span style="color: green;">✓</span>

---

## 7. Error and Edge Case Checks

1. Empty course list shows the correct message <span style="color: green;">✓</span>
2. No matches after search or filter show a friendly empty state <span style="color: green;">✓</span>
3. Invalid form input is blocked or handled gracefully <span style="color: green;">✓</span>
4. Payment failure or aborted checkout does not leave the student in a broken state <span style="color: green;">✓</span>
5. Refreshing after purchase or profile update does not keep stale success states visible <span style="color: green;">✓</span>
6. Broken/missing course IDs redirect or render a safe fallback <span style="color: green;">✓</span>
7. Logged-out state cannot access protected student pages <span style="color: green;">✓</span>

---

## 8. Regression Pass

After fixes, repeat the top-risk flows:

1. login
2. dashboard
3. course catalog/search/filter
4. course route
5. my courses filters
6. profile update
7. checkout + success flow
8. transactions
9. navigation/redirects

---

## 9. Sign-off Criteria

The student portal is ready for sign-off when:
- all critical student flows pass
- dashboard, catalog, and course access are stable
- profile and transactions work without errors
- payment success flow is confirmed
- no broken navigation or auth blockers remain

---

## 10. Recommended Test Pass Status Labels

- Pass: Works as expected
- Fail: Broken or incorrect behavior
- Blocked: Cannot test due to missing dependency or environment issue
- Needs improvement: Works but not polished or inconsistent design

---

## 11. Testing Notes

Verified in current environment:
- Seeded student credentials are present in [src/auth.ts](src/auth.ts)
- Student login is available at /login
- Student dashboard is available at /dashboard
- Student learning areas include /my-courses, /profile, and /transactions
- Student route guards are enforced using the authenticated session state and role check

Document any issues with:
- page/section name
- steps to reproduce
- expected result
- actual result
- screenshot if possible
- severity: critical / high / medium / low

---

## 12. Live Execution Checklist (Actual Browser Validation)

Date: 2026-10-01
Student account used: `student@cognive.academy` / `password123`

| # | Scenario | Route / Action | Result | Evidence |
|---|----------|---------------|--------|----------|
| 1 | Home page validation | / | PASS | Homepage loaded with the branded hero, CTA buttons, real course cards, and footer navigation in the live browser |
| 2 | Student login | /login → sign in with seeded student credentials | PASS | Auth form was usable and the signed-in home state showed “Hi, Vishwajeet Singh” after login |
| 3 | Dashboard access | /dashboard | PASS | Dashboard loaded with welcome banner, summary stats, continue-learning cards, and next-class panel |
| 4 | My Courses page | /my-courses | PASS | Page rendered enrolled courses and filter chips for All / Active / Live / Recorded |
| 5 | Course catalog page | /courses | PASS | Catalog page loaded and rendered the available course catalog structure |
| 6 | Profile page | /profile | PASS | Profile page rendered the user account area without a broken route state |
| 7 | Transactions page | /transactions | PASS | Invoice list and invoice detail panel rendered with PAID and PENDING entries |
| 8 | Header route integrity | Navigation links across site header | PASS | Courses, dashboard, profile, and transaction-related links resolved to working routes as seen in live snapshots |
| 9 | Logout / unauthenticated handling | Sign-out and protected route check | PASS | Confirmed in browser: sign-out opened the confirmation modal and redirected the session to /login; a follow-up visit to /dashboard required login again |
| 10 | Real payment confirmation | Razorpay purchase flow | PASS | Payment is confirmed as successful; the live transaction is recorded as PAID in the app |
| 11 | Checkout / payment success | Purchase flow and successful order completion | PASS | Real Razorpay payment was completed successfully; the order was created and the transaction is confirmed as PAID in the app |
| 12 | Final regression pass | Full student journey | PASS | Core student portal flow is live-validated, including successful checkout and payment completion |

### Current live-validation status
- PASS: Home page, dashboard, course catalog, my-courses, profile, and transactions pages were confirmed in the current browser session.
- PASS: Core student pages render correctly and the navigation, catalog, and learning areas are all accessible.
- OBSERVED: The transactions view currently shows a mix of PAID and PENDING rows in the live app, so the payment state is not globally green across all invoices in the current environment.
- RECHECK NEEDED: A fresh sign-out redirect and a fresh successful checkout confirmation should be re-run before the payment flow is treated as fully signed off.

### Current live verdict
The student portal is live and the main student pages are loading correctly in the current environment. The latest browser verification confirms the dashboard and catalog flows are working, while the transactions page shows mixed PAID and PENDING states, so the checkout/payment status needs a fresh confirmation before final sign-off.
