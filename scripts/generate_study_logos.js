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

const activityIcon = `
  <!-- Activity pulse inside Top-Right (Center 347, 165) -->
  <g transform="translate(311, 129) scale(3)">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
`;

// Bottom-Left: Open Book (studies)
const openBookIcon = `
  <g transform="translate(129, 311) scale(3)">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
`;

// Bottom-Left: Closed Notebook with Bookmark Ribbon (academic study book)
const closedBookIcon = `
  <g transform="translate(129, 311) scale(3)">
    <rect x="6" y="2" width="12" height="20" rx="2" stroke="url(#outlineGrad)" stroke-width="2"/>
    <path d="M9 2v6l2-2 2 2V2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="9" y1="12" x2="15" y2="12" stroke="url(#outlineGrad)" stroke-width="1.8" stroke-linecap="round"/>
    <line x1="9" y1="16" x2="15" y2="16" stroke="url(#outlineGrad)" stroke-width="1.8" stroke-linecap="round"/>
  </g>
`;

// Standalone SVG wrappers for rendering
const makeSvg = (bgColor, iconBL, plusColor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="${bgColor}"/>
  ${svgDefs}
  ${baseThreeSquares}
  ${leafIcon}
  ${activityIcon}
  ${iconBL}
  
  <!-- Floating Plus in Bottom-Right -->
  <line x1="347" y1="311" x2="347" y2="383" stroke="${plusColor}" stroke-width="16" stroke-linecap="round"/>
  <line x1="311" y1="347" x2="383" y2="347" stroke="${plusColor}" stroke-width="16" stroke-linecap="round"/>
</svg>`;

async function run() {
  const variations = [
    { svg: makeSvg('#FFFFFF', openBookIcon, '#7C3AED'), name: 'logo_study_open_light.png' },
    { svg: makeSvg('#0A0A0B', openBookIcon, '#8B5CF6'), name: 'logo_study_open_dark.png' },
    { svg: makeSvg('#FFFFFF', closedBookIcon, '#7C3AED'), name: 'logo_study_closed_light.png' },
    { svg: makeSvg('#0A0A0B', closedBookIcon, '#8B5CF6'), name: 'logo_study_closed_dark.png' }
  ];

  for (const v of variations) {
    const pngPath = path.join(targetDir, v.name);
    await sharp(Buffer.from(v.svg))
      .resize(512, 512)
      .png()
      .toFile(pngPath);
    console.log(`Generated study logo: ${pngPath}`);
  }
}

run().catch(console.error);
