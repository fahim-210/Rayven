import React from 'react';
import { cn } from '../../lib/utils.ts';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSubtitle = false,
  className,
  onClick,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-2.5 select-none transition-opacity cursor-pointer group',
        className
      )}
    >
      {/* Modern Geometric Raven Crest Vector */}
      <div
        className={cn(
          'relative flex items-center justify-center rounded-lg bg-neutral-900 border border-neutral-700/90 text-amber-400 group-hover:border-amber-400/80 transition-colors shadow-md',
          iconSizes[size]
        )}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4/5 h-4/5 transform group-hover:scale-105 transition-transform"
        >
          {/* Stylized Sharp Raven Wing & Pitch Chevron */}
          <path
            d="M16 3L4 9L16 15L28 9L16 3Z"
            fill="currentColor"
            fillOpacity="0.9"
          />
          <path
            d="M4 12.5L16 18.5L28 12.5L25 15.5L16 20.5L7 15.5L4 12.5Z"
            fill="currentColor"
            fillOpacity="0.75"
          />
          <path
            d="M7 18.5L16 23.5L25 18.5L23 21.5L16 25.5L9 21.5L7 18.5Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
          <circle cx="16" cy="28.5" r="1.5" fill="#f59e0b" />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span
          className={cn(
            'font-heading font-black tracking-[0.2em] text-white uppercase leading-none group-hover:text-neutral-100 transition-colors',
            textSizes[size]
          )}
        >
          RAYVEN
        </span>
        {showSubtitle && (
          <span className="text-[9px] font-semibold tracking-[0.25em] text-neutral-400 uppercase mt-0.5">
            Football & Apparel
          </span>
        )}
      </div>
    </div>
  );
};
