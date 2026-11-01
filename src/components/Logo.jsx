import React from "react";

/**
 * StaySphere Luxury Vector Brand Logo
 *
 * Variants:
 *  - "navbar": Compact horizontal lockup with luxury emblem and typography.
 *  - "full": Standard horizontal brand logo with tagline.
 *  - "stacked": Centered insignia emblem with luxury wordmark below.
 *  - "icon-only": High-detail luxury vector crest only.
 *  - "voucher": Official tax folio / voucher header mark with crest and sub-certifications.
 *
 * Themes:
 *  - "default": Deep emerald text, metallic gold emblem accents.
 *  - "light": White text and gold accents for dark/colored backgrounds.
 *  - "gold": Full metallic champagne gold gradient for luxury banners.
 *  - "monochrome": Clean black/charcoal for crisp printing.
 */
export default function Logo({
  variant = "navbar",
  size = "md",
  theme = "default",
  className = "",
  showTagline = true,
}) {
  // Sizing maps
  const iconSizes = {
    xs: 26,
    sm: 32,
    md: 40,
    lg: 52,
    xl: 68,
  };

  const px = typeof size === "number" ? size : iconSizes[size] || 40;

  // The custom luxury vector crest:
  // Celestial orbital rings, architectural sanctuary dome archway, and 8-point Polaris crown
  const renderEmblem = (dim = px) => (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="staysphere-crest"
      aria-label="StaySphere Emblem"
    >
      <defs>
        {/* Luxury 5-Stop Metallic Gold Gradient */}
        <linearGradient id="ssGoldMet" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#DFC06E" />
          <stop offset="25%" stopColor="#F7E7A9" />
          <stop offset="50%" stopColor="#C99B3B" />
          <stop offset="75%" stopColor="#F4DF9B" />
          <stop offset="100%" stopColor="#A87920" />
        </linearGradient>

        {/* Deep Royal Midnight Emerald Gradient */}
        <linearGradient id="ssEmeraldDark" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#124033" />
          <stop offset="100%" stopColor="#081E18" />
        </linearGradient>

        {/* Subtle Inner Glow */}
        <radialGradient id="ssCenterGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C99B3B" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#C99B3B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Outer Sanctuary Shield Base */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="26"
        fill="url(#ssEmeraldDark)"
        stroke="url(#ssGoldMet)"
        strokeWidth="1.5"
      />

      {/* 2. Soft Gold Radial Aura in the Center */}
      <circle cx="50" cy="50" r="38" fill="url(#ssCenterGlow)" />

      {/* 3. Outer Concentric Fine Hairline Ring */}
      <circle
        cx="50"
        cy="50"
        r="39"
        stroke="url(#ssGoldMet)"
        strokeWidth="0.8"
        strokeDasharray="2 3"
        opacity="0.65"
      />

      {/* 4. Interlocking Celestial Orbit Bands (The "Sphere") */}
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="17"
        stroke="url(#ssGoldMet)"
        strokeWidth="1.2"
        transform="rotate(-28 50 50)"
        opacity="0.85"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="17"
        stroke="url(#ssGoldMet)"
        strokeWidth="1.2"
        transform="rotate(28 50 50)"
        opacity="0.85"
      />

      {/* 5. Center Architectural Sanctuary Pavilion Arch (The "Stay") */}
      {/* Outer Arch */}
      <path
        d="M 33 68 L 33 46 C 33 34 40 28 50 25 C 60 28 67 34 67 46 L 67 68"
        stroke="url(#ssGoldMet)"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Inner Keyhole Arch */}
      <path
        d="M 39 68 L 39 48 C 39 40 44 34 50 32 C 56 34 61 40 61 48 L 61 68"
        stroke="url(#ssGoldMet)"
        strokeWidth="1.2"
        fill="#071712"
        fillOpacity="0.7"
      />

      {/* Architectural Base Plinth */}
      <line
        x1="27"
        y1="68"
        x2="73"
        y2="68"
        stroke="url(#ssGoldMet)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <line
        x1="31"
        y1="72"
        x2="69"
        y2="72"
        stroke="url(#ssGoldMet)"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* 6. Eight-Point Polaris Luxury Compass Star at Apex */}
      <g transform="translate(50, 16)">
        <polygon
          points="0,-8 2,-2 8,0 2,2 0,8 -2,2 -8,0 -2,-2"
          fill="url(#ssGoldMet)"
        />
        <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" />
      </g>

      {/* 7. Central Radiant Gem within Sanctuary Portal */}
      <circle cx="50" cy="49" r="3.5" fill="url(#ssGoldMet)" />
      <circle cx="50" cy="49" r="1.5" fill="#FFFFFF" />
    </svg>
  );

  // Icon only
  if (variant === "icon-only") {
    return (
      <div className={`staysphere-logo-icon ${className}`}>
        {renderEmblem()}
      </div>
    );
  }

  // Voucher / Tax Invoice Folio Header Logo
  if (variant === "voucher") {
    return (
      <div className={`staysphere-voucher-logo ${className}`}>
        {renderEmblem(px || 54)}
        <div className="voucher-logo-text">
          <div className="voucher-brand-line">
            <span className="voucher-brand-name">STAYSPHERE</span>
            <span className="voucher-reg-mark">®</span>
          </div>
          <span className="voucher-brand-tagline">
            GLOBAL LUXURY RETREATS & RESORTS
          </span>
          <span className="voucher-cert-sub">
            Verified Accommodation & Hospitality Folio
          </span>
        </div>
      </div>
    );
  }

  // Stacked centered logo (for Auth pages or modals)
  if (variant === "stacked") {
    return (
      <div className={`staysphere-logo-stacked theme-${theme} ${className}`}>
        {renderEmblem(px || 56)}
        <div className="logo-stacked-typography">
          <span className="logo-title-main">STAYSPHERE</span>
          {showTagline && (
            <span className="logo-tagline-sub">LUXURY STAYS & EXPERIENCES</span>
          )}
        </div>
      </div>
    );
  }

  // Default navbar horizontal lockup
  return (
    <div className={`staysphere-brand-lockup theme-${theme} ${className}`}>
      <div className="brand-crest-wrapper">{renderEmblem(px)}</div>
      <div className="brand-text-wrapper">
        <div className="brand-title-row">
          <span className="brand-title-text">StaySphere</span>
          <span className="brand-star-accent">✦</span>
        </div>
        {showTagline && (
          <span className="brand-subtitle-text">
            Luxury Stays & Experiences
          </span>
        )}
      </div>
    </div>
  );
}

