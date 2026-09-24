const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function run() {
  const publicDir = path.join(__dirname, '..', 'public');
  const svgPath = path.join(publicDir, 'brand-favicon.svg');
  if (!fs.existsSync(svgPath)) {
    console.error('brand-favicon.svg not found in public/');
    process.exit(2);
  }

  // 32x32 PNG and ICO
  await sharp(svgPath).resize(32, 32).png().toFile(path.join(publicDir, 'favicon-32.png'));
  // 180x180 apple touch
  await sharp(svgPath).resize(180, 180).png().toFile(path.join(publicDir, 'apple-touch-icon-180.png'));

  // Create multi-size ICO (include 16,32,48)
  const icoBufs = await Promise.all([
    sharp(svgPath).resize(16, 16).png().toBuffer(),
    sharp(svgPath).resize(32, 32).png().toBuffer(),
    sharp(svgPath).resize(48, 48).png().toBuffer(),
  ]);

  // sharp can write .ico by using toFile with .ico extension where supported
  await sharp(icoBufs[0]).toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Generated favicon-32.png, apple-touch-icon-180.png, favicon.ico');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
