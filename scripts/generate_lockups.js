import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = 'C:\\Users\\turhv\\.gemini\\antigravity\/\/brain\\5d53f5d1-b545-4d4b-aafe-60aaa54e4dfa';

// The base vector icon path definitions
const svgDefs = `<defs>
    <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="35%" stop-color="#059669"/>
      <stop offset="65%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>`;

const svgIconGroup = `<g transform="translate(30, 20) scale(0.15625)">
    <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
    <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
    <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
    <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>
    <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
    <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  </g>`;

// Lockup 1: Calori (Light)
const caloriLight = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120" fill="none">
  <rect width="500" height="120" fill="#FFFFFF"/>
  ${svgDefs}
  ${svgIconGroup}
  <text x="135" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="44px" font-weight="900" letter-spacing="-1.5px" fill="#1D1D1F">calori</text>
</svg>`;

// Lockup 2: Calori (Dark)
const caloriDark = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120" fill="none">
  <rect width="500" height="120" fill="#0A0A0B"/>
  ${svgDefs}
  ${svgIconGroup}
  <text x="135" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="44px" font-weight="900" letter-spacing="-1.5px" fill="#EDEDEF">calori</text>
</svg>`;

// Lockup 3: Calori Life (Light)
const caloriLifeLight = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120" fill="none">
  <rect width="500" height="120" fill="#FFFFFF"/>
  ${svgDefs}
  ${svgIconGroup}
  <text x="135" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="44px" font-weight="900" letter-spacing="-1.5px" fill="#1D1D1F">calori<tspan fill="#7C3AED" font-weight="500">life</tspan></text>
</svg>`;

// Lockup 4: Calori Life (Dark)
const caloriLifeDark = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="120" viewBox="0 0 500 120" fill="none">
  <rect width="500" height="120" fill="#0A0A0B"/>
  ${svgDefs}
  ${svgIconGroup}
  <text x="135" y="72" font-family="system-ui, -apple-system, sans-serif" font-size="44px" font-weight="900" letter-spacing="-1.5px" fill="#EDEDEF">calori<tspan fill="#8B5CF6" font-weight="500">life</tspan></text>
</svg>`;

async function run() {
  const lockups = [
    { svg: caloriLight, name: 'lockup_calori_light.png' },
    { svg: caloriDark, name: 'lockup_calori_dark.png' },
    { svg: caloriLifeLight, name: 'lockup_calori_life_light.png' },
    { svg: caloriLifeDark, name: 'lockup_calori_life_dark.png' }
  ];

  for (const l of lockups) {
    const pngPath = path.join(targetDir, l.name);
    await sharp(Buffer.from(l.svg))
      .png()
      .toFile(pngPath);
    console.log(`Generated lockup: ${pngPath}`);
  }
}

run().catch(console.error);
