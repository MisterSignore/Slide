/**
 * Generates PWA icons from the SVG source.
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp (dev only)
 */
import { readFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');

async function run() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.error('Install sharp first: npm install --save-dev sharp');
    process.exit(1);
  }

  const svg = readFileSync(join(root, 'public/icons/icon.svg'));
  mkdirSync(join(root, 'public/icons'), { recursive: true });

  for (const size of [192, 512]) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(join(root, `public/icons/icon-${size}.png`));
    console.log(`✓ icon-${size}.png`);
  }

  console.log('Icons generated successfully.');
}

run();
