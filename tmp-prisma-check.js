const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    console.log('COURSE_COUNT', courses.length);
    console.log(JSON.stringify(courses, null, 2));
  } finally {
    await prisma.$disconnect();
  }
})();
