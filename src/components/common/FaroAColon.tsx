import React from 'react';

interface FaroAColonProps {
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  theme?: 'ice' | 'gold' | 'white' | 'dark';
  className?: string;
}

export const FaroAColon: React.FC<FaroAColonProps> = ({
  size = 'md',
  color,
  theme = 'ice',
  className = '',
}) => {
  let width = 72;
  let height = 56;

  if (typeof size === 'number') {
    width = size;
    height = Math.round(size * (110 / 144));
  } else {
    switch (size) {
      case 'sm':
        width = 44;
        height = 34;
        break;
      case 'md':
        width = 72;
        height = 56;
        break;
      case 'lg':
        width = 96;
        height = 74;
        break;
      case 'xl':
        width = 130;
        height = 100;
        break;
    }
  }

  // Determine stroke color
  let strokeColor = color;
  if (!strokeColor) {
    switch (theme) {
      case 'gold':
        strokeColor = '#ecc978';
        break;
      case 'white':
        strokeColor = '#ffffff';
        break;
      case 'dark':
        strokeColor = '#0c1f33';
        break;
      case 'ice':
      default:
        strokeColor = '#8fc8f2';
        break;
    }
  }

  return (
    <div
      id="faro-a-colon-monument-icon"
      className={`inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width, height }}
      title="Monumento Faro a Colón — Isotipo Oficial Club Escolar R-10"
    >
      <svg
        viewBox="26 58 148 114"
        width={width}
        height={height}
        className="w-full h-full"
        fill="none"
      >
        <g
          stroke={strokeColor}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* --- Beacon Lantern Crown (Top) --- */}
          {/* Roof Cap */}
          <line x1="86" y1="62" x2="114" y2="62" strokeWidth="2.2" />
          {/* Lantern roof */}
          <line x1="82" y1="66" x2="118" y2="66" strokeWidth="2.8" />
          {/* Lantern sides */}
          <line x1="82" y1="66" x2="84" y2="77" />
          <line x1="118" y1="66" x2="116" y2="77" />
          {/* Lantern floor */}
          <line x1="84" y1="77" x2="116" y2="77" strokeWidth="2.5" />
          {/* Vertical window panes / mullions */}
          <line x1="89" y1="67" x2="89" y2="76" strokeWidth="1.8" />
          <line x1="94" y1="67" x2="94" y2="76" strokeWidth="1.8" />
          <line x1="100" y1="67" x2="100" y2="76" strokeWidth="1.8" />
          <line x1="106" y1="67" x2="106" y2="76" strokeWidth="1.8" />
          <line x1="111" y1="67" x2="111" y2="76" strokeWidth="1.8" />
          {/* Lantern neck */}
          <line x1="90" y1="77" x2="90" y2="82" />
          <line x1="110" y1="77" x2="110" y2="82" />

          {/* --- Central Vertical Column / Tower Shaft --- */}
          {/* Shaft outer edges */}
          <line x1="90" y1="82" x2="90" y2="142" />
          <line x1="110" y1="82" x2="110" y2="142" />
          {/* Double center groove */}
          <line x1="97" y1="82" x2="97" y2="142" strokeWidth="1.8" />
          <line x1="103" y1="82" x2="103" y2="142" strokeWidth="1.8" />

          {/* --- Entrance Portal (Base of Central Tower) --- */}
          {/* Outer portal frame */}
          <path d="M 86,162 L 86,142 L 114,142 L 114,162" />
          {/* Inner doorway */}
          <path d="M 92,162 L 92,148 L 108,148 L 108,162" />
          {/* Center door divide */}
          <line x1="100" y1="148" x2="100" y2="162" strokeWidth="1.6" />

          {/* --- Left Stepped Monolithic Wing --- */}
          {/* Top chamfer / angle cap */}
          <path d="M 90,90 L 74,80 L 56,84 L 56,104" />
          {/* Step 1 ledge */}
          <line x1="56" y1="104" x2="48" y2="104" />
          {/* Tier 2 wall */}
          <line x1="48" y1="104" x2="48" y2="124" />
          {/* Step 2 ledge */}
          <line x1="48" y1="124" x2="40" y2="124" />
          {/* Tier 3 wall and base corner */}
          <path d="M 40,124 L 40,146 L 34,152 L 34,162" />

          {/* Left Wing Internal Structural Perspective Lines */}
          {/* Vertical crease / ridge */}
          <line x1="74" y1="80" x2="74" y2="162" />
          {/* Horizontal shelf connect lines */}
          <line x1="74" y1="104" x2="90" y2="104" />
          <line x1="74" y1="124" x2="90" y2="124" />
          <line x1="40" y1="144" x2="90" y2="144" />
          {/* Upper facet diagonal */}
          <line x1="90" y1="90" x2="74" y2="104" strokeWidth="1.8" />

          {/* --- Right Stepped Monolithic Wing (Symmetric) --- */}
          {/* Top chamfer / angle cap */}
          <path d="M 110,90 L 126,80 L 144,84 L 144,104" />
          {/* Step 1 ledge */}
          <line x1="144" y1="104" x2="152" y2="104" />
          {/* Tier 2 wall */}
          <line x1="152" y1="104" x2="152" y2="124" />
          {/* Step 2 ledge */}
          <line x1="152" y1="124" x2="160" y2="124" />
          {/* Tier 3 wall and base corner */}
          <path d="M 160,124 L 160,146 L 166,152 L 166,162" />

          {/* Right Wing Internal Structural Perspective Lines */}
          {/* Vertical crease / ridge */}
          <line x1="126" y1="80" x2="126" y2="162" />
          {/* Horizontal shelf connect lines */}
          <line x1="110" y1="104" x2="126" y2="104" />
          <line x1="110" y1="124" x2="126" y2="124" />
          <line x1="110" y1="144" x2="160" y2="144" />
          {/* Upper facet diagonal */}
          <line x1="110" y1="90" x2="126" y2="104" strokeWidth="1.8" />

          {/* --- Foundation / Ground Lines --- */}
          <line x1="28" y1="162" x2="172" y2="162" strokeWidth="3" />
          <line x1="34" y1="166" x2="166" y2="166" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
