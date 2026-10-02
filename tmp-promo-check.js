const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const courses = await prisma.course.findMany({
      where: { isPromotional: true },
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        offerPrice: true,
        isPromotional: true,
        promoCode: true,
        currency: true,
      },
    });

    console.log('PROMO_COURSES', JSON.stringify(courses, null, 2));
  } finally {
    await prisma.$disconnect();
  }
})();
