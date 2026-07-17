'use client';

import React from 'react';
import { Star, StarHalf } from 'lucide-react';

// Renders 5 stars for a 0-5 rating, matching the Blade full/half/outline logic.
export default function StarRating({ rating = 0, size = 14, showValue = true }: { rating?: number; size?: number; showValue?: boolean }) {
  const value = Number(rating) || 0;
  return (
    <span className="inline-flex items-center gap-0.5 text-warning">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = i <= Math.floor(value);
        const half = !full && value > i - 1 && value < i;
        return full ? (
          <Star key={i} size={size} className="fill-warning text-warning" />
        ) : half ? (
          <StarHalf key={i} size={size} className="fill-warning text-warning" />
        ) : (
          <Star key={i} size={size} className="text-neutral-gray-300" />
        );
      })}
      {showValue && <span className="ml-1 text-xs text-neutral-gray-600">({value.toFixed(1)})</span>}
    </span>
  );
}
