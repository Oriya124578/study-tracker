import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const targetDir = 'C:\\Users\\turhv\\.gemini\\antigravity\\brain\\5d53f5d1-b545-4d4b-aafe-60aaa54e4dfa';

const svgDefs = `<defs>
    <linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="35%" stop-color="#059669"/>
      <stop offset="65%" stop-color="#2563EB"/>
      <stop offset="100%" stop-color="#7C3AED"/>
    </linearGradient>
  </defs>`;

const darkBg = `<rect width="512" height="512" fill="#0A0A0B"/>`;

// Option 33: Connected Lines (Icons merging directly into the borders)
const svg13 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>

  <!-- Leaf growing from the border of Top-Left -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="11" y1="20" x2="-23" y2="47" stroke="url(#outlineGrad)" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Activity pulse splitting the Bottom-Left square from border to border -->
  <path d="M60 347h88l10-30 10 60 10-30h92" stroke="url(#outlineGrad)" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
  
  <line x1="347" y1="311" x2="347" y2="383" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#8B5CF6" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 34: Solid-Outline Hybrid (Inner icons are filled gradients)
const svg14 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>

  <!-- Solid filled leaf (Top-Left) -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Z" fill="url(#outlineGrad)" opacity="0.9"/>
    <path d="M11 20v-5" stroke="#0A0A0B" stroke-width="2" stroke-linecap="round"/>
  </g>
  
  <g transform="translate(129, 311) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <rect x="336" y="322" width="22" height="50" rx="5" fill="#8B5CF6"/>
  <rect x="322" y="336" width="50" height="22" rx="5" fill="#8B5CF6"/>
</svg>`;

// Option 35: Soft Rounded Interlock (Pebble-style grid)
const svg15 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <!-- Pebble-style frames with rx=72 -->
  <rect x="60" y="60" width="210" height="210" rx="72" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="72" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="72" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="72" stroke="url(#outlineGrad)" stroke-width="16"/>

  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <g transform="translate(129, 311) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 36: Stencil Break Overlap (Optical 3D overlapping ribbons)
const svg16 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <!-- Base outline layer -->
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  
  <!-- Cutout masks (drawn with background color stroke to break overlaps) -->
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="#0A0A0B" stroke-width="32"/>
  
  <!-- Final overlapping rectangles on top -->
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>

  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <g transform="translate(129, 311) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

async function run() {
  const variations = [
    { svg: svg13, name: 'logo_var13.png' },
    { svg: svg14, name: 'logo_var14.png' },
    { svg: svg15, name: 'logo_var16.png' }, // wait, typo in my thought list: var16/15
    { svg: svg16, name: 'logo_var15.png' }
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
