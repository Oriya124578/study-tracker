import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories
const studyTrackerPublic = path.join(__dirname, '..', 'public');
const caloriMobileAssetsIcons = 'c:\\src\\projects\\calori_1300\\assets\\icons';
const caloriWebsitePublic = 'c:\\src\\projects\\calori_1300\\website\\public';

if (!fs.existsSync(caloriMobileAssetsIcons)) fs.mkdirSync(caloriMobileAssetsIcons, { recursive: true });
if (!fs.existsSync(caloriWebsitePublic)) fs.mkdirSync(caloriWebsitePublic, { recursive: true });

const svgDefs = '<defs><linearGradient id="outlineGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#10B981"/><stop offset="35%" stop-color="#059669"/><stop offset="65%" stop-color="#2563EB"/><stop offset="100%" stop-color="#7C3AED"/></linearGradient></defs>';

const baseThreeSquares = '<rect x="60" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/><rect x="242" y="60" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/><rect x="60" y="242" width="210" height="210" rx="48" stroke="url(#outlineGrad)" stroke-width="16" opacity="0.85"/>';

const leafIcon = '<g transform="translate(129, 129) scale(3)"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-9 8.2Zm0 0v-5" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';

const activityIcon = '<g transform="translate(311, 129) scale(3)"><path d="M22 12h-4l-3 9L9 3l-3 9H2" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';

const openBookIcon = '<g transform="translate(129, 311) scale(3)"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" stroke="url(#outlineGrad)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';

const scaleIcon = '<g transform="translate(129, 311) scale(3)"><rect x="4" y="4" width="16" height="16" rx="3" stroke="url(#outlineGrad)" stroke-width="2"/><rect x="8" y="7" width="8" height="3" rx="0.5" stroke="url(#outlineGrad)" stroke-width="1.5"/><line x1="7" y1="15" x2="17" y2="15" stroke="url(#outlineGrad)" stroke-width="1.5" stroke-linecap="round"/></g>';

const floatingPlus = '<line x1="347" y1="311" x2="347" y2="383" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/><line x1="311" y1="347" x2="383" y2="347" stroke="#7C3AED" stroke-width="16" stroke-linecap="round"/>';

const makeSvg = (bgColor, iconBL, isTransparent = false) => {
  const bg = isTransparent ? '' : '<rect width="512" height="512" fill="' + bgColor + '"/>';
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">' + bg + svgDefs + baseThreeSquares + leafIcon + activityIcon + iconBL + floatingPlus + '</svg>';
};

async function run() {
  const lifeSvg = makeSvg('', openBookIcon, true);
  fs.writeFileSync(path.join(studyTrackerPublic, 'logo.svg'), lifeSvg);
  fs.writeFileSync(path.join(studyTrackerPublic, 'favicon.svg'), lifeSvg);

  const lifeBuffer = Buffer.from(lifeSvg);
  await sharp(lifeBuffer).resize(512, 512).png().toFile(path.join(studyTrackerPublic, 'logo.png'));
  await sharp(lifeBuffer).resize(512, 512).png().toFile(path.join(studyTrackerPublic, 'logo-512.png'));
  await sharp(lifeBuffer).resize(192, 192).png().toFile(path.join(studyTrackerPublic, 'logo-192.png'));
  await sharp(lifeBuffer).resize(32, 32).png().toFile(path.join(studyTrackerPublic, 'favicon.png'));

  const mobileSvgTrans = makeSvg('', scaleIcon, true);
  const mobileSvgDark = makeSvg('#0A0A0B', scaleIcon, false);
  const mobileSvgLight = makeSvg('#FFFFFF', scaleIcon, false);

  const mobileTransBuffer = Buffer.from(mobileSvgTrans);
  await sharp(mobileTransBuffer).resize(1024, 1024).png().toFile(path.join(caloriMobileAssetsIcons, 'app_icon.png'));

  const mobileDarkBuffer = Buffer.from(mobileSvgDark);
  const mobileLightBuffer = Buffer.from(mobileSvgLight);
  
  fs.writeFileSync(path.join(caloriWebsitePublic, 'favicon.svg'), mobileSvgTrans);
  await sharp(mobileDarkBuffer).resize(512, 512).jpeg().toFile(path.join(caloriWebsitePublic, 'logo_dark.jpg'));
  await sharp(mobileLightBuffer).resize(512, 512).jpeg().toFile(path.join(caloriWebsitePublic, 'logo_light.jpg'));
  await sharp(mobileDarkBuffer).resize(512, 512).jpeg().toFile(path.join(caloriWebsitePublic, 'app_logo_dark.jpg'));
  await sharp(mobileLightBuffer).resize(512, 512).jpeg().toFile(path.join(caloriWebsitePublic, 'app_logo_light.jpg'));

  console.log('Successfully generated all logos for Calori & Calori Life!');
}

run().catch(console.error);
