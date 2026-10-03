const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const course = await prisma.course.findUnique({
    where: { slug: 'software-development-ii' },
  });

  console.log(JSON.stringify({
    title: course?.title ?? null,
    price: course?.price ?? null,
    offerPrice: course?.offerPrice ?? null,
    isPromotional: course?.isPromotional ?? null,
    isBestValue: course?.isBestValue ?? null,
    promoCode: course?.promoCode ?? null,
  }, null, 2));

  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
