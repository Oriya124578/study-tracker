import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generate() {
  const svgPath = path.join(__dirname, 'public', 'logo.svg');
  
  if (!fs.existsSync(svgPath)) {
    console.error('logo.svg not found');
    return;
  }

  const svgBuffer = fs.readFileSync(svgPath);

  // Generate 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'public', 'logo-192.png'));
    
  // Generate 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'logo-512.png'));
    
  // Generate Favicon (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'public', 'favicon.png'));
    
  // Generate Logo (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, 'public', 'logo.png'));

  console.log('Successfully generated all PNG logos from SVG.');
}

generate().catch(console.error);
