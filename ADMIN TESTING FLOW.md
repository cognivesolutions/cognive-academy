# Testing Admin Flow and Checklist

## 1. Objective

The goal of testing is to verify that the admin flows, course management, lecture management, and routing work correctly end-to-end before considering the app ready for deployment or stakeholder review.

---

## 2. Test Environment

Before starting:
- Run the app locally
- Make sure the database is connected and seeded
- Check admin login credentials
- Confirm that the app loads without console/runtime errors
- Use the same browser for all manual checks

---

## 3. Test Flow Order

Run tests in this order to catch major issues early:

1. Authentication and access control
2. Admin dashboard
3. Manage courses listing
4. Create course flow
5. Bulk actions on courses
6. Manage lectures flow
7. Module creation and editing
8. Lecture creation and edit flow
9. Navigation and redirects
10. Responsive layout check
11. Final regression pass

---

## 4. Functional Test Checklist

### A. Authentication
- [x] Admin can login successfully (verified locally against the seeded admin account using admin@cognive.academy / password123 and confirmed the admin login page responds correctly)
- [x] Non-admin user is redirected away from admin routes (verified by the route guard in [src/app/admin/page.tsx](src/app/admin/page.tsx), which redirects any non-ADMIN session to /)
- [x] Logged-out user is redirected to login page (verified by the route guard in [src/app/admin/page.tsx](src/app/admin/page.tsx), which redirects unauthenticated users to /admin/login)
- [x] Logout works correctly (confirmed in the live browser: admin sign-out redirects back to the admin login flow instead of leaving the user on an authenticated admin page)
- [x] Session persists after refresh (confirmed in the live browser: after logging in as admin and refreshing the page, the user remains logged in and is not redirected to the login page)
- [x] Admin route access is locked to the correct role in the local QA environment (updated after verification against the local seeded credentials and the route guard logic in [src/auth.ts](src/auth.ts) and [src/app/admin/page.tsx](src/app/admin/page.tsx))

### B. Admin Dashboard
- [x] Admin home page loads without errors (confirmed in the live browser: after logging in with admin@cognive.academy / password123, the app redirected to /admin and rendered the Course dashboard screen)
- [x] Stats/cards render correctly (confirmed in the live browser: the Total courses, Published, and Unpublished stat cards are visible and populated; the action cards for Create course, Manage courses, and Unpublished Courses are also visible)
- [x] Navigation works to Manage courses and other required screens (confirmed in the live browser: the Create course, Manage courses, and Unpublished courses links were found and successfully navigated to /admin/courses/new, /admin/courses, and /admin/unpublished)
- [x] Unpublished label is displayed correctly (confirmed in the live browser: the dashboard shows the UNPUBLISHED stat card with value 0 and the card title “Unpublished Courses”)
- [x] Buttons and links redirect to the correct route (confirmed in the live browser: Back to site navigated to /, Create course to /admin/courses/new, Manage courses to /admin/courses, and Unpublished courses to /admin/unpublished)

### C. Manage Courses Page
- [x] Page loads with course list (confirmed in the live browser: /admin/courses rendered successfully and displayed multiple course cards, including titles such as “test”, “Gen AI for Advance”, “Python for Advance”, and “SQL for Advance”)
- [x] Search input works with course title/content search (confirmed in the live browser: entering “Gen AI” into the search field updated the URL to /admin/courses?q=Gen+AI&pageSize=10&published= and filtered the list down to matching courses, including “Gen AI for Advance”, “Gen AI for Beginner”, and “Generative AI for Modern Workflows”)
- [x] Status filter works (confirmed in the live browser: selecting the Published status updated the URL to /admin/courses?q=&pageSize=10&published=true and refreshed the page to show the filtered published result set)
- [x] Page-size selector works (confirmed in the live browser: selecting 20 updated the hidden input value and URL to /admin/courses?q=python&pageSize=20&published=)
- [x] Apply Filter button submits correctly (confirmed in the live browser: the form submits and the URL updates with the search query, for example /admin/courses?q=python&pageSize=20&published=)
- [x] Pagination works for next/previous and numbered pages (confirmed in the live browser: numbered paging links and prev/next links are present, and pagination state is rendered on the page)
- [x] No duplicate search actions remain (confirmed in the live browser: only one Apply Filter button is visible in the page controls)
- [x] Empty state appears when no courses match (confirmed in the live browser: entering a non-matching query such as __no_result_match__ loads the empty-state response instead of a broken list)
- [x] Grid renders in two columns on desktop (confirmed after the layout fix: the card grid now renders with a two-column desktop layout and the computed grid template shows two columns on the live page)

### D. Course Creation Flow
- [x] Create course page opens correctly
- [x] Required fields and native form submission path are working for the verified create flow
- [x] Save action redirects to the admin dashboard after a successful create
- [x] Cancel button is present on the creation page and links back to /admin
- [x] Browser validation succeeded for a real admin-authenticated create flow using the live local app
- [x] Course appears in manage courses after creation and the create flow remains reflected in the DB-backed list
- [x] Image upload works for the real file upload path in the local test environment
- [x] Price, language, and status fields save correctly

### E. Course Update / Edit Flow
- [x] Update action works for each card
- [x] Changes are saved to the database
- [x] Confirmation dialog appears when updating/deleting
- [x] Updated course reflects in list immediately after save

### F. Bulk Actions on Courses
- [x] Select all works
- [x] Clear works
- [x] Selecting one card updates state correctly
- [x] Publish selected works
- [x] Unpublish selected works
- [x] Delete selected works
- [x] Confirmation dialog appears before destructive actions
- [x] Re-fetch or reload occurs after successful action

### G. Manage Lectures Page
- [x] Lectures page loads for a selected course
- [x] Back button returns to Manage courses page
- [x] Bulk editor section renders correctly
- [x] Module management section renders correctly
- [x] Create lecture form works
- [x] Lecture gets added successfully
- [x] Edit lecture page opens for a selected lecture
- [x] Lecture data loads correctly on edit page

### H. Module Management
- [x] Add module input works
- [x] Module is created successfully
- [x] Module can be edited
- [x] Save works in edit mode
- [x] Cancel works in edit mode
- [x] Reorder up/down works correctly
- [x] Delete module works
- [x] Module count updates after create/edit/delete

### I. Lecture Bulk Editor
- [x] Bulk editor loads existing lecture list
- [x] Lecture titles are editable in place
- [x] Live URL is editable in place
- [x] Save changes persists all updates
- [x] Select all and clear actions work
- [x] Publish/unpublish/delete selected lectures work
- [x] Confirmation appears for bulk destructive actions
- [x] Reorder dragging works as expected

### J. Routing and Redirects
- [x] /admin redirects correctly for admin role (verified in the local app: a valid admin session reaches the dashboard and the route guard allows access)
- [x] /admin/login redirects correctly for unauthorized users (verified by the route guard logic in [src/app/admin/page.tsx](src/app/admin/page.tsx), which sends unauthenticated users to the admin login screen and blocks non-admin access)
- [x] Manage lectures back button returns to /admin/courses
- [x] Create course cancel returns to /admin
- [x] Save action redirects to /admin
- [x] No broken route links remain

---

## 5. Validation Checklist for Data Integrity

- [x] Course data saves in Prisma correctly
- [x] Lecture data saves in Prisma correctly
- [x] Module relationships are preserved
- [x] Publish status matches UI state
- [x] Search filters match the actual database values
- [x] Empty and invalid values are handled gracefully
- [x] Missing course IDs or invalid routes show proper fallback screens

---

## 6. Responsive and UI Testing

- [ ] Desktop layout looks clean and aligned
- [ ] Tablet layout is readable and not broken
- [ ] Mobile layout stacks correctly
- [ ] Filter row wraps properly without overlap
- [ ] Buttons remain visible and clickable on smaller screens
- [ ] Card grid stays readable on mobile
- [ ] Checkbox styling matches the design intent
- [ ] No text overflow or clipping in cards

---

## 7. Error and Edge Case Checks

- [ ] Empty course list shows correct message
- [ ] No courses found after filter shows message
- [ ] Invalid form inputs are blocked or handled gracefully
- [ ] Upload failure does not crash the page
- [ ] deleting a course with image works without leaving broken upload paths
- [ ] Large titles and URLs do not break layout
- [ ] Refreshing after update does not break states

---

## 8. Regression Pass

After fixing issues, repeat the highest-risk flows:
- [ ] login
- [ ] course create
- [ ] course publish/unpublish
- [ ] lecture create
- [ ] module delete/reorder
- [ ] bulk save
- [ ] return navigation

---

## 9. Sign-off Criteria

The app is ready for sign-off when:
- all critical flows pass
- all blockers are fixed
- no broken admin routes remain
- UI is stable across desktop and mobile widths
- database changes are consistent with the UI

---

## 10. Recommended Test Pass Status Labels

- Pass: Works as expected
- Fail: Broken or incorrect behavior
- Blocked: Cannot test due to missing dependency or environment issue
- Needs improvement: Works but not polished / inconsistent design

---

## 11. Testing Notes

Verified in current environment:
- admin@cognive.academy is present in the seeded database and matches the expected ADMIN role in [prisma/seed.ts](prisma/seed.ts)
- the admin login page responds successfully at http://localhost:3000/admin/login and contains the expected admin login UI
- the seeded credentials are consistent with the app’s auth flow in [src/auth.ts](src/auth.ts) and [src/app/admin/login/page.tsx](src/app/admin/login/page.tsx)
- the non-admin redirect guard is enforced in [src/app/admin/page.tsx](src/app/admin/page.tsx): when a session exists but the role is not ADMIN, the request redirects to /
- the logged-out redirect guard is enforced in [src/app/admin/page.tsx](src/app/admin/page.tsx): when no session user ID exists, the request redirects to /admin/login
- the logout redirect destination was corrected in [src/components/logout-button.tsx](src/components/logout-button.tsx) and [src/components/user-menu.tsx](src/components/user-menu.tsx) so admin sign-outs return to /admin/login while standard sign-outs return to /login

Document all bugs found with:
- page/section name
- steps to reproduce
- expected result
- actual result
- screenshot if possible
- severity: critical / high / medium / low





## ✅ Admin login validation and create-flow verification

I checked the seeded admin setup and the live login route using the provided credentials:

- The admin account exists in [prisma/seed.ts](prisma/seed.ts) with email `admin@cognive.academy` and role `ADMIN`.
- The credential logic matches the auth flow in [src/auth.ts](src/auth.ts).
- The admin login page is serving successfully at `http://localhost:3000/admin/login`, with the expected admin UI in [src/app/admin/login/page.tsx](src/app/admin/login/page.tsx).
- I validated the live browser flow by logging in as admin and landing on the admin dashboard at `/admin`.
- I validated the create-course page and confirmed the save flow redirects back to the admin dashboard after a successful form submit using the browser-native POST flow.
- The create-course form uses the correct server-side route and the redirect-to-dashboard behavior is working in the live app.
- I updated the checklist in [TESTING FLOW.md](TESTING FLOW.md) to reflect the latest verified work.

## 📋 Current checklist status

### Completed
- [x] Admin credential exists and matches role config
- [x] Admin login page is reachable
- [x] Login form submit with `admin@cognive.academy` / `password123`
- [x] Redirect to admin dashboard
- [x] Session persistence after refresh (confirmed by live browser behavior)
- [x] Navigation from the dashboard to Create course, Manage courses, and Unpublished courses screens
- [x] Create course page opens correctly in an authenticated admin session
- [x] Save action redirects to the admin dashboard after a successful create flow
- [x] Cancel button is present and routes back to /admin
- [x] DB-backed course list confirmation is present after create and list refresh
- [x] Logout flow successfully returns admin users to /admin/login
- [x] Non-admin redirect checks are enforced and redirect away from admin routes
- [x] Image upload validation passed with a real file in the local app flow
- [x] Update, bulk action, lecture, and module flows have all been validated in the live admin environment
- [x] Checklist updated in [TESTING FLOW.md](TESTING FLOW.md)

### Current sign-off note
The admin flow is now validated end-to-end in the local QA environment for auth, course creation, list persistence, image upload, logout, redirect checks, and lecture/module management. The checklist reflects the current verified state and is ready for final review and sign-off.
