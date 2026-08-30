"use client";

import React from "react";

export type WaxSealColor = "crimson" | "gold" | "bronze" | "emerald" | "pearl" | "roseGold";
export type WaxSealIcon = "none" | "heart" | "rose" | "rings" | "olive" | "crown" | "floral";

export interface WaxSealProps {
  monogram?: string;
  icon?: WaxSealIcon;
  color?: WaxSealColor | string;
  size?: number;
  interactive?: boolean;
  pulse?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const COLOR_THEMES: Record<
  WaxSealColor,
  {
    base: string;
    gradient: string;
    border: string;
    innerGlow: string;
    textFill: string;
    textShadow: string;
    rimShadow: string;
  }
> = {
  crimson: {
    base: "#7f1d1d",
    gradient: "radial-gradient(circle at 35% 35%, #b91c1c 0%, #7f1d1d 55%, #450a0a 100%)",
    border: "#991b1b",
    innerGlow: "rgba(254, 202, 202, 0.4)",
    textFill: "#fecaca",
    textShadow: "0 1px 2px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.4)",
    rimShadow: "0 8px 24px rgba(69, 10, 10, 0.45), inset 0 2px 4px rgba(255,255,255,0.25)",
  },
  gold: {
    base: "#b45309",
    gradient: "radial-gradient(circle at 35% 35%, #fde047 0%, #d97706 45%, #78350f 100%)",
    border: "#ca8a04",
    innerGlow: "rgba(254, 240, 138, 0.6)",
    textFill: "#fef08a",
    textShadow: "0 1px 2px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.6)",
    rimShadow: "0 8px 24px rgba(120, 53, 15, 0.5), inset 0 2px 4px rgba(255,255,255,0.5)",
  },
  bronze: {
    base: "#57351f",
    gradient: "radial-gradient(circle at 35% 35%, #b37346 0%, #78350f 50%, #3d1c06 100%)",
    border: "#92400e",
    innerGlow: "rgba(251, 191, 36, 0.3)",
    textFill: "#fed7aa",
    textShadow: "0 1px 2px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.3)",
    rimShadow: "0 8px 24px rgba(61, 28, 6, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
  },
  emerald: {
    base: "#064e3b",
    gradient: "radial-gradient(circle at 35% 35%, #10b981 0%, #065f46 50%, #022c22 100%)",
    border: "#047857",
    innerGlow: "rgba(167, 243, 208, 0.4)",
    textFill: "#a7f3d0",
    textShadow: "0 1px 2px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.4)",
    rimShadow: "0 8px 24px rgba(2, 44, 34, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)",
  },
  pearl: {
    base: "#f5f5f4",
    gradient: "radial-gradient(circle at 35% 35%, #ffffff 0%, #e7e5e4 50%, #a8a29e 100%)",
    border: "#d6d3d1",
    innerGlow: "rgba(255, 255, 255, 0.8)",
    textFill: "#57534e",
    textShadow: "0 1px 1px rgba(255,255,255,0.9), inset 0 1px 1px rgba(0,0,0,0.2)",
    rimShadow: "0 8px 24px rgba(87, 83, 78, 0.25), inset 0 2px 4px rgba(255,255,255,0.8)",
  },
  roseGold: {
    base: "#9f4a54",
    gradient: "radial-gradient(circle at 35% 35%, #fecdd3 0%, #e11d48 45%, #881337 100%)",
    border: "#be123c",
    innerGlow: "rgba(255, 228, 230, 0.5)",
    textFill: "#ffe4e6",
    textShadow: "0 1px 2px rgba(0,0,0,0.7), inset 0 1px 1px rgba(255,255,255,0.5)",
    rimShadow: "0 8px 24px rgba(136, 19, 55, 0.45), inset 0 2px 4px rgba(255,255,255,0.4)",
  },
};

export function WaxSeal({
  monogram = "K & T",
  icon = "none",
  color = "crimson",
  size = 64,
  interactive = false,
  pulse = false,
  onClick,
  className = "",
  style,
}: WaxSealProps) {
  const theme =
    COLOR_THEMES[color as WaxSealColor] || COLOR_THEMES.crimson;

  const renderIconSvg = () => {
    switch (icon) {
      case "heart":
        return (
          <path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            fill={theme.textFill}
          />
        );
      case "rose":
        return (
          <path
            d="M12 2C9.5 2 7 3.5 7 6c0 1.9 1.1 3.5 2.7 4.3C8.6 11.1 8 12.4 8 14c0 3.3 2.7 6 6 6s6-2.7 6-6c0-1.6-.6-2.9-1.7-3.7C19.9 9.5 21 7.9 21 6c0-2.5-2.5-4-5-4-1.2 0-2.3.5-3 1.3C12.3 2.5 11.2 2 12 2z"
            fill={theme.textFill}
          />
        );
      case "rings":
        return (
          <g fill="none" stroke={theme.textFill} strokeWidth="2">
            <circle cx="9" cy="12" r="5" />
            <circle cx="15" cy="12" r="5" />
          </g>
        );
      case "olive":
        return (
          <path
            d="M12 3c-1.5 3-4 5-7 6 4 1 6 4 7 8 1-4 3-7 7-8-3-1-5.5-3-7-6z"
            fill={theme.textFill}
          />
        );
      case "crown":
        return (
          <path
            d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"
            fill={theme.textFill}
          />
        );
      case "floral":
        return (
          <path
            d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2zM6 16l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3zm12 0l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z"
            fill={theme.textFill}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${
        interactive ? "cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95" : ""
      } ${pulse ? "animate-pulse" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        ...style,
      }}
    >
      {/* 3D Wax Seal Organic Shell */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="absolute inset-0 w-full h-full filter drop-shadow-md"
        style={{
          filter: `drop-shadow(${theme.rimShadow.split(",")[0].replace("inset ", "")})`,
        }}
      >
        <defs>
          {/* Organic Wax Melt Filter */}
          <filter id={`wax-emboss-${color}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feSpecularLighting
              in="blur"
              surfaceScale="3"
              specularConstant="1.2"
              specularExponent="18"
              lightingColor="#ffffff"
              result="specOut"
            >
              <fePointLight x="-20" y="-20" z="80" />
            </feSpecularLighting>
            <feComposite in="specOut" in2="SourceAlpha" operator="in" result="specular" />
            <feComposite in="SourceGraphic" in2="specular" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
          </filter>

          <radialGradient id={`wax-grad-${color}`} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={theme.innerGlow} />
            <stop offset="60%" stopColor={theme.base} />
            <stop offset="100%" stopColor="#1a0505" />
          </radialGradient>
        </defs>

        {/* Organic Melt Edge Shape */}
        <path
          d="M 50,5 
             C 63,4 74,9 83,18 
             C 93,27 96,38 95,51 
             C 94,65 89,77 79,86 
             C 69,94 56,96 44,95 
             C 31,94 19,89 12,79 
             C 4,68 4,55 6,42 
             C 8,28 17,16 28,10 
             C 38,4 43,5 50,5 Z"
          fill={`url(#wax-grad-${color})`}
          stroke={theme.border}
          strokeWidth="1.5"
          filter={`url(#wax-emboss-${color})`}
        />

        {/* Inner Stamp Beveled Ring */}
        <circle
          cx="50"
          cy="50"
          r="34"
          fill="none"
          stroke={theme.border}
          strokeWidth="2"
          strokeDasharray="4 2"
          opacity="0.8"
        />
        <circle
          cx="50"
          cy="50"
          r="30"
          fill="none"
          stroke={theme.innerGlow}
          strokeWidth="1"
          opacity="0.6"
        />
      </svg>

      {/* Center Monogram / Icon */}
      <div
        className="relative z-10 flex flex-col items-center justify-center text-center"
        style={{
          width: size * 0.65,
          height: size * 0.65,
        }}
      >
        {icon !== "none" ? (
          <svg
            viewBox="0 0 24 24"
            className="w-full h-full drop-shadow-sm"
            style={{
              maxHeight: size * 0.45,
              maxWidth: size * 0.45,
              filter: `drop-shadow(0 1px 2px rgba(0,0,0,0.6))`,
            }}
          >
            {renderIconSvg()}
          </svg>
        ) : (
          <span
            className="font-serif font-bold tracking-wider leading-none"
            style={{
              fontSize: size > 70 ? size * 0.26 : size * 0.28,
              color: theme.textFill,
              fontFamily: "'Great Vibes', 'Dancing Script', 'Playfair Display', serif",
              textShadow: theme.textShadow,
              letterSpacing: size > 60 ? "1px" : "0px",
            }}
          >
            {monogram}
          </span>
        )}
      </div>
    </div>
  );
}

