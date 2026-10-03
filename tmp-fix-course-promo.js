const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const row = await prisma.course.update({
    where: { slug: 'software-development-ii' },
    data: {
      isPromotional: true,
      isBestValue: true,
      offerPrice: 11999,
      promoCode: 'DEVII',
    },
  });

  console.log(JSON.stringify({
    title: row.title,
    price: row.price,
    offerPrice: row.offerPrice,
    isPromotional: row.isPromotional,
    isBestValue: row.isBestValue,
    promoCode: row.promoCode,
  }, null, 2));

  await prisma.$disconnect();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
