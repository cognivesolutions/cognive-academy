-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isLive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" TEXT NOT NULL DEFAULT 'en';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "courseReminders" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "securityAlerts" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "saved_courses" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_courses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "saved_courses_userId_idx" ON "saved_courses"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "saved_courses_userId_courseId_key" ON "saved_courses"("userId", "courseId");

-- AddForeignKey
ALTER TABLE "saved_courses" ADD CONSTRAINT "saved_courses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_courses" ADD CONSTRAINT "saved_courses_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
