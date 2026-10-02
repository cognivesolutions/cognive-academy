# STUDENT UI TESTING & ACCEPTANCE

Date: 2026-10-02
Project: Cognive Academy
Scope: Localhost validation of the student-facing app flow and protected student routes

## Status
PASS

## Environment
Local app URL verified: http://localhost:3000

## Issues Found and Fixed

### 1. Forgot-password typo route
- Problem: A typo route existed at /forget-password and it was not properly mapped to the real password reset page.
- Root cause: The app had the correct route at /forgot-password, but the typo alias was missing.
- Fix applied: Added the alias page at src/app/forget-password/page.tsx to render the same forgot-password experience.
- Verification: HTTP 200 OK on localhost for both /forgot-password and /forget-password.

### 2. Student protected-route redirect bug
- Problem: When a signed-in student clicked Dashboard, My Courses, Transactions, or Profile, the app sometimes redirected back to the login page instead of staying on the protected page.
- Root cause: The proxy guard was reading auth through the request object instead of the normal server-side `auth()` call, so it could miss the actual session in the current app setup.
- Fix applied: Updated the guard in src/proxy.ts to use the canonical server-side auth state for the request context.
- Verification: Fresh localhost validation shows a student login from /login?callbackUrl=%2Fdashboard succeeds and the user lands on /dashboard with authenticated dashboard content.

### 3. Stale localhost auth state
- Problem: The previous localhost dev server was still serving older redirect behavior even after the code was updated.
- Root cause: A stale dev instance was still running on localhost and had cached the older auth flow.
- Fix applied: Stopped the stale server and restarted the local app so it served the latest code.
- Verification: The app now returns the authenticated student dashboard and session JSON from /api/auth/session on localhost.

## Student Flow Validation

### 1. Homepage
- URL: http://localhost:3000/
- Result: PASS
- Evidence: HTTP 200 OK

### 2. Courses page
- URL: http://localhost:3000/courses
- Result: PASS
- Evidence: HTTP 200 OK

### 3. Course category page
- URL: http://localhost:3000/courses/category/data-engineering
- Result: PASS
- Evidence: HTTP 200 OK

### 4. Services page
- URL: http://localhost:3000/services
- Result: PASS
- Evidence: HTTP 200 OK

### 5. Mentorship page
- URL: http://localhost:3000/mentorship
- Result: PASS
- Evidence: HTTP 200 OK

### 6. Mock interviews page
- URL: http://localhost:3000/mock-interviews
- Result: PASS
- Evidence: HTTP 200 OK

### 7. Corporate training page
- URL: http://localhost:3000/corporate-training
- Result: PASS
- Evidence: HTTP 200 OK

### 8. Resources page
- URL: http://localhost:3000/resources
- Result: PASS
- Evidence: HTTP 200 OK

### 9. Live page
- URL: http://localhost:3000/live
- Result: PASS
- Evidence: HTTP 200 OK

### 10. Tech blog page
- URL: http://localhost:3000/tech-blog
- Result: PASS
- Evidence: HTTP 200 OK

### 11. Interview experiences page
- URL: http://localhost:3000/interview-experiences
- Result: PASS
- Evidence: HTTP 200 OK

### 12. Resume analyzer page
- URL: http://localhost:3000/resume-analyzer
- Result: PASS
- Evidence: HTTP 200 OK

### 13. Success stories page
- URL: http://localhost:3000/success-stories
- Result: PASS
- Evidence: HTTP 200 OK

### 14. Welcome page
- URL: http://localhost:3000/welcome
- Result: PASS
- Evidence: HTTP 200 OK

### 15. About us page
- URL: http://localhost:3000/about-us
- Result: PASS
- Evidence: HTTP 200 OK

### 16. FAQ page
- URL: http://localhost:3000/faq
- Result: PASS
- Evidence: HTTP 200 OK

### 17. Contact us page
- URL: http://localhost:3000/contact-us
- Result: PASS
- Evidence: HTTP 200 OK

### 18. Support page
- URL: http://localhost:3000/support
- Result: PASS
- Evidence: HTTP 200 OK

### 19. Privacy page
- URL: http://localhost:3000/privacy
- Result: PASS
- Evidence: HTTP 200 OK

### 20. Refund page
- URL: http://localhost:3000/refund
- Result: PASS
- Evidence: HTTP 200 OK

### 21. Terms page
- URL: http://localhost:3000/terms
- Result: PASS
- Evidence: HTTP 200 OK

### 22. Login page
- URL: http://localhost:3000/login
- Result: PASS
- Evidence: HTTP 200 OK

### 23. Signup page
- URL: http://localhost:3000/signup
- Result: PASS
- Evidence: HTTP 200 OK

### 24. Forgot password page
- URL: http://localhost:3000/forgot-password
- Result: PASS
- Evidence: HTTP 200 OK

### 25. Forgotten-password alias page
- URL: http://localhost:3000/forget-password
- Result: PASS
- Evidence: HTTP 200 OK

### 26. Protected dashboard route
- URL: http://localhost:3000/dashboard
- Result: PASS
- Evidence: Fresh validation with a signed-in student user shows the app loads the authenticated dashboard rather than redirecting to the login page.
- Redirect target after unauthenticated request: /login?callbackUrl=%2Fdashboard

### 27. Protected profile route
- URL: http://localhost:3000/profile
- Result: PASS
- Evidence: Fresh validation with a signed-in student user loads the profile page correctly.
- Redirect target after unauthenticated request: /login?callbackUrl=%2Fprofile

### 28. Protected my-courses route
- URL: http://localhost:3000/my-courses
- Result: PASS
- Evidence: Fresh validation with a signed-in student user loads the My Courses page correctly.
- Redirect target after unauthenticated request: /login?callbackUrl=%2Fmy-courses

### 29. Protected transactions route
- URL: http://localhost:3000/transactions
- Result: PASS
- Evidence: Fresh validation with a signed-in student user loads the Transactions page correctly.
- Redirect target after unauthenticated request: /login?callbackUrl=%2Ftransactions

### 30. Course catalog search and chip filtering
- URL: http://localhost:3000/courses
- Result: PASS
- Evidence: Search box is present on the catalog page; typed queries filter results; when a search leaves no matches in a currently selected chip, that chip dims/gets disabled rather than leading to a dead state. The current chip is preserved while the user searches.
- Notes: This matches the requested behavior for live/recorded chip filtering and search interaction.

### 31. Checkout and purchase flow
- URL: http://localhost:3000/courses/<course-slug>
- Result: PASS
- Evidence: Logged in student flow was validated on localhost. The Razorpay modal successfully rendered payment options including UPI, Cards, EMI, Netbanking, Wallet, Pay Later, and UPI QR. After payment, the user is redirected away from the course buy page to the success state and shown the final confirmation screen after a short 2–3 second delay.
- Notes: This flow was validated against the local app and the app behavior matches the intended purchase experience.

### 32. Real student login and protected-route verification
- URL: http://localhost:3000/login?callbackUrl=%2Fdashboard
- Result: PASS
- Evidence: Fresh browser validation used the student account student@cognive.academy / password123 and confirmed the app redirected to http://127.0.0.1:3000/dashboard and rendered authenticated dashboard content. `/api/auth/session` returned the valid student session payload.
- Acceptance: The protected student routes now work correctly for an authenticated student on localhost.

## Final Acceptance Summary
- Public student pages: PASS
- Auth pages: PASS
- Protected student routes: PASS
- Typo route fix: PASS
- Course catalog search and chips: PASS
- Checkout and purchase flow: PASS
- Any remaining student-flow issues found during local validation: NONE
- Overall student flow status: PASS for the current localhost build

## Notes
This validation was performed using the local environment only at http://localhost:3000. Production or deployed URLs were not used as the source of truth for the final verification set.

## Final verdict
There are no open student-flow issues left in the current localhost build after the final review. The student experience is complete and accepted for the verified local app state.
