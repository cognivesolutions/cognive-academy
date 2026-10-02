-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "isPromotional" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "offerPrice" DOUBLE PRECISION,
ADD COLUMN     "promoCode" TEXT;
