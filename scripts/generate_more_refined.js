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

const baseGrid = `
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>
`;

// Option 29: The Dumbbell-Leaf Plus (Cross-Train Plus)
const svg9 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Dumbbell Vertical Bar -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <rect x="331" y="307" width="32" height="8" rx="3" fill="#7C3AED"/>
  <rect x="331" y="377" width="32" height="8" rx="3" fill="#7C3AED"/>
  
  <!-- Leaf Horizontal Bar -->
  <line x1="311" y1="347" x2="355" y2="347" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <g transform="translate(345, 329) scale(1.5)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Option 30: Heart Bento Outline (Top-Right is a Heart)
const svg10 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>
  
  <!-- Heart in Top-Right (Center 347, 165) -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Plus sign in Bottom-Right -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 31: Apple Bento Outline (Top-Left is an Apple)
const svg11 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>
  
  <!-- Apple in Top-Left (Center 165, 165) -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M12 22c5.5-1.5 8-2 8-10S17.5 4 12 4 4 4 4 12s2.5 8.5 8 10z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 4c0-2 1-3 3-3" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round"/>
  </g>
  
  <!-- Plus sign in Bottom-Right -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option 32: Complete Icon Grid (Apple + Dumbbell + Cap + Plus)
const svg12 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Top-Left: Apple (Nutrition) -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M12 22c5.5-1.5 8-2 8-10S17.5 4 12 4 4 4 4 12s2.5 8.5 8 10z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M12 4c0-2 1-3 3-3" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round"/>
  </g>
  
  <!-- Bottom-Left: Dumbbell (Fitness) -->
  <g transform="translate(129, 311) scale(3)">
    <path d="M14.4 14.4 20 20M9.6 9.6 4 4M20 14.4l-5.6-5.6M9.6 4 4 9.6M20 20c1.1.9 2-.2 2.7-.9.7-.7 1.8-1.6.9-2.7L20 20ZM4 4C2.9 3.1 2 4.2 1.3 4.9c-.7.7-1.8 1.6-.9 2.7L4 4ZM19 9a3 3 0 0 0-4-4L5 15a3 3 0 0 0 4 4L19 9Z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Top-Right: Graduation Cap (Studies) -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M22 10v6M6 12.5V16a6 3 0 0 0 12 0v-3.5M2 10l10-5 10 5-10 5z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Bottom-Right: Plus sign -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

async function run() {
  const variations = [
    { svg: svg9, name: 'logo_ref_optE.png' },
    { svg: svg10, name: 'logo_ref_optF.png' },
    { svg: svg11, name: 'logo_ref_optG.png' },
    { svg: svg12, name: 'logo_ref_optH.png' }
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
