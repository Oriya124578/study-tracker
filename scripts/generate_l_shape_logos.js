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

// 3 squares base (Top-Left, Top-Right, Bottom-Left)
const baseThreeSquares = `
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
`;

const leafIcon = `
  <!-- Leaf inside Top-Left (Center 165, 165) -->
  <g transform="translate(129, 129) scale(3)">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
`;

const notebookIcon = `
  <!-- Notebook inside Bottom-Left (Center 165, 347) -->
  <g transform="translate(129, 311) scale(3)">
    <rect x="6" y="2" width="13" height="20" rx="2" stroke="url(#outlineGrad)" stroke-width="2"/>
    <line x1="9" y1="7" x2="16" y2="7" stroke="url(#outlineGrad)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="9" y1="12" x2="16" y2="12" stroke="url(#outlineGrad)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="9" y1="17" x2="16" y2="17" stroke="url(#outlineGrad)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="3" y1="6" x2="6" y2="6" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round"/>
    <line x1="3" y1="11" x2="6" y2="11" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round"/>
    <line x1="3" y1="16" x2="6" y2="16" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round"/>
  </g>
`;

const floatingPlus = `
  <!-- Floating Plus in Bottom-Right -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>
`;

// Option 37: Dumbbell top-right, Notebook bottom-left, Plus bottom-right
const svg37 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  ${baseThreeSquares}
  ${leafIcon}
  ${notebookIcon}
  
  <!-- Dumbbell inside Top-Right (Center 347, 165) -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M14.4 14.4 20 20M9.6 9.6 4 4M20 20c1.1.9 2-.2 2.7-.9.7-.7 1.8-1.6.9-2.7L20 20ZM4 4C2.9 3.1 2 4.2 1.3 4.9c-.7.7-1.8 1.6-.9 2.7L4 4ZM19 9a3 3 0 0 0-4-4L5 15a3 3 0 0 0 4 4L19 9Z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  ${floatingPlus}
</svg>`;

// Option 38: Activity pulse top-right, Notebook bottom-left, Plus bottom-right
const svg38 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  ${baseThreeSquares}
  ${leafIcon}
  ${notebookIcon}
  
  <!-- Activity Pulse inside Top-Right (Center 347, 165) -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  ${floatingPlus}
</svg>`;

// Option 39: 3D Stencil Overlap L-Shape
const svg39 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <!-- 3D Stencil layout for 3 squares -->
  <rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  
  <!-- Cutout overlap -->
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="#0A0A0B" stroke-width="32"/>
  <rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16"/>
  
  ${leafIcon}
  ${notebookIcon}
  
  <!-- Dumbbell top-right -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M14.4 14.4 20 20M9.6 9.6 4 4M20 20c1.1.9 2-.2 2.7-.9.7-.7 1.8-1.6.9-2.7L20 20ZM4 4C2.9 3.1 2 4.2 1.3 4.9c-.7.7-1.8 1.6-.9 2.7L4 4ZM19 9a3 3 0 0 0-4-4L5 15a3 3 0 0 0 4 4L19 9Z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  ${floatingPlus}
</svg>`;

// Option 40: Solid Glass L-Shape
const svg40 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  ${darkBg}
  ${svgDefs}
  
  <rect x="60" y="60" width="210" height="210" rx="48" fill="rgba(16, 185, 129, 0.08)" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="242" y="60" width="210" height="210" rx="48" fill="rgba(37, 99, 235, 0.08)" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  <rect x="60" y="242" width="210" height="210" rx="48" fill="rgba(124, 58, 237, 0.08)" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>
  
  ${leafIcon}
  ${notebookIcon}
  
  <!-- Dumbbell top-right -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M14.4 14.4 20 20M9.6 9.6 4 4M20 20c1.1.9 2-.2 2.7-.9.7-.7 1.8-1.6.9-2.7L20 20ZM4 4C2.9 3.1 2 4.2 1.3 4.9c-.7.7-1.8 1.6-.9 2.7L4 4ZM19 9a3 3 0 0 0-4-4L5 15a3 3 0 0 0 4 4L19 9Z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
  
  <!-- Glowing Solid Plus in Bottom-Right -->
  <rect x="338" y="311" width="18" height="72" rx="4" fill="#8B5CF6"/>
  <rect x="311" y="338" width="72" height="18" rx="4" fill="#8B5CF6"/>
</svg>`;

async function run() {
  const variations = [
    { svg: svg37, name: 'logo_l_optA.png' },
    { svg: svg38, name: 'logo_l_optB.png' },
    { svg: svg39, name: 'logo_l_optC.png' },
    { svg: svg40, name: 'logo_l_optD.png' }
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
