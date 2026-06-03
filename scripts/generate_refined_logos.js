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

// Option A: Leaf & Activity Wave Insets
const svgA = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Leaf inside Top-Left (Center 165, 165) -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Activity pulse inside Bottom-Left (Center 165, 347) -->
  <g transform="translate(129, 311) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Plus sign in Bottom-Right -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
</svg>`;

// Option B: Leaf-Plus Hybrid
const svgB = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Plus sign + Leaf combo -->
  <line x1="347" y1="347" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <g transform="translate(331, 290) scale(1.5)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="#10B981" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>`;

// Option C: Dumbbell-Plus Hybrid
const svgC = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Dumbbell Plus Sign (Center 347, 347) -->
  <line x1="320" y1="347" x2="374" y2="347" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <!-- Weights plates on dumbbell ends -->
  <rect x="312" y="327" width="8" height="40" rx="4" fill="#7C3AED"/>
  <rect x="374" y="327" width="8" height="40" rx="4" fill="#7C3AED"/>
</svg>`;

// Option D: Scale-Plus Hybrid
const svgD = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${svgDefs}
  ${baseGrid}
  
  <!-- Scale Balance Plus Sign -->
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="14" stroke-linecap="round"/>
  <!-- Hanging pans representation -->
  <path d="M318 347v15c0 6 6 10 10 10M376 347v15c0 6-6 10-10 10" stroke="#7C3AED" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

async function run() {
  const variations = [
    { svg: svgA, name: 'logo_ref_optA.png' },
    { svg: svgB, name: 'logo_ref_optB.png' },
    { svg: svgC, name: 'logo_ref_optC.png' },
    { svg: svgD, name: 'logo_ref_optD.png' }
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
