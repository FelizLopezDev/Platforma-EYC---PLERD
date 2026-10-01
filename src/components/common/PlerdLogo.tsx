import React from 'react';

interface PlerdLogoProps {
  /**
   * Layout format:
   * - 'horizontal': Logo arc on the left with "PLERD" and subtitle on the right (ideal for headers/navbars)
   * - 'vertical': Logo arc on top with typography underneath (ideal for login screens, hero areas)
   * - 'icon-only': Just the circular arc icon symbol
   */
  variant?: 'horizontal' | 'vertical' | 'icon-only';
  /**
   * Theme mode:
   * - 'default': Dark navy text with original vibrant multi-color arc (for white/light backgrounds)
   * - 'white': White typography with original arc (for deep blue/dark backgrounds)
   */
  theme?: 'default' | 'white';
  /**
   * Height size preset or custom number
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  showSubtitle?: boolean;
  subtitle?: string;
  secondaryText?: string;
}

/**
 * Official PLERD (Programa de Liderazgo Educativo) Vector Logo.
 * Faithfully reproduces the official multi-colored segmented fan/arc motif:
 * - 8 radial colored segments: Teal/Cyan, Sky Blue, Primary Blue, Deep Blue, Red, Orange, Amber/Yellow, Mint/Green
 * - Lower ribbon/open book curved bracket base
 * - Clean institutional typography: "PLERD" + "MINISTERIO DE EDUCACIÓN / PROGRAMA DE LIDERAZGO EDUCATIVO"
 */
export const PlerdLogo: React.FC<PlerdLogoProps> = ({
  variant = 'horizontal',
  theme = 'default',
  size = 'md',
  className = '',
  showSubtitle = true,
  subtitle,
  secondaryText,
}) => {
  // Dimension calculation
  let iconHeight = 36;
  if (typeof size === 'number') {
    iconHeight = size;
  } else {
    switch (size) {
      case 'sm':
        iconHeight = 28;
        break;
      case 'md':
        iconHeight = 38;
        break;
      case 'lg':
        iconHeight = 52;
        break;
      case 'xl':
        iconHeight = 72;
        break;
    }
  }

  const isWhite = theme === 'white';
  const primaryTextColor = isWhite ? '#ffffff' : '#002B49'; // PLERD Deep Navy
  const secondaryTextColor = isWhite ? '#93c5fd' : '#006699'; // PLERD Institutional Blue
  const subtextColor = isWhite ? '#cbd5e1' : '#475569';

  // SVG graphic representing the exact PLERD multi-color arc + base
  const ArcIcon = (
    <svg
      viewBox="0 0 100 80"
      height={iconHeight}
      width={(iconHeight * 100) / 80}
      className="shrink-0 select-none"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Logo PLERD"
    >
      {/* 8 Radial Segments of the official PLERD arc */}
      {/* Segment 1: Cyan / Light Teal (leftmost) */}
      <path
        d="M 12 50 A 40 40 0 0 1 16 35 L 29 41 A 26 26 0 0 0 26 50 Z"
        fill="#00B2B2"
      />
      {/* Segment 2: Turquoise / Cyan Blue */}
      <path
        d="M 17 33 A 40 40 0 0 1 27 21 L 37 31 A 26 26 0 0 0 30 39 Z"
        fill="#0099CC"
      />
      {/* Segment 3: Primary Institutional Blue */}
      <path
        d="M 29 19 A 40 40 0 0 1 43 12 L 47 26 A 26 26 0 0 0 38 30 Z"
        fill="#006699"
      />
      {/* Segment 4: Deep Navy Blue */}
      <path
        d="M 45 11 A 40 40 0 0 1 55 11 L 53 26 A 26 26 0 0 0 47 26 Z"
        fill="#002B49"
      />
      {/* Segment 5: Dark Indigo / Red-Violet */}
      <path
        d="M 57 12 A 40 40 0 0 1 71 19 L 62 30 A 26 26 0 0 0 53 26 Z"
        fill="#C92437"
      />
      {/* Segment 6: Red / Warm Orange */}
      <path
        d="M 73 21 A 40 40 0 0 1 83 33 L 70 39 A 26 26 0 0 0 63 31 Z"
        fill="#E85D04"
      />
      {/* Segment 7: Warm Amber / Gold */}
      <path
        d="M 84 35 A 40 40 0 0 1 88 50 L 74 50 A 26 26 0 0 0 71 41 Z"
        fill="#F48C06"
      />
      {/* Segment 8: Yellow-Orange (bottom right accent) */}
      <path
        d="M 85 45 A 38 38 0 0 1 88 50 L 74 50 A 24 24 0 0 0 73 47 Z"
        fill="#FAA307"
      />

      {/* Base Open Book / Foundation Ribbon Motif */}
      <path
        d="M 14 56 C 28 56 42 61 50 67 C 58 61 72 56 86 56"
        stroke="#006699"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M 20 62 C 32 62 44 66 50 71 C 56 66 68 62 80 62"
        stroke="#00B2B2"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center shrink-0 ${className}`}>{ArcIcon}</div>;
  }

  if (variant === 'vertical') {
    return (
      <div className={`inline-flex flex-col items-center text-center ${className}`}>
        {ArcIcon}
        <div className="mt-2 flex flex-col items-center">
          <span
            className="font-display font-black tracking-tight leading-none text-2xl sm:text-3xl"
            style={{ color: primaryTextColor }}
          >
            PLERD
          </span>
          {showSubtitle && (
            <div className="mt-1 flex flex-col items-center gap-0.5">
              {(secondaryText !== undefined ? secondaryText : 'MINISTERIO DE EDUCACIÓN') && (
                <span
                  className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider leading-none"
                  style={{ color: secondaryTextColor }}
                >
                  {secondaryText !== undefined ? secondaryText : 'MINISTERIO DE EDUCACIÓN'}
                </span>
              )}
              {(subtitle !== undefined ? subtitle : 'PROGRAMA DE LIDERAZGO EDUCATIVO') && (
                <span
                  className="text-[9px] sm:text-[10px] font-medium tracking-normal leading-tight"
                  style={{ color: subtextColor }}
                >
                  {subtitle !== undefined ? subtitle : 'PROGRAMA DE LIDERAZGO EDUCATIVO'}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Horizontal variant (default)
  return (
    <div className={`inline-flex items-center gap-3 shrink-0 ${className}`}>
      {ArcIcon}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display font-black tracking-tight leading-none text-lg sm:text-xl"
            style={{ color: primaryTextColor }}
          >
            PLERD
          </span>
        </div>
        {showSubtitle && (
          <span
            className="text-[10.5px] sm:text-[11px] font-medium leading-tight tracking-tight mt-0.5 truncate"
            style={{ color: secondaryTextColor }}
          >
            Programa de Liderazgo Educativo
          </span>
        )}
      </div>
    </div>
  );
};
