"use client";

import React, { useState } from "react";
import { WaxSeal, WaxSealColor, WaxSealIcon } from "./WaxSeal";

export interface InteractiveEnvelope3DProps {
  groomName?: string;
  brideName?: string;
  monogram?: string;
  waxColor?: WaxSealColor;
  waxIcon?: WaxSealIcon;
  envelopeColor?: string;
  linerPattern?: "floral" | "gold" | "crimson" | "classic";
  guestName?: string;
  onOpen?: () => void;
  isOpen?: boolean;
}

export function InteractiveEnvelope3D({
  groomName = "Hoàng Nam",
  brideName = "Mai Linh",
  monogram,
  waxColor = "gold",
  waxIcon = "none",
  envelopeColor = "#fdf8f0",
  linerPattern = "floral",
  guestName,
  onOpen,
  isOpen = false,
}: InteractiveEnvelope3DProps) {
  const [opened, setOpened] = useState(isOpen);

  // Compute initials if monogram not provided
  const computedMonogram =
    monogram ||
    `${groomName.trim().charAt(0) || "K"} & ${brideName.trim().charAt(0) || "T"}`;

  const handleOpenClick = () => {
    if (opened) return;
    setOpened(true);
    onOpen?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-700">
      {/* 3D Envelope Container */}
      <div
        className="relative w-full max-w-md mx-auto flex flex-col items-center"
        style={{ perspective: 1200 }}
      >
        {/* Glow behind envelope */}
        <div className="absolute -inset-4 bg-gradient-to-r from-amber-200/20 via-rose-200/30 to-amber-200/20 rounded-3xl blur-2xl -z-10" />

        {/* Envelope Body */}
        <div
          onClick={handleOpenClick}
          className={`relative w-full aspect-[4/3] rounded-2xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-700 transform ${
            opened ? "translate-y-24 scale-95 opacity-0 pointer-events-none" : "hover:scale-[1.02]"
          }`}
          style={{
            backgroundColor: envelopeColor,
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.2)",
          }}
        >
          {/* Inner Liner Pattern */}
          <div
            className="absolute inset-2 rounded-xl opacity-20 border border-amber-900/10 pointer-events-none"
            style={{
              backgroundImage:
                linerPattern === "gold"
                  ? "radial-gradient(#d97706 1px, transparent 1px)"
                  : linerPattern === "crimson"
                  ? "radial-gradient(#991b1b 1px, transparent 1px)"
                  : "radial-gradient(#78350f 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          />

          {/* Envelope Bottom Pocket Triangle */}
          <div
            className="absolute inset-x-0 bottom-0 h-[65%] pointer-events-none"
            style={{
              background: `linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.05) 100%), ${envelopeColor}`,
              clipPath: "polygon(0 100%, 100% 100%, 100% 30%, 50% 0%, 0 30%)",
              filter: "drop-shadow(0 -4px 6px rgba(0,0,0,0.08))",
              borderTop: "1px solid rgba(0,0,0,0.05)",
            }}
          />

          {/* Couple Name and Guest Info On Envelope */}
          <div className="absolute inset-x-0 bottom-6 flex flex-col items-center justify-center text-center px-6 z-10">
            {guestName && (
              <div className="mb-2 px-4 py-1 rounded-full bg-white/70 backdrop-blur-sm border border-amber-900/10 shadow-sm">
                <p className="text-[11px] uppercase tracking-widest text-stone-600 font-semibold">
                  Kính gửi: <span className="text-amber-900 font-bold">{guestName}</span>
                </p>
              </div>
            )}
            <p
              className="text-stone-700 text-sm tracking-widest font-serif uppercase mb-0.5"
              style={{ letterSpacing: "3px" }}
            >
              Thiệp Mời Thành Hôn
            </p>
            <p
              className="text-xl md:text-2xl font-bold font-serif text-amber-950"
              style={{
                fontFamily: "'Great Vibes', 'Dancing Script', 'Playfair Display', serif",
              }}
            >
              {groomName} & {brideName}
            </p>
          </div>

          {/* 3D Top Flap with Wax Seal */}
          <div
            className="absolute inset-x-0 top-0 h-[55%] origin-top transition-transform duration-700 z-20"
            style={{
              background: `linear-gradient(0deg, rgba(0,0,0,0.06) 0%, transparent 100%), ${envelopeColor}`,
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              transform: opened ? "rotateX(180deg)" : "rotateX(0deg)",
              filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.15))",
            }}
          >
            {/* Top flap border accent */}
            <div className="absolute inset-0 border-b border-white/40" />
          </div>

          {/* Wax Seal Centered over Flap Tip */}
          <div
            className={`absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-500 ${
              opened ? "scale-150 opacity-0" : "hover:scale-110 active:scale-95"
            }`}
          >
            <WaxSeal
              monogram={computedMonogram}
              icon={waxIcon}
              color={waxColor}
              size={76}
              interactive
              pulse={!opened}
              onClick={(e) => {
                e.stopPropagation();
                handleOpenClick();
              }}
            />
          </div>
        </div>

        {/* Action Prompt */}
        {!opened && (
          <div className="mt-6 flex flex-col items-center gap-2 animate-bounce">
            <button
              onClick={handleOpenClick}
              className="px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-amber-900/30 hover:shadow-xl transition-all flex items-center gap-2 border border-amber-300/40"
            >
              <span>💌</span>
              <span>Chạm để mở thiệp</span>
            </button>
            <p className="text-xs text-amber-100/80 tracking-wide">
              (Âm nhạc sẽ tự động vang lên khi mở)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

