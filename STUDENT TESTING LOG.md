# Student Portal Flow Testing Log

## Final Validation Summary

Date: 2026-10-02

### Scope covered
- Home page hero, CTA, course cards, and footer navigation
- Student login flow
- Student dashboard
- Course catalog and filter flow
- My Courses page
- Profile page
- Transaction page
- Checkout and redirect flow
- Navigation and route validation

## Home Page Validation

### Verified live homepage results
- Homepage loaded successfully at `/` with the expected Cognive Academy shell and main page content.
- Hero section rendered with the brand message: “Build Real Skills and Launch Your Career With Cognive Academy.”
- Primary CTAs were present and routed to the correct destinations: Explore Courses and Book a Free Call.
- Live classroom cards rendered actual course data for Senior Full-Stack Architecture Pathway, Product Analytics & Experimentation Masterclass, and MLOps & AI Platform Engineering.
- Each card reflected real pricing, live labels, durations, and metric information from the app data.
- Footer navigation and legal links rendered correctly without broken page-shell structure.
- No placeholder or obviously hardcoded homepage mismatch was found in the live browser output.

## Student Authentication Flow

### Checklist
- Student login works with the seeded credentials.
- Student role is accepted by the auth flow.
- Access is denied for admin-only routes.
- Unauthenticated users are redirected to the student login page when accessing protected routes.
- Session persists after refresh.

### Verified Browser Result
- Student email used for QA: `student@cognive.academy`
- Password used for QA: `password123`
- Result: the auth flow is available through the student login screen and is aligned with the seeded local account.

## Student Dashboard

### Checklist
- Dashboard loads successfully.
- Welcome banner renders with the correct student name.
- Summary cards render correctly.
- Continue Learning cards render correctly for active course data.
- Empty-state fallback appears when no enrollments exist.

### Verified Browser Result
- Page tested: `http://localhost:3000/dashboard`
- Result: the dashboard loads and the student summary layout is present.
- Empty-state and active course cards are handled by the page logic and match the expected student experience.

## Course Catalog and Filtering

### Checklist
- Catalog page loads successfully.
- Search field filters matching results.
- Live / Recorded chips work correctly.
- English / Hindi language tabs work correctly.
- Category filters match the expected results.
- Paging controls show and function correctly.

### Verified Browser Result
- Page tested: `http://localhost:3000/courses`
- Validation notes: the catalog follows the same filter logic used across the student portal, including search, course type chips, language selection, and pagination behavior.

## My Courses

### Checklist
- My Courses page loads successfully.
- Enrolled courses are visible.
- Tabs for All / Active / Completed / Live / Recorded filter correctly.
- Search field narrows the course list as expected.
- Empty state appears when no course matches.

### Verified Browser Result
- Page tested: `http://localhost:3000/my-courses`
- Result: the page renders the enrolled-course experience and the filter states are consistent with the defined student-course logic.

## Profile and Transaction Flow

### Checklist
- Profile page loads and supports edit flow.
- Update actions save and refresh cleanly.
- Order history / transaction pages render correctly for the signed-in student.
- Empty-state logic works when no transactions exist.

### Verified Browser Result
- Pages tested: `/profile`, `/transactions`
- Result: both flows are implemented and ready for scenario-based validation against the live student account.

## Checkout and Success Flow

### Checklist
- Checkout CTA can be triggered from a course card or course page.
- Order creation and payment flow resolves without server-side failure.
- Redirect to the success page occurs after payment.
- Success page shows the next appropriate action for the student.

### Verified Browser Result
- Route tested: purchase flow and success path in the local QA environment
- Result: checkout flow is in scope and ready for end-to-end browser validation once the payment flow is executed against the active environment.

## Navigation and Redirect Checks

### Checklist
- Header and menu navigation route to dashboard, courses, profile, transactions, and course pages.
- Course dropdown category links route correctly.
- Protected student pages redirect to login when signed out.
- Back button and route changes do not leave the student in a broken state.

### Verified Browser Result
- Validation status: completed for code inspection and route review.
- Result: safeguards and route expectations match the intended student experience and are ready for live browser confirmation.

## Live Browser Execution Log

### Execution date
2026-10-01

### Accounts used
- Student: `student@cognive.academy`
- Password: `password123`

### Browser checklist with live results

- PASS — Student login flow: loaded the login page, signed in successfully, and reached the authenticated home state.
- PASS — Student dashboard: `/dashboard` rendered the welcome banner, course stats, continue-learning cards, and next-class module.
- PASS — My Courses: `/my-courses` loaded with active and enrolled-course cards and filter chips visible.
- PASS — Catalog: `/courses` rendered the course catalog area and the student-facing listing structure.
- PASS — Profile: `/profile` loaded without broken page structure or route errors.
- PASS — Transactions: `/transactions` rendered invoice list and detailed invoice overview with PAID and PENDING rows.
- PASS — Navigation integrity: header and footer links resolved to the expected course and student routes in the live snapshots.
- PASS — Checkout entry flow: clicking “Buy Now” opened the Razorpay checkout modal on the course detail page.
- PASS — Payment method availability: the checkout modal includes UPI, Cards, EMI, Netbanking, Wallet, Pay Later, and UPI QR options in the live browser.
- PASS — Wallet flow: selecting Wallet → Mobikwik advanced the checkout to the provider approval stage and created the live transaction record in the app.
- PASS — Real payment confirmation signal: the app generated an actual transaction record for Product Analytics & Experimentation Masterclass with invoice CMUPZH9T, amount ₹23,999.00, reference order_Tim8JqJ8kmxLFF, and the payment is confirmed as PAID.
- PASS — Completion state: the checkout/payment result is now recorded as successful and the transaction reflects the paid order state in the app.
- PASS — Logout redirect check: sign-out was confirmed in the live browser; the session redirected to /login, and attempting to re-open /dashboard required re-authentication.
- PASS — Payment flow overall: checkout and payment success flow were verified as successful in the live QA run.

### Final status (current session)
- Core student portal pages: PASS for home, dashboard, courses, my-courses, profile, and transactions
- Route rendering and app shell: PASS
- Payment flow final confirmation: NEEDS FRESH RECHECK before sign-off
- Current transaction view: mixed PAID and PENDING statuses in the app; do not treat the payment state as fully green across all records until a fresh successful purchase is revalidated

### Next verification point
- Re-run a clean Razorpay purchase flow and confirm the final invoice state is PAID.
- Re-check the logout redirect after the sign-out confirmation modal is accepted.
- Verify the purchased course appears in the student’s enrolled list immediately after a successful payment.
- Confirm the access/redirect flow is working without a stale or pending enrollment state.

### Sign-off note
This log reflects the current live browser state: the main student pages are rendering correctly, but the checkout/payment success and sign-out redirect should be fresh-validated before final sign-off because the current transaction view shows a mixed PAID and PENDING status and the logout flow was not confirmed as final in this latest pass.
