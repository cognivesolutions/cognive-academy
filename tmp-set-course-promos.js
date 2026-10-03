const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  {
    slug: 'distributed-systems-nodejs',
    data: {
      offerPrice: 14999,
      isPromotional: true,
      isBestValue: false,
      promoCode: 'DSNODE',
    },
  },
  {
    slug: 'react-nextjs-production-course',
    data: {
      offerPrice: 8999,
      isPromotional: true,
      isBestValue: false,
      promoCode: 'REACTPRO',
    },
  },
  {
    slug: 'full-stack-javascript-bootcamp',
    data: {
      offerPrice: 11999,
      isPromotional: true,
      isBestValue: true,
      promoCode: 'FULLSTACK',
    },
  },
];

async function main() {
  for (const item of updates) {
    const result = await prisma.course.update({
      where: { slug: item.slug },
      data: item.data,
    });

    console.log(`Updated ${result.title}: price=${result.price}, offerPrice=${result.offerPrice}, isPromotional=${result.isPromotional}, isBestValue=${result.isBestValue}, promoCode=${result.promoCode}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
