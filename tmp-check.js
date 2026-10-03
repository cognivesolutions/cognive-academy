const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const course = await prisma.course.findUnique({
    where: { slug: 'software-development-ii' },
    include: {
      modules: {
        include: {
          lectures: true,
        },
      },
    },
  });

  console.log(JSON.stringify({
    found: !!course,
    title: course?.title ?? null,
    moduleCount: course?.modules?.length ?? 0,
    lectureCount: course?.modules?.reduce((sum, m) => sum + (m.lectures?.length ?? 0), 0) ?? 0,
    modules: course?.modules?.map((m) => ({
      title: m.title,
      lectures: m.lectures.map((l) => ({
        title: l.title,
        liveSessionUrl: l.liveSessionUrl,
        hlsUrl: l.hlsUrl,
        videoUrl: l.videoUrl,
      })),
    })) ?? [],
  }, null, 2));

  await prisma.$disconnect();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
