const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    orderBy: { id: 'asc' },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      isPromotional: true,
      offerPrice: true,
      promoCode: true,
    },
  });

  if (!course) {
    throw new Error('No course found in the database.');
  }

  const basePrice = Number(course.price ?? 0);
  const offerPrice = Math.max(1, Math.round(basePrice * 0.65));

  const updated = await prisma.course.update({
    where: { id: course.id },
    data: {
      isPromotional: true,
      offerPrice,
      promoCode: 'WELCOME10',
    },
  });

  console.log(JSON.stringify({
    id: updated.id,
    title: updated.title,
    slug: updated.slug,
    price: Number(updated.price),
    offerPrice: Number(updated.offerPrice),
    isPromotional: updated.isPromotional,
    promoCode: updated.promoCode,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error('Failed to set test promo course:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
