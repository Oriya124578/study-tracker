import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = 'C:\\Users\\turhv\\.gemini\\antigravity\\brain\\5d53f5d1-b545-4d4b-aafe-60aaa54e4dfa';

// Option 21: Double Outline Grid
const svg1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="gOutline" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="50%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#gOutline)" stroke-width="14" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#gOutline)" stroke-width="14" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#gOutline)" stroke-width="14" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#gOutline)" stroke-width="14"/>
  
  <rect x="90" y="90" width="150" height="150" rx="32" stroke="url(#gOutline)" stroke-width="6" opacity="0.45"/>
  <rect x="272" y="90" width="150" height="150" rx="32" stroke="url(#gOutline)" stroke-width="6" opacity="0.45"/>
  <rect x="90" y="272" width="150" height="150" rx="32" stroke="url(#gOutline)" stroke-width="6" opacity="0.45"/>
  <rect x="272" y="272" width="150" height="150" rx="32" stroke="url(#gOutline)" stroke-width="6" opacity="0.45"/>
  
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
</svg>`;

// Option 22: Staggered Bento Grid Outlines
const svg2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="gStaggered" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="50%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect x="60" y="31" width="210" height="210" rx="48" stroke="url(#gStaggered)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="81" width="210" height="210" rx="48" stroke="url(#gStaggered)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="221" width="210" height="210" rx="48" stroke="url(#gStaggered)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="271" width="210" height="210" rx="48" stroke="url(#gStaggered)" stroke-width="16"/>
  
  <line x1="347" y1="340" x2="347" y2="412" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="376" x2="383" y2="376" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 23: C-Monogram Bento Outline
const svg3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="gC" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="60%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
    <linearGradient id="gSparkle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#gC)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#gC)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#gC)" stroke-width="16"/>
  
  <line x1="347" y1="129" x2="347" y2="201" stroke="url(#gSparkle)" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="165" x2="383" y2="165" stroke="url(#gSparkle)" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 24: Stencil Plus / Inner Glow
const svg4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="gGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="50%" stop-color="#059669"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>
  <rect x="60" y="60" width="210" height="210" rx="48" fill="rgba(16, 185, 129, 0.02)" stroke="url(#gGlow)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" fill="rgba(37, 99, 235, 0.02)" stroke="url(#gGlow)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" fill="rgba(124, 58, 237, 0.02)" stroke="url(#gGlow)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" fill="rgba(124, 58, 237, 0.04)" stroke="url(#gGlow)" stroke-width="16"/>
  
  <line x1="347" y1="311" x2="347" y2="337" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="347" y1="357" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="337" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="357" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

async function run() {
  const variations = [
    { svg: svg1, name: 'logo_var5.png' },
    { svg: svg2, name: 'logo_var6.png' },
    { svg: svg3, name: 'logo_var7.png' },
    { svg: svg4, name: 'logo_var8.png' }
  ];

  for (const v of variations) {
    const pngPath = path.join(targetDir, v.name);
    await sharp(Buffer.from(v.svg))
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    console.log(`Generated: ${pngPath}`);
  }
}

run().catch(console.error);
