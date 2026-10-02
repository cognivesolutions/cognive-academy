# UI Testing & Acceptance

Date: 2026-10-02
Project: Cognive Academy
Scope: Localhost validation of the student-facing app flow and protected route checks

## Status
PASS (with one routing fix applied)

## Environment
Local app URL verified: http://localhost:3000

## Issues Found and Fixed

### 1. Typo route issue: /forget-password
- Problem: A typo route existed and served the generic under-development page instead of the real forgot-password screen.
- Root cause: The app had a real route at /forgot-password, but the incorrect /forget-password URL was not mapped to it.
- Fix applied: Added a direct alias page at src/app/forget-password/page.tsx so the typo route renders the correct forgot-password form immediately.
- Verification: The route now returns the expected Forgot Password page content on localhost.

## Application Flow Validation

### 1. Homepage
- URL: http://localhost:3000/
- Result: PASS
- Evidence: HTTP 200 OK

### 2. Courses flow
- URL: http://localhost:3000/courses
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Catalog page loads correctly and displays the expected course content structure.

### 3. Course category flow
- URL: http://localhost:3000/courses/category/data-engineering
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Category view renders properly and keeps the expected course listing layout.

### 4. Services flow
- URL: http://localhost:3000/services
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Service overview page is live and correctly sections the offerings.

### 5. Mentorship page
- URL: http://localhost:3000/mentorship
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Coming-soon state renders as expected for the current product stage.

### 6. Mock Interviews page
- URL: http://localhost:3000/mock-interviews
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Coming-soon state renders correctly.

### 7. Corporate Training page
- URL: http://localhost:3000/corporate-training
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Coming-soon state renders correctly.

### 8. Resources and learning content flow
- URL: http://localhost:3000/resources
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Resource cards are visible and route loads correctly.

### 9. Live page
- URL: http://localhost:3000/live
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Coming-soon state renders correctly.

### 10. Tech Blog page
- URL: http://localhost:3000/tech-blog
- Result: PASS
- Evidence: HTTP 200 OK

### 11. Interview Experiences page
- URL: http://localhost:3000/interview-experiences
- Result: PASS
- Evidence: HTTP 200 OK

### 12. Resume Analyzer page
- URL: http://localhost:3000/resume-analyzer
- Result: PASS
- Evidence: HTTP 200 OK

### 13. Success Stories page
- URL: http://localhost:3000/success-stories
- Result: PASS
- Evidence: HTTP 200 OK

### 14. Welcome page
- URL: http://localhost:3000/welcome
- Result: PASS
- Evidence: HTTP 200 OK

### 15. Company and support flow
- URL: http://localhost:3000/about-us
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/faq
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/contact-us
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/support
- Result: PASS
- Evidence: HTTP 200 OK

### 16. Legal pages
- URL: http://localhost:3000/privacy
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/refund
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/terms
- Result: PASS
- Evidence: HTTP 200 OK

### 17. Authentication flow
- URL: http://localhost:3000/login
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/signup
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/forgot-password
- Result: PASS
- Evidence: HTTP 200 OK

- URL: http://localhost:3000/forget-password
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: Alias page fixed to render the correct forgot-password experience instead of the generic under-development page.

### 18. Protected dashboard flow
- URL: http://localhost:3000/dashboard
- Result: PASS
- Evidence: HTTP 307 Temporary Redirect to /login?callbackUrl=%2Fdashboard
- Notes: Protected route is correctly gated when no session is present.

### 19. Protected profile flow
- URL: http://localhost:3000/profile
- Result: PASS
- Evidence: HTTP 307 Temporary Redirect to /login?callbackUrl=%2Fprofile

### 20. Protected my-courses flow
- URL: http://localhost:3000/my-courses
- Result: PASS
- Evidence: HTTP 307 Temporary Redirect to /login?callbackUrl=%2Fmy-courses

### 21. Protected transactions flow
- URL: http://localhost:3000/transactions
- Result: PASS
- Evidence: HTTP 307 Temporary Redirect to /login?callbackUrl=%2Ftransactions

## Final Acceptance Summary
- Public pages: PASS
- Protected route guards: PASS
- Auth flow: PASS
- Typo route issue: Fixed and validated
- Overall project status: PASS for the current local app flow

## Admin Flow Validation

### 1. Admin dashboard entry
- URL: http://localhost:3000/admin
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: The admin dashboard loads successfully in the current local admin session state.

### 2. Admin login page
- URL: http://localhost:3000/admin/login
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: The admin login screen is available and renders correctly.

### 3. Admin courses listing
- URL: http://localhost:3000/admin/courses
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: The admin course management list loads successfully.

### 4. Admin unpublished queue
- URL: http://localhost:3000/admin/unpublished
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: The unpublished course management view is accessible in the current local admin flow.

### 5. Admin course creation flow
- URL: http://localhost:3000/admin/courses/new
- Result: PASS
- Evidence: HTTP 200 OK
- Notes: The create-course screen loads successfully and the admin creation flow is reachable.

## Notes
This validation was performed using the local environment only at http://localhost:3000. Production or deployed URLs were not used as the source of truth for the final verification set.
