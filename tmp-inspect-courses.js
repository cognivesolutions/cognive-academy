const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    select: {
      slug: true,
      title: true,
      price: true,
      offerPrice: true,
      isPromotional: true,
      isBestValue: true,
    },
  });

  console.log(JSON.stringify(
    courses.map((course) => ({
      slug: course.slug,
      title: course.title,
      price: course.price,
      offerPrice: course.offerPrice,
      isPromotional: course.isPromotional,
      isBestValue: course.isBestValue,
      eligible: Boolean(
        course.isPromotional &&
        course.offerPrice !== null &&
        course.offerPrice !== undefined &&
        course.offerPrice > 0 &&
        course.offerPrice < course.price,
      ),
    })),
    null,
    2,
  ));

  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
