-- Keep the internal primary key as-is and add readable business IDs alongside it.
-- This avoids breaking Prisma relations and app code while still giving each record a human-friendly ID.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "courseId" TEXT;
ALTER TABLE "modules" ADD COLUMN IF NOT EXISTS "moduleId" TEXT;
ALTER TABLE "lectures" ADD COLUMN IF NOT EXISTS "lectureId" TEXT;
ALTER TABLE "lecture_progress" ADD COLUMN IF NOT EXISTS "lectureProgressId" TEXT;
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "orderId" TEXT;
ALTER TABLE "enrollments" ADD COLUMN IF NOT EXISTS "enrollmentId" TEXT;
ALTER TABLE "saved_courses" ADD COLUMN IF NOT EXISTS "savedCourseId" TEXT;
ALTER TABLE "otp_verifications" ADD COLUMN IF NOT EXISTS "otpVerificationId" TEXT;

-- Backfill the business IDs using a deterministic sequence pattern.
-- Existing values should be replaced with the final business IDs as required by your admin setup.

UPDATE "users"
SET "userId" = 'COG' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "id") AS TEXT), 6, '0')
WHERE "userId" IS NULL;

UPDATE "courses"
SET "courseId" = 'COURSE' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "id") AS TEXT), 6, '0')
WHERE "courseId" IS NULL;

UPDATE "orders"
SET "orderId" = 'ORD' || LPAD(CAST(ROW_NUMBER() OVER (ORDER BY "id") AS TEXT), 6, '0')
WHERE "orderId" IS NULL;

ALTER TABLE "users" ADD CONSTRAINT "users_userId_key" UNIQUE ("userId");
ALTER TABLE "courses" ADD CONSTRAINT "courses_courseId_key" UNIQUE ("courseId");
ALTER TABLE "orders" ADD CONSTRAINT "orders_orderId_key" UNIQUE ("orderId");
