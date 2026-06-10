import { getGeminiApiKey } from './gemini';
import { GoogleGenerativeAI } from '@google/generative-ai';

const CATEGORIES = [
  { key: 'dairy',    emoji: '\u{1F95B}', he: 'מוצרי חלב',         en: 'Dairy' },
  { key: 'meat',     emoji: '\u{1F969}', he: 'בשר / עוף / דגים',  en: 'Meat & Fish' },
  { key: 'produce',  emoji: '\u{1F966}', he: 'ירקות ופירות',      en: 'Produce' },
  { key: 'bakery',   emoji: '\u{1F35E}', he: 'אפייה ולחם',        en: 'Bakery' },
  { key: 'dryGoods', emoji: '\u{1F35D}', he: 'יבשים וקטניות',     en: 'Dry Goods' },
  { key: 'spices',   emoji: '\u{1F9C2}', he: 'תבלינים ובישול',    en: 'Spices & Cooking' },
  { key: 'drinks',   emoji: '\u{1F9C3}', he: 'שתייה',             en: 'Drinks' },
  { key: 'snacks',   emoji: '\u{1F36B}', he: 'חטיפים ומתוקים',    en: 'Snacks & Sweets' },
  { key: 'cleaning', emoji: '\u{1F9FC}', he: 'ניקיון וחד"פ',      en: 'Cleaning' },
  { key: 'frozen',   emoji: '\u{2744}\u{FE0F}', he: 'קפואים',     en: 'Frozen' },
  { key: 'baby',     emoji: '\u{1F476}', he: 'תינוקות',            en: 'Baby' },
  { key: 'sauces',   emoji: '\u{1F336}\u{FE0F}', he: 'שימורים ורטבים', en: 'Canned & Sauces' },
  { key: 'other',    emoji: '\u{1F9C8}', he: 'אחר',               en: 'Other' },
];

export const getCategoryMeta = (key) =>
  CATEGORIES.find((c) => c.key === key) || CATEGORIES[CATEGORIES.length - 1];

export const getAllCategories = () => CATEGORIES;

const KEYWORDS = {
  dairy: [
    'חלב', 'גבינה', 'יוגורט', 'שמנת', 'קוטג', "קוטג'", 'לבן', 'קשקבל',
    'מוצרלה', 'פרמז', 'ריקוטה', 'שמנת חמוצה', 'חמאה', 'מעדן', 'דנונה',
    'אקטיביה', 'גבינה צהובה', 'גבינה לבנה', 'עמק', 'בולגרית', 'צפתית',
    'קממבר', 'ברי', 'גאודה', 'אמנטל', 'טוב טעם',
  ],
  meat: [
    'עוף', 'בקר', 'טחון', 'שניצל', 'סלמון', 'טונה', 'נקניק', 'נקניקיות',
    'סטייק', 'כבש', 'הודו', 'פרגית', 'כנפיים', 'שוקיים', 'חזה עוף',
    'פילה', 'דג', 'דגים', 'בשר', 'קבב', 'המבורגר', 'אנטריקוט',
    'צלעות', 'נתח', 'שוק', 'כתף', 'אמנון', 'דניס', 'ברמונדי',
    'מוסר', 'לוקוס', 'סרדינים', 'פסטרמה', 'סלמי', 'קציצות',
  ],
  produce: [
    'עגבני', 'מלפפון', 'בצל', 'תפוח', 'בננה', 'אבוקדו', 'לימון',
    'תפוז', 'גזר', 'פלפל', 'חסה', 'כרוב', 'ברוקולי', 'כרובית',
    'תרד', 'פטרוזיליה', 'כוסברה', 'שמיר', 'נענע', 'בזיליקום',
    'אפרסק', 'שזיף', 'ענב', 'אגס', 'מנגו', 'אננס', 'קיווי',
    'תות', 'פטל', 'אוכמניות', 'רימון', 'אשכולית', 'קלמנטינה',
    'פומלה', 'דלעת', 'קישוא', 'חציל', 'סלק', 'צנונית', 'שום',
    'תירס', 'אפונה', 'שעועית', 'אדממה', 'פטריות', 'ירקות',
    'פירות', 'ירוקים', 'סלט', 'עשבי תיבול', 'שרי', 'עלים',
  ],
  bakery: [
    'לחם', 'פיתה', 'חלה', 'עוגה', 'בייגל', 'טורטייה', 'לחמנייה',
    'קרואסון', 'סופגנייה', 'בורקס', 'מאפה', 'פוקצ\'ה', 'באגט',
    'לחם שיפון', 'לחם מלא', 'לחם אחיד', 'רול', 'פרנה', 'מצה',
  ],
  dryGoods: [
    'אורז', 'פסטה', 'עדשים', 'חומוס', 'קמח', 'סוכר', 'שעועית',
    'קוסקוס', 'בורגול', 'קינואה', 'גריסים', 'פתיתים', 'אטריות',
    'ספגטי', 'פנה', 'מקרוני', 'נודלס', 'ביצים', 'ביצה',
    'דגנים', 'קורנפלקס', 'שיבולת שועל', 'גרנולה', 'מוזלי',
  ],
  spices: [
    'מלח', 'פלפל שחור', 'פפריקה', 'כורכום', 'שמן', 'חומץ',
    'קינמון', 'זנגביל', 'כמון', 'אורגנו', 'רוזמרין', 'טימין',
    'שמן זית', 'שמן קנולה', 'שמן חמניות', 'תבלין', 'ציל',
    'סויה', 'רוטב סויה', 'מרק עוף', 'אבקת מרק', 'שום גרנולות',
  ],
  drinks: [
    'מים', 'קולה', 'מיץ', 'בירה', 'יין', 'סודה', 'לימונדה',
    'תה', 'קפה', 'נס קפה', 'אספרסו', 'קפסולות', 'ספרייט',
    'פאנטה', 'שוויפס', 'טוניק', 'אנרגיה', 'חלב שקדים',
    'חלב סויה', 'חלב שיבולת', 'מים מינרלים', 'סירופ',
  ],
  snacks: [
    'במבה', 'ביסלי', 'שוקולד', 'עוגיות', 'גלידה', 'סוכריות',
    'שוקולד מריר', 'חטיף', 'וופלים', 'קרקר', 'פופקורן', 'אגוזים',
    'שקדים', 'בוטנים', 'קשיו', 'חמוציות', 'צימוקים', 'גרעינים',
    'חלבה', 'טחינה מתוקה', 'רפאלו', 'קינדר', 'אוראו', 'ופל',
  ],
  cleaning: [
    'אקונומיקה', 'סבון', 'נייר טואלט', 'שקיות', 'ספוג', 'אבקת כביסה',
    'מרכך', 'מטליות', 'ניקוי', 'פיירי', 'סנו', 'אקונומיקה',
    'מגבונים', 'נייר סופג', 'שקיות אשפה', 'כפפות', 'מברשת',
    'חד פעמי', 'חד"פ', 'כוסות', 'צלחות', 'סכום', 'מפיות',
    'נרות', 'גפרורים', 'בלון', 'פחיות', 'שקית', 'אלומיניום', 'ניילון נצמד',
  ],
  frozen: [
    'קפוא', 'קפואה', 'קפואים', 'קפואות', 'פיצה קפואה', 'ירקות קפואים',
    'בורקס קפוא', 'שניצל קפוא', 'גלידה',
  ],
  baby: [
    'טיטולים', 'מגבונים', 'מזון תינוקות', 'בקבוק', 'מוצץ',
    'האגיס', 'פמפרס', 'מטרנה', 'סימילאק',
  ],
  sauces: [
    'קטשופ', 'רוטב', 'שימורים', 'טחינה', 'חרדל', 'מיונז',
    'ריבה', 'דבש', 'סילאן', 'ממרח', 'חומוס מוכן', 'אמבה',
    'חריף', 'פסטו', 'עגבניות מרוסקות', 'רסק', 'תירס שימורים',
    'זיתים', 'חמוצים', 'מלפפון חמוץ', 'טונה שימורים',
  ],
};

const LS_KEY = 'cl_grocery_learned_dict';

const loadLearnedDict = () => {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || '{}');
  } catch { return {}; }
};

const saveLearnedDict = (dict) => {
  try { localStorage.setItem(LS_KEY, JSON.stringify(dict)); } catch { /* ignore */ }
};

// Merge a Firestore-synced dict into the local cache (called on subscribe so
// learnings flow between devices). Local entries win only on conflict-free keys.
export const applyExternalDict = (extDict) => {
  if (!extDict || typeof extDict !== 'object') return;
  const learned = loadLearnedDict();
  saveLearnedDict({ ...extDict, ...learned });
};

const QTY_REGEX = /^[\d.,]+\s*(?:x|×|X|ק"ג|קילו|גרם|ג'|מ"ל|ליטר|יח'|יחידות?)?\s*/;
const LINE_CLEAN = /^[\s\-•·*\d.)\]]+/;

let _idCounter = 0;
export const genItemId = () =>
  `item-${typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${(_idCounter++).toString(36)}-${Math.random().toString(36).slice(2, 7)}`}`;

const matchCategory = (name) => {
  const lower = name.toLowerCase();
  for (const [cat, words] of Object.entries(KEYWORDS)) {
    for (const w of words) {
      if (lower.includes(w)) return cat;
    }
  }
  return null;
};

export const parseQuantity = (raw) => {
  const match = raw.match(/(\d+(?:[.,]\d+)?)\s*(x|×|X|ק"ג|קילו|גרם|ג'|מ"ל|ליטר|יח'|יחידות?)?/);
  if (!match) return { qty: null, unit: null };
  return { qty: match[1], unit: match[2] || null };
};

export const parseShoppingText = (text) => {
  const lines = text
    .split(/[\n,;]/)
    .map((l) => l.replace(LINE_CLEAN, '').trim())
    .filter((l) => l.length > 0);

  const learned = loadLearnedDict();
  const items = [];
  const unresolved = [];

  for (const raw of lines) {
    const { qty, unit } = parseQuantity(raw);
    const cleanName = raw.replace(QTY_REGEX, '').trim();
    // A line that is only a quantity (e.g. "2 ק\"ג") leaves nothing behind —
    // skip it rather than creating a junk "other" item.
    if (!cleanName) continue;

    let category = matchCategory(cleanName);
    if (!category && learned[cleanName.toLowerCase()]) {
      category = learned[cleanName.toLowerCase()];
    }

    const item = {
      id: genItemId(),
      name: cleanName,
      category: category || 'other',
      checked: false,
      qty: qty || null,
      unit: unit || null,
      addedAt: new Date().toISOString(),
    };

    if (!category) {
      unresolved.push(item);
    }
    items.push(item);
  }

  return { items, unresolved };
};

// Resolves unresolved items via Gemini. Returns { items, learned } where
// `learned` is the map of newly-classified { nameLower: category } so the
// caller can persist it to Firestore for cross-device sync.
export const categorizeWithAI = async (unresolvedItems) => {
  const key = getGeminiApiKey();
  if (!key || unresolvedItems.length === 0) return { items: unresolvedItems, learned: {} };

  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const categoryKeys = CATEGORIES.map((c) => c.key).join(', ');
    const itemNames = unresolvedItems.map((i) => i.name).join('\n');

    const prompt = `Categorize these grocery items into one of these categories: ${categoryKeys}.
Return ONLY a JSON object mapping each item name to its category key. No markdown, no explanation.

Items:
${itemNames}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    // Extract the first {...} block so stray prose/fences don't break JSON.parse.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const mapping = JSON.parse(jsonMatch ? jsonMatch[0] : text);
    // Case-insensitive lookup in case the model normalizes the key casing.
    const lowerMap = {};
    for (const [k, v] of Object.entries(mapping)) lowerMap[k.toLowerCase()] = v;

    const learned = loadLearnedDict();
    const newlyLearned = {};

    for (const item of unresolvedItems) {
      const cat = mapping[item.name] || lowerMap[item.name.toLowerCase()];
      if (cat && CATEGORIES.some((c) => c.key === cat)) {
        item.category = cat;
        learned[item.name.toLowerCase()] = cat;
        newlyLearned[item.name.toLowerCase()] = cat;
      }
    }

    saveLearnedDict(learned);
    return { items: unresolvedItems, learned: newlyLearned };
  } catch (e) {
    console.error('[groceryCategories] AI categorization failed:', e);
    return { items: unresolvedItems, learned: {} };
  }
};

export const learnCategory = (itemName, category) => {
  const learned = loadLearnedDict();
  learned[itemName.toLowerCase()] = category;
  saveLearnedDict(learned);
};

export const groupByCategory = (items) => {
  const groups = {};
  for (const item of items) {
    const cat = item.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  const ordered = CATEGORIES
    .filter((c) => groups[c.key])
    .map((c) => ({ ...c, items: groups[c.key] }));
  return ordered;
};
