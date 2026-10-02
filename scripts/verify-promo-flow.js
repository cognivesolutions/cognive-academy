const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const columns = await prisma.$queryRawUnsafe(`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_name = 'courses'
      AND column_name IN ('offerPrice', 'isPromotional', 'promoCode')
    ORDER BY column_name
  `);

  console.log("Schema columns:");
  console.log(JSON.stringify(columns, null, 2));

  const promoCourse = await prisma.course.findFirst({
    where: { isPromotional: true },
    select: {
      id: true,
      slug: true,
      title: true,
      price: true,
      offerPrice: true,
      isPromotional: true,
      promoCode: true,
    },
  });

  if (!promoCourse) {
    console.log("No promotional course found. Set one course as promotional in admin first, then rerun this script.");
    process.exit(1);
  }

  const issues = [];

  if (promoCourse.offerPrice == null || Number(promoCourse.offerPrice) >= Number(promoCourse.price)) {
    issues.push("offerPrice is missing or not lower than price");
  }

  if (!promoCourse.promoCode || !String(promoCourse.promoCode).trim()) {
    issues.push("promoCode is missing");
  }

  if (issues.length) {
    console.log("Promo validation failed:");
    for (const issue of issues) console.log(`- ${issue}`);
    process.exit(1);
  }

  const normalizedCode = String(promoCourse.promoCode).trim().toUpperCase();
  const expectedAmount = Number(promoCourse.offerPrice);

  console.log("Promo validation passed");
  console.log(JSON.stringify({
    id: promoCourse.id,
    slug: promoCourse.slug,
    title: promoCourse.title,
    price: Number(promoCourse.price),
    offerPrice: expectedAmount,
    promoCode: normalizedCode,
    checkoutFormula: {
      basePrice: Number(promoCourse.price),
      discountedPrice: expectedAmount,
      validPromoCodeRequired: true,
    },
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Promo flow verification failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
