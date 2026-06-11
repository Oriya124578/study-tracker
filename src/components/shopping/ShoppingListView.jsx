import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Plus, ClipboardPaste, Wand2, Check, Trash2, Edit3,
  ChevronDown, X, History, ArrowRight, Loader2, Sparkles, Share2,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../../store/useToast';
import { cn } from '../../lib/utils';
import {
  parseShoppingText, categorizeWithAI, groupByCategory, getCategoryMeta, parseQuantity,
  getAllCategories, learnCategory,
} from '../../lib/groceryCategories';
import { format, parseISO, isValid } from 'date-fns';
import { he as heLocale } from 'date-fns/locale';

/* ── cream v3 palette ─────────────────────────────────────── */
const CREAM = {
  bg: '#FAF7F2',
  ink: '#2A1A0A',
  muted: '#8A7A6A',
  sub: '#5A4A3A',
  border: 'rgba(180,140,80,.14)',
  borderLight: 'rgba(180,140,80,.12)',
  green: '#059669',
  greenSoft: '#D1FAE5',
  greenLight: 'rgba(5,150,105,.08)',
  red: '#DC2626',
  redSoft: '#FEE2E2',
};
const serif = "'Instrument Serif', serif";
const display = "'Fraunces', serif";

const card = {
  background: '#fff', borderRadius: 14, border: `1px solid ${CREAM.border}`,
  boxShadow: '0 2px 10px rgba(40,20,0,.05)',
};

/* ── Checkbox ─────────────────────────────────────────────── */
const Checkbox = ({ checked, onClick }) => (
  <motion.button
    whileTap={{ scale: 0.8 }}
    onClick={(e) => { e.stopPropagation(); onClick(); }}
    role="checkbox"
    aria-checked={checked}
    className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    style={{
      border: `2px solid ${checked ? CREAM.green : 'rgba(180,140,80,.28)'}`,
      background: checked ? CREAM.green : 'transparent',
    }}
  >
    <motion.div animate={{ scale: checked ? 1 : 0 }} transition={{ type: 'spring', stiffness: 400, damping: 18 }}>
      <Check className="w-[13px] h-[13px] text-white" strokeWidth={3} />
    </motion.div>
  </motion.button>
);

/* ── Item Row (swipe-to-delete) ───────────────────────────── */
const ItemRow = ({ item, onToggle, onEdit, onDelete, t, isRTL }) => {
  const meta = item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : null;
  // Swipe inward (toward the screen edge the row starts from) to delete: that's
  // a rightward drag in RTL, leftward in LTR. Reveal the red layer on that side.
  const dragElastic = isRTL ? { left: 0, right: 0.6 } : { left: 0.6, right: 0 };
  const passedThreshold = (x) => (isRTL ? x > 90 : x < -90);
  return (
    <div className="relative overflow-hidden" style={{ borderBottom: `1px solid rgba(180,140,80,.06)` }}>
      {/* red delete layer behind, on the swipe side */}
      <div className={cn('absolute inset-0 flex items-center px-5', isRTL ? 'justify-end' : 'justify-start')} style={{ background: CREAM.redSoft }}>
        <Trash2 className="w-5 h-5" style={{ color: CREAM.red }} />
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={dragElastic}
        onDragEnd={(_, info) => { if (passedThreshold(info.offset.x)) onDelete(); }}
        className="relative flex items-center gap-3 py-3 px-3 bg-white cursor-pointer group"
        style={{ touchAction: 'pan-y' }}
        onClick={onToggle}
      >
        <Checkbox checked={item.checked} onClick={onToggle} />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span
            className="text-sm transition-all"
            style={{
              color: item.checked ? CREAM.muted : CREAM.ink,
              textDecoration: item.checked ? 'line-through' : 'none',
            }}
          >
            {item.name}
          </span>
          {meta && <span className="text-[11px] font-medium" style={{ color: CREAM.muted }}>{meta}</span>}
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(); }}
          aria-label={t('edit')}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:opacity-100"
          style={{ color: CREAM.muted }}
        >
          <Edit3 className="w-[14px] h-[14px]" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          aria-label={t('delete')}
          className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:opacity-100 shrink-0"
          style={{ background: CREAM.redSoft, color: CREAM.red }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

/* ── Category Accordion ───────────────────────────────────── */
const CategorySection = ({ group, isOpen, onToggleOpen, onToggleItem, onEditItem, onDeleteItem, onAddItem, t, language, isRTL }) => {
  const meta = getCategoryMeta(group.key);
  const done = group.items.filter((i) => i.checked).length;
  const total = group.items.length;
  const allDone = done === total && total > 0;
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');
  const name = language === 'he' ? meta.he : meta.en;
  const panelId = `shop-cat-${group.key}`;

  const submitAdd = () => {
    const v = draft.trim();
    setDraft('');
    setAdding(false);
    if (v) onAddItem(v, group.key);
  };

  return (
    <motion.div layout style={{ ...card, overflow: 'hidden', opacity: allDone && !isOpen ? 0.65 : 1 }}>
      <button
        onClick={onToggleOpen}
        aria-expanded={isOpen}
        aria-controls={panelId}
        className="w-full flex items-center gap-2.5 px-4 py-3 transition-colors hover:bg-[rgba(180,140,80,.04)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
      >
        <span className="text-xl w-7 text-center shrink-0">{meta.emoji}</span>
        <span className="flex-1 text-sm font-semibold text-start" style={{ color: CREAM.ink }}>{name}</span>
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-full"
          style={
            allDone
              ? { background: 'rgba(180,140,80,.08)', color: CREAM.muted, textDecoration: 'line-through' }
              : { background: CREAM.greenSoft, color: CREAM.green }
          }
        >
          {done}/{total}
        </span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-[18px] h-[18px]" style={{ color: CREAM.muted }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ borderTop: `1px solid ${CREAM.borderLight}` }}
          >
            {group.items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                onToggle={() => onToggleItem(item.id)}
                onEdit={() => onEditItem(item)}
                onDelete={() => onDeleteItem(item.id)}
                t={t}
                isRTL={isRTL}
              />
            ))}

            {adding ? (
              <div className="flex items-center gap-2 px-4 py-2.5" style={{ borderTop: `1px solid ${CREAM.borderLight}` }}>
                <input
                  autoFocus
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') submitAdd(); if (e.key === 'Escape') { setAdding(false); setDraft(''); } }}
                  onBlur={submitAdd}
                  placeholder={t('productName')}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: CREAM.ink }}
                />
                <button onClick={submitAdd} className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: CREAM.greenLight, color: CREAM.green }}>
                  {t('add')}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAdding(true)}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-[rgba(180,140,80,.04)] transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none focus-visible:ring-inset"
                style={{ borderTop: `1px solid ${CREAM.borderLight}` }}
              >
                <span className="w-[22px] h-[22px] rounded-full flex items-center justify-center" style={{ border: `2px dashed rgba(5,150,105,.3)`, color: CREAM.green }}>
                  <Plus className="w-3 h-3" strokeWidth={2.5} />
                </span>
                <span className="text-[13px] font-medium" style={{ color: CREAM.green }}>{t('addProduct')}</span>
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

/* ── Edit Item Modal ──────────────────────────────────────── */
const EditItemModal = ({ item, onClose, onSave, t, isRTL, language }) => {
  const [name, setName] = useState(item.name || '');
  // Show the full "qty unit" so editing is intuitive; re-parse on save.
  const [qty, setQty] = useState(item.qty ? `${item.qty}${item.unit ? ' ' + item.unit : ''}` : '');
  const [category, setCategory] = useState(item.category || 'other');
  const allCats = getAllCategories();

  const handleSave = () => {
    if (!name.trim()) return;
    const trimmedQty = qty.trim();
    const parsed = trimmedQty ? parseQuantity(trimmedQty) : { qty: null, unit: null };
    onSave(
      { name: name.trim(), qty: parsed.qty, unit: parsed.unit, category },
      category !== item.category, // categoryChanged → learn it
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={t('editProduct')}
      onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}
    >
      <motion.div className="fixed inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        className="relative w-full max-w-sm p-5 z-10 space-y-4"
        style={{ background: '#fff', borderRadius: 22, border: `1px solid ${CREAM.border}`, boxShadow: '0 4px 24px rgba(40,20,0,.12)' }}
        initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg" style={{ fontFamily: serif, color: CREAM.ink }}>{t('editProduct')}</h3>
          <button onClick={onClose} aria-label={t('cancel')} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[rgba(180,140,80,.08)]">
            <X className="w-4 h-4" style={{ color: CREAM.muted }} />
          </button>
        </div>
        <input
          autoFocus value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t('productName')}
          className="w-full px-3.5 py-3 rounded-xl outline-none text-sm"
          style={{ border: `1.5px solid ${CREAM.border}`, color: CREAM.ink, background: 'rgba(250,247,242,.5)' }}
        />
        <input
          value={qty} onChange={(e) => setQty(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          placeholder={t('itemsCount')}
          className="w-full px-3.5 py-3 rounded-xl outline-none text-sm"
          style={{ border: `1.5px solid ${CREAM.border}`, color: CREAM.ink, background: 'rgba(250,247,242,.5)' }}
        />

        {/* Category picker — correcting it teaches the dictionary */}
        <div>
          <div className="text-xs font-semibold mb-2 px-0.5" style={{ color: CREAM.muted }}>{t('categoryLabel')}</div>
          <div className="grid grid-cols-2 gap-1.5 max-h-44 overflow-y-auto no-scrollbar">
            {allCats.map((c) => {
              const active = category === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCategory(c.key)}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-[13px] transition-colors text-start focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
                  style={{
                    border: `1.5px solid ${active ? CREAM.green : CREAM.borderLight}`,
                    background: active ? CREAM.greenLight : 'transparent',
                    color: active ? CREAM.green : CREAM.sub,
                    fontWeight: active ? 600 : 400,
                  }}
                >
                  <span className="text-base shrink-0">{c.emoji}</span>
                  <span className="truncate">{language === 'he' ? c.he : c.en}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full py-3 rounded-xl text-white text-sm font-semibold"
          style={{ background: CREAM.green }}
        >
          {t('save')}
        </button>
      </motion.div>
    </div>
  );
};

/* ── Paste / Parse View ───────────────────────────────────── */
const PasteView = ({ onCancel, onCreate, t, isRTL }) => {
  const learnGroceryItems = useStore((s) => s.learnGroceryItems);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [parsed, setParsed] = useState(null); // { items, groups }
  const [busy, setBusy] = useState(false);

  const handleParse = async () => {
    if (!text.trim()) return;
    setBusy(true);
    try {
      const { items, unresolved } = parseShoppingText(text);
      if (items.length === 0) {
        toast.info(t('shoppingEmptyParse'));
        setBusy(false);
        return;
      }
      if (unresolved.length > 0) {
        const { learned } = await categorizeWithAI(unresolved);
        if (learned && Object.keys(learned).length > 0) learnGroceryItems(learned);
      }
      setParsed({ items, groups: groupByCategory(items) });
    } catch (e) {
      console.error(e);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <button onClick={onCancel} className="flex items-center gap-2 text-sm font-semibold self-start" style={{ color: CREAM.green }}>
        <ArrowRight className={cn('w-[18px] h-[18px]', !isRTL && 'rotate-180')} />
        {t('cancel')}
      </button>

      {/* Paste card */}
      <div style={{ ...card }} className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: CREAM.greenLight }}>📋</div>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg" style={{ fontFamily: serif, color: CREAM.ink }}>{t('pasteList')}</span>
            <span className="text-xs" style={{ color: CREAM.muted }}>{t('pasteListSub')}</span>
          </div>
        </div>

        <input
          value={name} onChange={(e) => setName(e.target.value)}
          placeholder={t('listNamePlaceholder')}
          className="w-full px-3.5 py-2.5 rounded-xl outline-none text-sm"
          style={{ border: `1.5px solid ${CREAM.border}`, color: CREAM.ink, background: 'rgba(250,247,242,.5)' }}
        />

        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder={t('pastePlaceholder')}
          className="w-full px-4 py-3.5 rounded-xl outline-none text-sm resize-y"
          style={{ minHeight: 180, border: `1.5px solid ${CREAM.border}`, color: CREAM.ink, background: 'rgba(250,247,242,.5)', lineHeight: 1.7 }}
        />

        <div className="flex items-center gap-1.5 text-xs px-0.5" style={{ color: CREAM.muted }}>
          <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-60" />
          {t('pasteHint')}
        </div>

        <button
          onClick={handleParse}
          disabled={busy || !text.trim()}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-white text-[15px] font-semibold disabled:opacity-50 transition-transform active:scale-[.98]"
          style={{ background: CREAM.green, boxShadow: '0 4px 16px rgba(5,150,105,.25)' }}
        >
          {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
          {busy ? t('aiCategorizing') : t('parseList')}
        </button>
      </div>

      {/* Parsed preview */}
      {parsed && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card }} className="p-4 flex flex-col gap-3">
          <div className="text-[13px] font-bold uppercase tracking-wide" style={{ color: CREAM.muted }}>
            {parsed.items.length} {t('itemsInCategories').replace('{cats}', parsed.groups.length)}
          </div>
          {parsed.groups.map((g) => {
            const meta = getCategoryMeta(g.key);
            const nm = isRTL ? meta.he : meta.en;
            return (
              <div key={g.key} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(250,247,242,.6)', border: `1px solid ${CREAM.borderLight}` }}>
                <span className="text-xl w-7 text-center">{meta.emoji}</span>
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  <span className="text-[13px] font-semibold" style={{ color: CREAM.ink }}>{nm}</span>
                  <span className="text-[11px] truncate" style={{ color: CREAM.muted }}>{g.items.map((i) => i.name).join(', ')}</span>
                </div>
                <span className="text-base font-semibold min-w-6 text-center" style={{ fontFamily: display, color: CREAM.green }}>{g.items.length}</span>
              </div>
            );
          })}
          <button
            onClick={() => onCreate(name.trim() || t('shoppingTitle'), text, parsed.items)}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-[15px] font-semibold mt-1 transition-transform active:scale-[.98]"
            style={{ background: CREAM.green, boxShadow: '0 4px 16px rgba(5,150,105,.25)' }}
          >
            <Check className="w-5 h-5" strokeWidth={2.5} />
            {t('createListWith')} — {parsed.items.length} {t('itemsCount')}
          </button>
        </motion.div>
      )}
    </div>
  );
};

/* ── History Card ─────────────────────────────────────────── */
const HistoryCard = ({ list, onReopen, onDelete, t, locale }) => {
  const done = (list.items || []).filter((i) => i.checked).length;
  const total = (list.items || []).length;
  const date = list.createdAt && isValid(parseISO(list.createdAt)) ? format(parseISO(list.createdAt), 'dd/MM', { locale }) : '';
  return (
    <div style={{ ...card, borderRadius: 12 }} className="flex items-center gap-3 px-4 py-3">
      <div className="w-9 h-9 rounded-[10px] flex items-center justify-center text-lg" style={{ background: 'rgba(180,140,80,.06)' }}>🛒</div>
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-semibold truncate" style={{ color: CREAM.ink }}>{list.name} {date && `• ${date}`}</span>
        <span className="text-[11px]" style={{ color: CREAM.muted }}>{total} {t('itemsCount')} · {done}/{total} {t('completedItems')}</span>
      </div>
      <button onClick={onReopen} className="text-[11px] font-semibold px-2.5 py-1.5 rounded-lg" style={{ background: CREAM.greenLight, color: CREAM.green }}>
        {t('reopenList')}
      </button>
      <button onClick={onDelete} aria-label={t('delete')} className="text-[11px] font-semibold w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(220,38,38,.06)', color: 'rgba(220,38,38,.7)' }}>
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

/* ── Main View ────────────────────────────────────────────── */
export const ShoppingListView = () => {
  const { t, language } = useTranslation();
  const isRTL = language === 'he';
  const locale = isRTL ? heLocale : undefined;

  const shoppingLists = useStore((s) => s.data.shoppingLists);
  const createShoppingList = useStore((s) => s.createShoppingList);
  const toggleShoppingItem = useStore((s) => s.toggleShoppingItem);
  const addShoppingItem = useStore((s) => s.addShoppingItem);
  const updateShoppingItem = useStore((s) => s.updateShoppingItem);
  const removeShoppingItem = useStore((s) => s.removeShoppingItem);
  const clearShoppingList = useStore((s) => s.clearShoppingList);
  const reopenShoppingList = useStore((s) => s.reopenShoppingList);
  const deleteShoppingList = useStore((s) => s.deleteShoppingList);
  const learnGroceryItems = useStore((s) => s.learnGroceryItems);

  const [mode, setMode] = useState('view'); // 'view' | 'paste'
  const [editItem, setEditItem] = useState(null);
  const [openOverrides, setOpenOverrides] = useState({});

  const activeList = useMemo(() => shoppingLists.find((l) => l.isActive), [shoppingLists]);
  const history = useMemo(() => shoppingLists.filter((l) => !l.isActive), [shoppingLists]);
  const groups = useMemo(() => (activeList ? groupByCategory(activeList.items || []) : []), [activeList]);

  const totals = useMemo(() => {
    const items = activeList?.items || [];
    return { done: items.filter((i) => i.checked).length, total: items.length };
  }, [activeList]);
  const pct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;

  const isCatOpen = (g) => {
    if (g.key in openOverrides) return openOverrides[g.key];
    const allDone = g.items.length > 0 && g.items.every((i) => i.checked);
    return !allDone; // auto-collapse completed categories
  };
  // Flip based on the category's *actual current* open state, so the first tap
  // on an auto-collapsed (completed) category reliably expands it.
  const toggleCat = (g) => setOpenOverrides((o) => ({ ...o, [g.key]: !isCatOpen(g) }));

  const handleCreate = async (name, rawText, items) => {
    await createShoppingList(name, rawText, items);
    setMode('view');
    setOpenOverrides({});
    toast.success(t('addedSuccessfully'));
  };

  const handleShare = async () => {
    if (!activeList) return;
    const lines = [`🛒 ${activeList.name}`, ''];
    groups.forEach((g) => {
      const meta = getCategoryMeta(g.key);
      lines.push(`${meta.emoji} ${language === 'he' ? meta.he : meta.en}`);
      g.items.forEach((it) => {
        const q = it.qty ? ` (${it.qty}${it.unit ? ' ' + it.unit : ''})` : '';
        lines.push(`${it.checked ? '✓' : '▢'} ${it.name}${q}`);
      });
      lines.push('');
    });
    const text = lines.join('\n').trim();
    try {
      if (navigator.share) {
        await navigator.share({ title: activeList.name, text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success(t('listCopied'));
      }
    } catch { /* user cancelled share */ }
  };

  const handleClear = () => {
    if (!activeList) return;
    if (window.confirm(t('clearListConfirm'))) {
      clearShoppingList(activeList.id);
      setOpenOverrides({});
    }
  };

  /* — Paste mode — */
  if (mode === 'paste') {
    return (
      <div className="max-w-xl mx-auto px-4 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <PasteView onCancel={() => setMode('view')} onCreate={handleCreate} t={t} isRTL={isRTL} />
      </div>
    );
  }

  /* — Empty state — */
  if (!activeList) {
    return (
      <div className="max-w-xl mx-auto px-4 py-4 flex flex-col" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center justify-center gap-6 py-12">
          <div className="w-40 h-40 rounded-full flex items-center justify-center relative" style={{ background: 'linear-gradient(145deg, #D1FAE5, rgba(5,150,105,.08))' }}>
            <ShoppingCart className="w-16 h-16" style={{ color: CREAM.green }} strokeWidth={1.5} />
          </div>
          <div className="text-2xl text-center" style={{ fontFamily: serif, color: CREAM.ink }}>{t('noActiveShoppingList')}</div>
          <p className="text-sm text-center max-w-xs leading-relaxed" style={{ color: CREAM.muted }}>{t('noActiveShoppingSub')}</p>
          <button
            onClick={() => setMode('paste')}
            className="flex items-center gap-2.5 px-7 py-3.5 rounded-2xl text-white text-[15px] font-semibold transition-transform active:scale-[.97]"
            style={{ background: CREAM.green, boxShadow: '0 4px 16px rgba(5,150,105,.25)' }}
          >
            <ClipboardPaste className="w-5 h-5" />
            {t('pasteFromWhatsApp')}
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex flex-col gap-2.5 mt-2">
            <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide px-1 py-1" style={{ color: CREAM.muted }}>
              <History className="w-4 h-4 opacity-60" />{t('shoppingHistory')}
            </div>
            {history.map((l) => (
              <HistoryCard key={l.id} list={l} t={t} locale={locale}
                onReopen={() => reopenShoppingList(l.id)}
                onDelete={() => { if (window.confirm(t('deleteListConfirm'))) deleteShoppingList(l.id); }}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  /* — Active list — */
  return (
    <div className="max-w-xl mx-auto px-4 py-4 flex flex-col gap-3.5" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Progress */}
      <div style={{ ...card }} className="flex items-center gap-3.5 px-4 py-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="text-sm font-semibold flex items-baseline gap-1.5" style={{ color: CREAM.ink }}>
            <span style={{ fontFamily: display, fontSize: 22, fontWeight: 700, color: CREAM.green }}>{totals.done}</span>
            / {totals.total} {t('itemsCount')}
          </div>
          <div className="text-[11px] truncate" style={{ color: CREAM.muted }}>{activeList.name}</div>
        </div>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(180,140,80,.08)' }}>
          <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#10B981,#059669)' }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div className="text-base font-semibold min-w-9 text-center" style={{ fontFamily: display, color: CREAM.green }}>{pct}%</div>
        <button
          onClick={handleShare}
          aria-label={t('shareList')}
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors hover:bg-[rgba(5,150,105,.08)] focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          style={{ color: CREAM.green }}
        >
          <Share2 className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-2.5">
        {groups.map((g) => (
          <CategorySection
            key={g.key}
            group={g}
            isOpen={isCatOpen(g)}
            onToggleOpen={() => toggleCat(g)}
            onToggleItem={(itemId) => toggleShoppingItem(activeList.id, itemId)}
            onEditItem={(item) => setEditItem(item)}
            onDeleteItem={(itemId) => removeShoppingItem(activeList.id, itemId)}
            onAddItem={(nameVal, catKey) => addShoppingItem(activeList.id, { name: nameVal, category: catKey })}
            t={t}
            language={language}
            isRTL={isRTL}
          />
        ))}
      </div>

      {/* Clear */}
      <button
        onClick={handleClear}
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-medium transition-colors"
        style={{ border: `1px dashed rgba(180,140,80,.25)`, color: CREAM.muted }}
      >
        <Trash2 className="w-4 h-4" />
        {t('clearListDone')}
      </button>

      {/* New list */}
      <button
        onClick={() => setMode('paste')}
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold transition-colors"
        style={{ background: CREAM.greenLight, color: CREAM.green }}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        {t('newShoppingList')}
      </button>

      {/* History */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2.5 mt-2">
          <div className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-wide px-1 py-1" style={{ color: CREAM.muted }}>
            <History className="w-4 h-4 opacity-60" />{t('shoppingHistory')}
          </div>
          {history.map((l) => (
            <HistoryCard key={l.id} list={l} t={t} locale={locale}
              onReopen={() => reopenShoppingList(l.id)}
              onDelete={() => { if (window.confirm(t('deleteListConfirm'))) deleteShoppingList(l.id); }}
            />
          ))}
        </div>
      )}

      <AnimatePresence>
        {editItem && (
          <EditItemModal
            item={editItem}
            t={t}
            isRTL={isRTL}
            language={language}
            onClose={() => setEditItem(null)}
            onSave={(patch, categoryChanged) => {
              updateShoppingItem(activeList.id, editItem.id, patch);
              // A manual category correction teaches the dictionary (local +
              // Firestore) so the same product auto-files correctly next time.
              if (categoryChanged && patch.name) {
                learnGroceryItems(learnCategory(patch.name, patch.category));
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
