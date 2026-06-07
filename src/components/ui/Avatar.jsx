import React, { useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Avatar — reusable avatar with photo + graceful fallback.
 *
 * Pulls a photo (if `src` provided and loads successfully); otherwise falls
 * back to a forest-green gradient circle with the user's `initial` in
 * Instrument Serif italic. Used in the header, profile screens, and any
 * place we show "the user".
 *
 * Sizes follow our cream v3 spec:
 *   32 → tiny chip (table rows, lists)
 *   40 → comments / inline
 *   56 → settings list profile row
 *   64 → settings index profile-hero card
 *   104→ profile sub-page hero (biggest)
 */
const SIZE_MAP = {
  32:  { box: 'w-8 h-8',     text: 'text-[13px]', border: 'border' },
  40:  { box: 'w-10 h-10',   text: 'text-[16px]', border: 'border' },
  56:  { box: 'w-14 h-14',   text: 'text-[22px]', border: 'border-2' },
  64:  { box: 'w-16 h-16',   text: 'text-[28px]', border: 'border-2' },
  104: { box: 'w-[104px] h-[104px]', text: 'text-[46px]', border: 'border-2' },
};

export const Avatar = ({
  src,
  initial = 'א',
  size = 40,
  variant = 'default',  // 'default' | 'outlined'
  className,
  alt = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const sz = SIZE_MAP[size] || SIZE_MAP[40];
  const showImage = src && !imgError;

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none',
        sz.box,
        // Cream v3 — gradient bg shown when no photo (or photo failed)
        !showImage && 'bg-gradient-to-br from-emerald-700 to-emerald-600 text-white',
        variant === 'outlined' && 'ring-2 ring-white/80',
        // Subtle shadow on bigger sizes for hierarchy
        size >= 56 && 'shadow-md shadow-emerald-900/20',
        className,
      )}
      aria-label={alt || `Avatar: ${initial}`}
      role="img"
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || initial}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <span
          className={cn(
            sz.text,
            // Editorial signature — Instrument Serif italic initial
            'font-serif italic font-normal leading-none',
          )}
          aria-hidden="true"
        >
          {(initial || '?').slice(0, 2)}
        </span>
      )}
    </div>
  );
};

export default Avatar;
