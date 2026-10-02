const { PrismaClient } = require('./node_modules/@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        isNew: true,
        isPromotional: true,
        isBestValue: true,
        featured: true,
        isPublished: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    });
    console.log(JSON.stringify(courses, null, 2));
  } finally {
    await prisma.$disconnect();
  }
})();
