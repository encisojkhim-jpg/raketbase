import { useState } from 'react';
import { StarIcon } from './Icons';
import { formatAverage, reviewCountLabel } from '../utils/ratings';

// Read-only stars. Supports fractions, so 4.6 fills the fifth star 60%.
export function StarDisplay({ value, className = 'h-4 w-4' }) {
  const v = Number(value) || 0;
  return (
    <span
      role="img"
      aria-label={`${v.toFixed(1)} out of 5 stars`}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, v - (i - 1)));
        return (
          <span key={i} className={`relative inline-block shrink-0 ${className}`}>
            <StarIcon className={`absolute inset-0 h-full w-full text-text-secondary/30`} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <StarIcon className={`max-w-none text-accent ${className}`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

// Compact "★★★★★ 4.8 (12 reviews)" line, or a plain "No ratings yet" when empty.
// `rating` is a summary object: { average, count }.
export function RatingBadge({ rating, className = '' }) {
  if (!rating || !rating.count) {
    return <span className={`text-[12px] text-text-secondary ${className}`}>No ratings yet</span>;
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[12px] text-text-secondary ${className}`}>
      <StarDisplay value={rating.average} className="h-3.5 w-3.5" />
      <span className="font-semibold text-text">{formatAverage(rating.average)}</span>
      <span>({reviewCountLabel(rating.count)})</span>
    </span>
  );
}

// Clickable 1-5 star picker (keyboard accessible: tab to a star, Enter/Space to pick).
export function StarInput({ value, onChange, label, className = 'h-7 w-7', disabled = false }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div
      role="radiogroup"
      aria-label={label}
      onMouseLeave={() => setHover(0)}
      className="inline-flex items-center gap-0.5"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i === 1 ? '' : 's'}`}
          disabled={disabled}
          onClick={() => onChange(i)}
          onMouseEnter={() => setHover(i)}
          onFocus={() => setHover(i)}
          onBlur={() => setHover(0)}
          className="cursor-pointer rounded p-0.5 outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed"
        >
          <StarIcon
            className={`${className} transition-colors ${i <= shown ? 'text-accent' : 'text-text-secondary/30'}`}
          />
        </button>
      ))}
    </div>
  );
}
