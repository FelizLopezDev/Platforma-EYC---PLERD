import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  theme?: 'dark' | 'light' | 'gold' | 'cyan';
}

export const InstitutionalLogo: React.FC<LogoProps> = ({
  size = 'md',
  className = '',
  theme = 'dark',
}) => {
  let dimension = 64;
  if (typeof size === 'number') {
    dimension = size;
  } else {
    switch (size) {
      case 'sm':
        dimension = 40;
        break;
      case 'md':
        dimension = 64;
        break;
      case 'lg':
        dimension = 96;
        break;
      case 'xl':
        dimension = 128;
        break;
    }
  }

  // Exact brand colors matching the official seal:
  // Deep navy ink base #0c1f33, light blue #80b6dc / #a2d2f2 (or protocol gold #ecc978)
  const isGold = theme === 'gold';
  const isCyan = theme === 'cyan';
  const strokeColor = isGold ? '#ecc978' : isCyan ? '#4faee8' : '#80b6dc';
  const textColor = isGold ? '#ecc978' : isCyan ? '#4faee8' : '#80b6dc';
  const bgColor = isCyan ? 'rgba(8, 20, 34, 0.85)' : '#0c1f33';

  return (
    <div
      id="institutional-seal-logo"
      className={`inline-flex items-center justify-center rounded-full shrink-0 select-none shadow-xs ${className}`}
      style={{ width: dimension, height: dimension }}
      title="Sello Oficial Club Escolar R-10 — Ministerio de Educación PLE-RD (Faro a Colón)"
    >
      <svg
        viewBox="0 0 200 200"
        width={dimension}
        height={dimension}
        className="w-full h-full"
      >
        <defs>
          {/* Top text arc path */}
          <path
            id="sealTextTop"
            d="M 23,100 A 77,77 0 0,1 177,100"
            fill="none"
          />
          {/* Bottom text arc path */}
          <path
            id="sealTextBottom"
            d="M 181,100 A 81,81 0 0,1 19,100"
            fill="none"
          />
        </defs>

        {/* Circular background - deep navy base */}
        <circle cx="100" cy="100" r="96" fill={bgColor} />

        {/* Outer border ring */}
        <circle
          cx="100"
          cy="100"
          r="95"
          fill="none"
          stroke={strokeColor}
          strokeWidth="4"
        />

        {/* Outer inscribed text: CLUB ESCOLAR-R10 */}
        <text
          fill={textColor}
          fontSize="14.5"
          fontWeight="800"
          letterSpacing="3.5"
          fontFamily="'Outfit', sans-serif"
          style={{ textTransform: 'uppercase' }}
        >
          <textPath href="#sealTextTop" startOffset="50%" textAnchor="middle">
            CLUB ESCOLAR-R10
          </textPath>
        </text>

        {/* Bottom inscribed text: MINISTERIO DE EDUCACIÓN - PLE-RD */}
        <text
          fill={textColor}
          fontSize="9.2"
          fontWeight="700"
          letterSpacing="1.2"
          fontFamily="'Outfit', sans-serif"
          style={{ textTransform: 'uppercase' }}
        >
          <textPath href="#sealTextBottom" startOffset="50%" textAnchor="middle">
            MINISTERIO DE EDUCACIÓN - PLE-RD
          </textPath>
        </text>

        {/* Inner concentric ring dividing text from monument */}
        <circle
          cx="100"
          cy="100"
          r="69"
          fill={bgColor}
          stroke={strokeColor}
          strokeWidth="3"
        />

        {/* Architectural Monument: Faro a Colón */}
        <g
          stroke={strokeColor}
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          {/* --- Beacon Lantern Crown (Top) --- */}
          {/* Lantern roof */}
          <line x1="83" y1="68" x2="117" y2="68" strokeWidth="2.8" />
          {/* Lantern sides */}
          <line x1="83" y1="68" x2="85" y2="79" />
          <line x1="117" y1="68" x2="115" y2="79" />
          {/* Lantern floor */}
          <line x1="85" y1="79" x2="115" y2="79" strokeWidth="2.5" />
          {/* Vertical window panes / mullions */}
          <line x1="89" y1="70" x2="89" y2="78" strokeWidth="2" />
          <line x1="94" y1="70" x2="94" y2="78" strokeWidth="2" />
          <line x1="100" y1="70" x2="100" y2="78" strokeWidth="2" />
          <line x1="106" y1="70" x2="106" y2="78" strokeWidth="2" />
          <line x1="111" y1="70" x2="111" y2="78" strokeWidth="2" />
          {/* Lantern neck */}
          <line x1="90" y1="79" x2="90" y2="83" />
          <line x1="110" y1="79" x2="110" y2="83" />

          {/* --- Central Vertical Column / Tower Shaft --- */}
          {/* Shaft outer edges */}
          <line x1="90" y1="83" x2="90" y2="142" />
          <line x1="110" y1="83" x2="110" y2="142" />
          {/* Double center groove */}
          <line x1="97" y1="83" x2="97" y2="142" strokeWidth="2" />
          <line x1="103" y1="83" x2="103" y2="142" strokeWidth="2" />

          {/* --- Entrance Portal (Base of Central Tower) --- */}
          {/* Outer portal frame */}
          <path d="M 86,161 L 86,142 L 114,142 L 114,161" />
          {/* Inner doorway */}
          <path d="M 92,161 L 92,148 L 108,148 L 108,161" />
          {/* Center door divide */}
          <line x1="100" y1="148" x2="100" y2="161" strokeWidth="1.8" />

          {/* --- Left Stepped Monolithic Wing --- */}
          {/* Top chamfer / angle cap */}
          <path d="M 90,91 L 74,82 L 58,86 L 58,104" />
          {/* Step 1 ledge */}
          <line x1="58" y1="104" x2="50" y2="104" />
          {/* Tier 2 wall */}
          <line x1="50" y1="104" x2="50" y2="124" />
          {/* Step 2 ledge */}
          <line x1="50" y1="124" x2="42" y2="124" />
          {/* Tier 3 wall and base corner */}
          <path d="M 42,124 L 42,148 L 36,154 L 36,161" />

          {/* Left Wing Internal Structural Perspective Lines */}
          {/* Vertical crease / ridge */}
          <line x1="74" y1="82" x2="74" y2="161" />
          {/* Horizontal shelf connect lines */}
          <line x1="74" y1="104" x2="90" y2="104" />
          <line x1="74" y1="124" x2="90" y2="124" />
          <line x1="42" y1="144" x2="90" y2="144" />
          {/* Upper facet diagonal */}
          <line x1="90" y1="91" x2="74" y2="104" strokeWidth="1.8" />

          {/* --- Right Stepped Monolithic Wing (Symmetric) --- */}
          {/* Top chamfer / angle cap */}
          <path d="M 110,91 L 126,82 L 142,86 L 142,104" />
          {/* Step 1 ledge */}
          <line x1="142" y1="104" x2="150" y2="104" />
          {/* Tier 2 wall */}
          <line x1="150" y1="104" x2="150" y2="124" />
          {/* Step 2 ledge */}
          <line x1="150" y1="124" x2="158" y2="124" />
          {/* Tier 3 wall and base corner */}
          <path d="M 158,124 L 158,148 L 164,154 L 164,161" />

          {/* Right Wing Internal Structural Perspective Lines */}
          {/* Vertical crease / ridge */}
          <line x1="126" y1="82" x2="126" y2="161" />
          {/* Horizontal shelf connect lines */}
          <line x1="110" y1="104" x2="126" y2="104" />
          <line x1="110" y1="124" x2="126" y2="124" />
          <line x1="110" y1="144" x2="158" y2="144" />
          {/* Upper facet diagonal */}
          <line x1="110" y1="91" x2="126" y2="104" strokeWidth="1.8" />

          {/* --- Foundation / Ground Lines --- */}
          <line x1="32" y1="161" x2="168" y2="161" strokeWidth="3" />
          <line x1="38" y1="165" x2="162" y2="165" strokeWidth="2" />
        </g>
      </svg>
    </div>
  );
};
