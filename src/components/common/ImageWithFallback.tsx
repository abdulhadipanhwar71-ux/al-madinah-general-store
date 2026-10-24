import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackText?: string;
}

export const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover',
  fallbackText = 'Grocery Item',
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  if (error || !src) {
    return (
      <div className={`bg-emerald-50 dark:bg-emerald-950/40 flex flex-col items-center justify-center text-emerald-800 dark:text-emerald-300 p-2 text-center select-none ${className}`}>
        <ShoppingBag className="w-6 h-6 mb-1 opacity-70" />
        <span className="text-[11px] font-medium leading-tight truncate max-w-full px-1">{fallbackText}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 dark:bg-slate-800">
      {loading && (
        <div className="absolute inset-0 bg-stone-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
        onLoad={() => setLoading(false)}
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
};
