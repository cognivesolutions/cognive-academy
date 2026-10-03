const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({
    where: {
      category: {
        contains: 'software',
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      price: true,
      offerPrice: true,
      isPromotional: true,
      isBestValue: true,
      promoCode: true,
      isPublished: true,
    },
  });

  console.log(JSON.stringify(courses, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
