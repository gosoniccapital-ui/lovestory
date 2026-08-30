"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CanvasInvitation } from "./CanvasInvitation";
import { WaxSeal } from "@/components/WaxSeal";

interface InvitationData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  weddingTime: string;
  venueName: string;
  venueAddress: string;
  googleMapsUrl: string;
  groomParentNames: string;
  brideParentNames: string;
  story: string;
  message: string;
  bankName: string;
  bankAccount: string;
  bankOwner: string;
  groomPhone?: string;
  photos: string[];
  musicUrl?: string;
  musicName?: string;
  youtubeUrl?: string;
}

// ── Template Themes ──
interface Theme {
  bg: string;
  accent: string;
  accentLight: string;
  heading: string;
  text: string;
  card: string;
  label: string;
  envelopeBg: string;
  buttonGrad: string;
}

const THEMES: Record<string, Theme> = {
  "rose-garden": {
    bg: "linear-gradient(180deg, #fce7f3 0%, #fdf2f8 20%, #fff5f7 50%, #fefce8 100%)",
    accent: "#be185d",
    accentLight: "#fce7f3",
    heading: "#831843",
    text: "#374151",
    card: "rgba(255,255,255,0.5)",
    label: "#d97706",
    envelopeBg: "linear-gradient(180deg, #fce7f3, #fdf2f8)",
    buttonGrad: "linear-gradient(135deg, #ff6b9d, #c084fc)",
  },
  "midnight-romance": {
    bg: "linear-gradient(180deg, #0f172a 0%, #1e1b4b 30%, #312e81 60%, #1e1b4b 100%)",
    accent: "#a78bfa",
    accentLight: "rgba(167,139,250,0.15)",
    heading: "#e0e7ff",
    text: "#c7d2fe",
    card: "rgba(255,255,255,0.06)",
    label: "#a78bfa",
    envelopeBg: "linear-gradient(180deg, #1e1b4b, #312e81)",
    buttonGrad: "linear-gradient(135deg, #6366f1, #a78bfa)",
  },
  "golden-hour": {
    bg: "linear-gradient(180deg, #fffbeb 0%, #fef3c7 20%, #fde68a 50%, #fffbeb 100%)",
    accent: "#b45309",
    accentLight: "#fef3c7",
    heading: "#78350f",
    text: "#44403c",
    card: "rgba(255,255,255,0.6)",
    label: "#b45309",
    envelopeBg: "linear-gradient(180deg, #fef3c7, #fffbeb)",
    buttonGrad: "linear-gradient(135deg, #f59e0b, #d97706)",
  },
  "cherry-blossom": {
    bg: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 20%, #fecdd3 50%, #fff1f2 100%)",
    accent: "#e11d48",
    accentLight: "#ffe4e6",
    heading: "#9f1239",
    text: "#374151",
    card: "rgba(255,255,255,0.5)",
    label: "#e11d48",
    envelopeBg: "linear-gradient(180deg, #ffe4e6, #fff1f2)",
    buttonGrad: "linear-gradient(135deg, #fb7185, #ec4899)",
  },
  "beach-sunset": {
    bg: "linear-gradient(180deg, #ecfeff 0%, #cffafe 20%, #a5f3fc 40%, #fef3c7 100%)",
    accent: "#0e7490",
    accentLight: "#cffafe",
    heading: "#155e75",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#0e7490",
    envelopeBg: "linear-gradient(180deg, #cffafe, #ecfeff)",
    buttonGrad: "linear-gradient(135deg, #06b6d4, #0ea5e9)",
  },
  "classic-elegance": {
    bg: "linear-gradient(180deg, #fafaf9 0%, #f5f5f4 30%, #e7e5e4 60%, #fafaf9 100%)",
    accent: "#78716c",
    accentLight: "#f5f5f4",
    heading: "#292524",
    text: "#44403c",
    card: "rgba(255,255,255,0.7)",
    label: "#78716c",
    envelopeBg: "linear-gradient(180deg, #f5f5f4, #fafaf9)",
    buttonGrad: "linear-gradient(135deg, #78716c, #a8a29e)",
  },
  "ocean-breeze": {
    bg: "linear-gradient(180deg, #ecfeff 0%, #cffafe 30%, #a5f3fc 100%)",
    accent: "#0891b2",
    accentLight: "#cffafe",
    heading: "#164e63",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#0891b2",
    envelopeBg: "linear-gradient(180deg, #cffafe, #ecfeff)",
    buttonGrad: "linear-gradient(135deg, #06b6d4, #0891b2)",
  },
  "rustic-charm": {
    bg: "linear-gradient(180deg, #fefce8 0%, #fef9c3 30%, #fef3c7 100%)",
    accent: "#a16207",
    accentLight: "#fef9c3",
    heading: "#854d0e",
    text: "#44403c",
    card: "rgba(255,255,255,0.6)",
    label: "#a16207",
    envelopeBg: "linear-gradient(180deg, #fef9c3, #fefce8)",
    buttonGrad: "linear-gradient(135deg, #d97706, #a16207)",
  },
  "lavender-dream": {
    bg: "linear-gradient(180deg, #f5f3ff 0%, #ede9fe 30%, #ddd6fe 100%)",
    accent: "#7c3aed",
    accentLight: "#ede9fe",
    heading: "#4c1d95",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#7c3aed",
    envelopeBg: "linear-gradient(180deg, #ede9fe, #f5f3ff)",
    buttonGrad: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
  },
  "emerald-forest": {
    bg: "linear-gradient(180deg, #ecfdf5 0%, #d1fae5 30%, #a7f3d0 100%)",
    accent: "#059669",
    accentLight: "#d1fae5",
    heading: "#064e3b",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#059669",
    envelopeBg: "linear-gradient(180deg, #d1fae5, #ecfdf5)",
    buttonGrad: "linear-gradient(135deg, #10b981, #059669)",
  },
  "sunset-glow": {
    bg: "linear-gradient(180deg, #fff7ed 0%, #ffedd5 30%, #fed7aa 100%)",
    accent: "#ea580c",
    accentLight: "#ffedd5",
    heading: "#7c2d12",
    text: "#44403c",
    card: "rgba(255,255,255,0.6)",
    label: "#ea580c",
    envelopeBg: "linear-gradient(180deg, #ffedd5, #fff7ed)",
    buttonGrad: "linear-gradient(135deg, #f97316, #ea580c)",
  },
  "minimalist-white": {
    bg: "linear-gradient(180deg, #fafafa 0%, #f5f5f5 50%, #ffffff 100%)",
    accent: "#525252",
    accentLight: "#f5f5f5",
    heading: "#262626",
    text: "#404040",
    card: "rgba(255,255,255,0.8)",
    label: "#525252",
    envelopeBg: "linear-gradient(180deg, #f5f5f5, #fafafa)",
    buttonGrad: "linear-gradient(135deg, #525252, #737373)",
  },
  "royal-navy": {
    bg: "linear-gradient(180deg, #0c1929 0%, #1e293b 30%, #0f172a 100%)",
    accent: "#fbbf24",
    accentLight: "rgba(251,191,36,0.15)",
    heading: "#f8fafc",
    text: "#e2e8f0",
    card: "rgba(255,255,255,0.06)",
    label: "#fbbf24",
    envelopeBg: "linear-gradient(180deg, #1e293b, #0f172a)",
    buttonGrad: "linear-gradient(135deg, #f59e0b, #fbbf24)",
  },
  "spring-garden": {
    bg: "linear-gradient(180deg, #f0fdf4 0%, #dcfce7 30%, #bbf7d0 100%)",
    accent: "#16a34a",
    accentLight: "#dcfce7",
    heading: "#14532d",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#16a34a",
    envelopeBg: "linear-gradient(180deg, #dcfce7, #f0fdf4)",
    buttonGrad: "linear-gradient(135deg, #22c55e, #16a34a)",
  },
  "blush-romance": {
    bg: "linear-gradient(180deg, #fff1f2 0%, #ffe4e6 30%, #fecdd3 100%)",
    accent: "#e11d48",
    accentLight: "#ffe4e6",
    heading: "#881337",
    text: "#374151",
    card: "rgba(255,255,255,0.5)",
    label: "#e11d48",
    envelopeBg: "linear-gradient(180deg, #ffe4e6, #fff1f2)",
    buttonGrad: "linear-gradient(135deg, #f43f5e, #e11d48)",
  },
  "tropical-paradise": {
    bg: "linear-gradient(180deg, #f0fdfa 0%, #ccfbf1 30%, #99f6e4 100%)",
    accent: "#0d9488",
    accentLight: "#ccfbf1",
    heading: "#134e4a",
    text: "#374151",
    card: "rgba(255,255,255,0.55)",
    label: "#0d9488",
    envelopeBg: "linear-gradient(180deg, #ccfbf1, #f0fdfa)",
    buttonGrad: "linear-gradient(135deg, #14b8a6, #0d9488)",
  },
};
const DEFAULT_THEME = THEMES["rose-garden"];

// ── Layout Variants ──
type LayoutVariant = "classic" | "cinematic" | "minimal";

const LAYOUT_MAP: Record<string, LayoutVariant> = {
  "midnight-romance": "cinematic",
  "royal-navy": "cinematic",
  "minimalist-white": "minimal",
  "classic-elegance": "minimal",
};

function getLayout(slug: string): LayoutVariant {
  return LAYOUT_MAP[slug] || "classic";
}

// ── Scroll Reveal Component ──
function ScrollReveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(30px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

// ── Confetti Canvas ──
function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const colors = [
      "#ff6b9d",
      "#c084fc",
      "#f9a8d4",
      "#fbbf24",
      "#34d399",
      "#60a5fa",
      "#fb7185",
    ];
    const particles: {
      x: number;
      y: number;
      w: number;
      h: number;
      color: string;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
    }[] = [];
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * -canvas.height,
        w: 4 + Math.random() * 6,
        h: 8 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.2,
      });
    }
    let frame = 0;
    const maxFrames = 180; // ~3 seconds at 60fps
    function animate() {
      if (frame >= maxFrames) {
        ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
        return;
      }
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        p.vy += 0.05; // gravity
        ctx!.save();
        ctx!.translate(p.x, p.y);
        ctx!.rotate(p.rot);
        ctx!.fillStyle = p.color;
        ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx!.restore();
      });
      frame++;
      requestAnimationFrame(animate);
    }
    animate();
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 100,
      }}
    />
  );
}

// ── Envelope Animation Component — Cinematic Premium ──
function EnvelopeAnimation({
  groomName,
  brideName,
  guestName,
  onOpen,
}: {
  groomName: string;
  brideName: string;
  guestName?: string;
  onOpen: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [isOpening, setIsOpening] = useState(false);

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOpening) return;
    setIsOpening(true);
    // Phase 1: Flip lid (600ms) + Phase 2: Fade out & Slide up (400ms) -> total 1000ms before unmount
    setTimeout(() => {
      onOpen();
    }, 900);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background:
          "linear-gradient(160deg, #1a0533 0%, #2d0a5f 30%, #0f172a 70%, #1e0a3c 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: isOpening ? "default" : "pointer",
        overflow: "hidden",
        animation: "fadeIn 0.6s ease-in",
        opacity: isOpening ? 0 : 1,
        transition: "opacity 0.8s ease 0.1s",
      }}
      onClick={handleOpenClick}
    >
      {/* Ambient sparkles */}
      {[...Array(16)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: 2 + (i % 3) * 2,
            height: 2 + (i % 3) * 2,
            borderRadius: "50%",
            background:
              i % 3 === 0 ? "#ff6b9d" : i % 3 === 1 ? "#c084fc" : "#fbbf24",
            top: `${5 + ((i * 6.5) % 90)}%`,
            left: `${(i * 7.3) % 100}%`,
            opacity: isOpening ? 0 : 0.3 + (i % 4) * 0.1,
            transition: "opacity 0.3s ease",
            animation: isOpening ? "none" : `sparkle ${2 + (i % 3)}s ${(i * 0.3) % 2}s ease-in-out infinite`,
          }}
        />
      ))}

      {/* Glowing ring behind envelope */}
      <div
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(192,132,252,0.12) 0%, transparent 70%)",
          animation: isOpening ? "none" : "ringPulse 3s ease-in-out infinite",
          opacity: isOpening ? 0 : 1,
          transition: "opacity 0.4s ease",
        }}
      />

      {/* Main Envelope */}
      <div
        onMouseEnter={() => !isOpening && setHovered(true)}
        onMouseLeave={() => !isOpening && setHovered(false)}
        style={{
          width: 300,
          height: 210,
          position: "relative",
          transform: isOpening
            ? "scale(1.06) translateY(-420px)"
            : hovered
            ? "scale(1.04) translateY(-6px)"
            : "scale(1) translateY(0)",
          opacity: isOpening ? 0 : 1,
          transition: isOpening
            ? "transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s ease"
            : "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)",
          filter: "drop-shadow(0 24px 48px rgba(192,132,252,0.4))",
          animation: isOpening ? "none" : "floatEnv 3s ease-in-out infinite",
        }}
      >
        {/* Envelope body */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(160deg, #fdf2f8 0%, #fce7f3 50%, #fff5f7 100%)",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        />

        {/* Bottom fold lines */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: -1,
            right: -1,
            height: 110,
            background:
              "linear-gradient(180deg, transparent 0%, rgba(255,107,157,0.04) 100%)",
            clipPath: "polygon(0 100%, 50% 0%, 100% 100%)",
            borderRadius: "0 0 18px 18px",
            borderLeft: "1px solid rgba(255,107,157,0.1)",
            borderRight: "1px solid rgba(255,107,157,0.1)",
          }}
        />

        {/* Left & Right fold lines */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, rgba(255,107,157,0.06) 0%, transparent 50%),
                                 linear-gradient(225deg, rgba(192,132,252,0.06) 0%, transparent 50%)`,
            borderRadius: 18,
          }}
        />

        {/* Top flap — animated open on hover / open action */}
        <div
          style={{
            position: "absolute",
            top: -1,
            left: -1,
            right: -1,
            height: 110,
            background: "linear-gradient(175deg, #fce7f3 0%, #fff5f7 100%)",
            clipPath: "polygon(0 0, 50% 65%, 100% 0)",
            borderRadius: "18px 18px 0 0",
            transformOrigin: "top center",
            transform: isOpening
              ? "rotateX(-180deg)"
              : hovered
              ? "rotateX(-45deg)"
              : "rotateX(0deg)",
            transition: isOpening
              ? "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)"
              : "transform 0.5s ease",
            border: "1px solid rgba(255,107,157,0.12)",
            boxShadow: hovered ? "0 8px 24px rgba(0,0,0,0.08)" : "none",
            zIndex: 2,
          }}
        />

        {/* Seal / center content */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            opacity: isOpening ? 0 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          {/* 3D Embossed Wax Seal */}
          <div
            style={{
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          >
            <WaxSeal
              monogram={`${(groomName || "K").trim().charAt(0)} & ${(brideName || "T").trim().charAt(0)}`}
              color="crimson"
              size={64}
              interactive
              pulse={!hovered && !isOpening}
            />
          </div>
          <p
            style={{
              fontSize: 12,
              fontStyle: "italic",
              color: "#be185d",
              margin: 0,
              fontFamily: "'Georgia', serif",
              letterSpacing: 1,
              textAlign: "center",
              lineHeight: 1.4,
              padding: "0 16px",
            }}
          >
            {groomName} &amp; {brideName}
          </p>
        </div>
      </div>

      {/* Title text under envelope */}
      <div style={{ textAlign: "center", marginTop: 36, zIndex: 1 }}>
        <p
          style={{
            fontSize: 10,
            letterSpacing: 6,
            color: "rgba(255,255,255,0.4)",
            margin: "0 0 12px",
            textTransform: "uppercase",
          }}
        >
          Thiệp mời điện tử
        </p>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 300,
            color: "#fff",
            fontStyle: "italic",
            margin: "0 0 6px",
            fontFamily: "'Georgia', serif",
            textShadow: "0 2px 20px rgba(192,132,252,0.4)",
          }}
        >
          {groomName} &amp; {brideName}
        </h2>

        {/* Guest greeting */}
        {guestName && (
          <div
            style={{
              display: "inline-block",
              marginTop: 10,
              padding: "7px 18px",
              borderRadius: 24,
              background: "rgba(255,107,157,0.15)",
              border: "1px solid rgba(255,107,157,0.3)",
              backdropFilter: "blur(10px)",
            }}
          >
            <p style={{ fontSize: 13, color: "#fda4af", margin: 0 }}>
              💌 Kính gởi:{" "}
              <strong style={{ color: "#fff" }}>
                {decodeURIComponent(guestName)}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* CTA button */}
      <button
        style={{
          marginTop: 40,
          padding: "14px 36px",
          borderRadius: 50,
          border: "none",
          background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
          color: "#fff",
          fontSize: 15,
          fontWeight: 700,
          cursor: "pointer",
          zIndex: 1,
          boxShadow: "0 8px 30px rgba(255,107,157,0.45)",
          animation: "blink 1.8s ease-in-out infinite",
          letterSpacing: 0.5,
        }}
        onClick={onOpen}
      >
        Mở thiệp ✨
      </button>

      <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes sparkle { 0%,100% { opacity:0.2; transform:scale(1) } 50% { opacity:0.8; transform:scale(1.6) } }
                @keyframes ringPulse { 0%,100% { transform:scale(1); opacity:0.8 } 50% { transform:scale(1.15); opacity:0.4 } }
                @keyframes floatEnv { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
                @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.7 } }
                @keyframes pulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.03) } }
            `}</style>
    </div>
  );
}

// ── Countdown Widget ──
function CountdownWidget({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(targetDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);

      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 24px",
        background: "rgba(255,255,255,0.5)",
        borderRadius: 20,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "#d97706",
          letterSpacing: 3,
          margin: "0 0 16px",
        }}
      >
        ⏳ ĐẾM NGƯỢC
      </p>
      <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
        {[
          { value: timeLeft.days, label: "Ngày" },
          { value: timeLeft.hours, label: "Giờ" },
          { value: timeLeft.minutes, label: "Phút" },
          { value: timeLeft.seconds, label: "Giây" },
        ].map((item, i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: 14,
                background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                boxShadow: "0 4px 12px rgba(255,107,157,0.3)",
              }}
            >
              {item.value}
            </div>
            <p style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Calendar Widget ──
function CalendarWidget({ date }: { date: string }) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.toLocaleDateString("vi-VN", { month: "long" });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString("vi-VN", { weekday: "long" });

  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px",
        background: "#fff",
        borderRadius: 20,
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
          margin: "-24px -24px 16px",
          padding: "12px",
          color: "#fff",
          fontSize: 14,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        📅 {month} {year}
      </div>
      <p
        style={{
          fontSize: 48,
          fontWeight: 700,
          color: "#1f2937",
          margin: "0 0 4px",
        }}
      >
        {day}
      </p>
      <p
        style={{
          fontSize: 14,
          color: "#6b7280",
          margin: 0,
          textTransform: "capitalize",
        }}
      >
        {weekday}
      </p>
    </div>
  );
}

// ── Map Widget ──
function MapWidget({
  venueName,
  venueAddress,
  mapsUrl,
}: {
  venueName: string;
  venueAddress: string;
  mapsUrl: string;
}) {
  const googleMapsUrl = mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venueName + " " + venueAddress)}`;
  const appleMapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(venueName + " " + venueAddress)}`;

  return (
    <div
      style={{
        padding: "24px 20px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#d97706",
          letterSpacing: 3,
          margin: "0 0 12px",
          textTransform: "uppercase",
        }}
      >
        📍 ĐỊA ĐIỂM TIỆC CƯỚI
      </p>
      <h4
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#1f2937",
          margin: "0 0 6px",
          fontFamily: "'Playfair Display', serif",
        }}
      >
        {venueName}
      </h4>
      <p style={{ fontSize: 13, color: "#4b5563", lineHeight: 1.5, margin: "0 0 20px" }}>
        {venueAddress}
      </p>
      
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
        {googleMapsUrl && (
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              borderRadius: 30,
              background: "#4285F4",
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 4px 14px rgba(66,133,244,0.35)",
              transition: "transform 0.2s",
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
          >
            🗺️ Google Maps
          </a>
        )}
        <a
          href={appleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 30,
            background: "#000000",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            textDecoration: "none",
            boxShadow: "0 4px 14px rgba(0,0,0,0.25)",
            transition: "transform 0.2s",
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
        >
          🍎 Apple Maps
        </a>
      </div>
    </div>
  );
}

// ── RSVP Widget ──
function RsvpWidget({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"confirmed" | "declined" | "maybe">(
    "confirmed",
  );
  const [guestCount, setGuestCount] = useState(1);
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: 32,
          background: "rgba(255,255,255,0.5)",
          borderRadius: 20,
        }}
      >
        <p style={{ fontSize: 48, marginBottom: 8 }}>✅</p>
        <p style={{ fontSize: 16, fontWeight: 600, color: "#059669" }}>
          Cảm ơn bạn đã xác nhận!
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24,
        background: "rgba(255,255,255,0.5)",
        borderRadius: 20,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "#d97706",
          letterSpacing: 3,
          margin: "0 0 16px",
        }}
      >
        ✅ XÁC NHẬN THAM DỰ
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          {(["confirmed", "maybe", "declined"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: 8,
                border:
                  status === s ? "2px solid #c084fc" : "1px solid #e5e7eb",
                background: status === s ? "#f5f3ff" : "#fff",
                color: status === s ? "#7c3aed" : "#6b7280",
                fontSize: 12,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {s === "confirmed"
                ? "✅ Tham dự"
                : s === "maybe"
                  ? "🤔 Có thể"
                  : "❌ Không"}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Số khách:</span>
          <input
            type="number"
            min={1}
            max={20}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
            style={{
              width: 60,
              padding: "6px 10px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              textAlign: "center",
            }}
          />
        </div>
        <button
          onClick={async () => {
            if (!name) return;
            // Demo mode — just show success UI
            if (projectId === "demo") {
              setSubmitted(true);
              return;
            }
            try {
              const res = await fetch("/api/rsvp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  projectId,
                  guestName: name,
                  status,
                  guestCount,
                }),
              });
              if (!res.ok) {
                alert("Gửi xác nhận thất bại. Vui lòng thử lại.");
                return;
              }
            } catch {
              alert("Lỗi kết nối. Vui lòng thử lại.");
              return;
            }
            setSubmitted(true);
          }}
          style={{
            padding: "12px 20px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Gửi xác nhận
        </button>
      </div>
    </div>
  );
}

// ── Wish Wall Widget ──
function WishWallWidget({ projectId }: { projectId: string }) {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [wishes, setWishes] = useState<
    { name: string; message: string; emoji: string }[]
  >([]);
  const emojis = ["❤️", "🎉", "🥂", "💐", "💕", "🌹"];
  const [selectedEmoji, setSelectedEmoji] = useState("❤️");

  useEffect(() => {
    fetch(`/api/wishes?projectId=${projectId}`)
      .then((r) => r.json())
      .then((d) =>
        setWishes(
          (d.data || []).map(
            (w: { guest_name: string; message: string; emoji?: string }) => ({
              name: w.guest_name,
              message: w.message,
              emoji: w.emoji || "❤️",
            }),
          ),
        ),
      )
      .catch(() => {});
  }, [projectId]);

  async function handleSubmit() {
    if (!name || !message) return;
    // Demo mode — just show locally
    if (projectId === "demo") {
      setWishes((prev) => [{ name, message, emoji: selectedEmoji }, ...prev]);
      setName("");
      setMessage("");
      return;
    }
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          guestName: name,
          message,
          emoji: selectedEmoji,
        }),
      });
      if (!res.ok) {
        alert("Gửi lời chúc thất bại. Vui lòng thử lại.");
        return;
      }
    } catch {
      alert("Lỗi kết nối. Vui lòng thử lại.");
      return;
    }
    setWishes((prev) => [{ name, message, emoji: selectedEmoji }, ...prev]);
    setName("");
    setMessage("");
  }

  return (
    <div
      style={{
        padding: 24,
        background: "rgba(255,255,255,0.5)",
        borderRadius: 20,
      }}
    >
      <p
        style={{
          fontSize: 12,
          color: "#d97706",
          letterSpacing: 3,
          margin: "0 0 16px",
        }}
      >
        💬 LỜI CHÚC
      </p>

      {/* Submit */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <input
          placeholder="Tên của bạn"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            outline: "none",
          }}
        />
        <textarea
          placeholder="Gửi lời chúc..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            fontSize: 14,
            resize: "none",
            outline: "none",
            fontFamily: "inherit",
          }}
        />
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {emojis.map((e) => (
            <button
              key={e}
              onClick={() => setSelectedEmoji(e)}
              style={{
                fontSize: 20,
                border:
                  selectedEmoji === e
                    ? "2px solid #c084fc"
                    : "1px solid transparent",
                borderRadius: 8,
                padding: 4,
                background: "transparent",
                cursor: "pointer",
              }}
            >
              {e}
            </button>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          💌 Gửi lời chúc
        </button>
      </div>

      {/* Wishes */}
      {wishes.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {wishes.map((w, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: 14,
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                animation: "slideUp 0.3s ease-out",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 16 }}>{w.emoji}</span>
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: "#1f2937" }}
                >
                  {w.name}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "#4b5563",
                  margin: 0,
                  lineHeight: 1.5,
                }}
              >
                {w.message}
              </p>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ── Gift QR Widget ──
// ── Gift QR Widget ──
function GiftQrWidget({
  bankName,
  bankAccount,
  bankOwner,
}: {
  bankName: string;
  bankAccount: string;
  bankOwner: string;
}) {
  const [amount, setAmount] = useState<number | "">("");
  const [guestName, setGuestName] = useState("");
  const [copied, setCopied] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    const guest = searchParams.get("guest") || "";
    if (guest) {
      setGuestName(decodeURIComponent(guest));
    }
  }, [searchParams]);

  if (!bankAccount) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(bankAccount);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addInfo = guestName ? `Mung cuoi ${guestName}` : `Mung cuoi ${bankOwner}`;
  const qrUrl = `https://img.vietqr.io/image/${encodeURIComponent(bankName)}-${encodeURIComponent(bankAccount)}-compact.png?amount=${amount || 0}&addInfo=${encodeURIComponent(addInfo)}`;

  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 16px",
        background: "rgba(255,255,255,0.75)",
        backdropFilter: "blur(12px)",
        borderRadius: 20,
        boxShadow: "0 8px 32px rgba(0,0,0,0.05)",
        border: "1px solid rgba(255,255,255,0.3)",
      }}
    >
      <p
        style={{
          fontSize: 12,
          fontWeight: 700,
          color: "#d97706",
          letterSpacing: 3,
          margin: "0 0 16px",
          textTransform: "uppercase",
        }}
      >
        🎁 MỪNG CƯỚI ĐỒNG HÀNH
      </p>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={qrUrl}
        alt="QR chuyển khoản"
        width={160}
        height={160}
        style={{
          borderRadius: 16,
          margin: "0 auto 16px",
          display: "block",
          background: "#fff",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            `https://quickchart.io/qr?text=${encodeURIComponent(`${bankName} - ${bankAccount} - ${bankOwner}`)}&size=160`;
        }}
      />

      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 13, color: "#4b5563", margin: "0 0 4px" }}>
          Ngân hàng: <strong>{bankName}</strong>
        </p>
        <p style={{ fontSize: 13, color: "#4b5563", margin: "0 0 4px" }}>
          Chủ TK: <strong>{bankOwner}</strong>
        </p>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#1f2937" }}>
            {bankAccount}
          </span>
          <button
            onClick={handleCopy}
            style={{
              padding: "4px 8px",
              fontSize: 11,
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: copied ? "#d1fae5" : "#f3f4f6",
              color: copied ? "#065f46" : "#374151",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {copied ? "Đã copy!" : "Sao chép"}
          </button>
        </div>
      </div>

      {/* Dynamic input fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 320, margin: "0 auto" }}>
        <div>
          <input
            type="text"
            placeholder="Tên của bạn..."
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 13,
              textAlign: "center",
              background: "rgba(255,255,255,0.8)",
            }}
          />
        </div>
        <div>
          <input
            type="number"
            placeholder="Nhập số tiền mừng cưới (đ)..."
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "8px 12px",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              fontSize: 13,
              textAlign: "center",
              background: "rgba(255,255,255,0.8)",
            }}
          />
        </div>
        <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
          {[200000, 500000, 1000000].map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 20,
                border: amount === val ? "1px solid #be185d" : "1px solid #d1d5db",
                background: amount === val ? "#fce7f3" : "#fff",
                color: amount === val ? "#be185d" : "#374151",
                fontWeight: amount === val ? 600 : 400,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {val.toLocaleString("vi-VN")}đ
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Photo Slideshow Component ──
function PhotoSlideshow({
  photos,
  accent,
}: {
  photos: string[];
  accent: string;
}) {
  const [slide, setSlide] = useState(0);
  useEffect(() => {
    if (photos.length <= 1) return;
    const t = setInterval(() => setSlide((s) => (s + 1) % photos.length), 3500);
    return () => clearInterval(t);
  }, [photos.length]);
  if (photos.length === 0) return null;
  return (
    <section style={{ padding: "0 24px 24px" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.5)",
          borderRadius: 20,
          padding: 20,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: accent,
            letterSpacing: 3,
            margin: "0 0 16px",
            textAlign: "center",
          }}
        >
          📸 KHOẢNH KHẮC
        </p>
        <div
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            aspectRatio: "4/3",
            background: "#f3f4f6",
          }}
        >
          {photos.map((url, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                opacity: i === slide ? 1 : 0,
                transition: "opacity 0.8s ease",
                zIndex: i === slide ? 1 : 0,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Ảnh cưới ${i + 1}`}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                loading="lazy"
              />
            </div>
          ))}
          {photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setSlide((s) => (s - 1 + photos.length) % photos.length)
                }
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ‹
              </button>
              <button
                onClick={() => setSlide((s) => (s + 1) % photos.length)}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  zIndex: 10,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "none",
                  background: "rgba(0,0,0,0.35)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 18,
                }}
              >
                ›
              </button>
            </>
          )}
          <div
            style={{
              position: "absolute",
              bottom: 10,
              right: 12,
              zIndex: 10,
              background: "rgba(0,0,0,0.4)",
              borderRadius: 20,
              padding: "2px 8px",
              fontSize: 10,
              color: "#fff",
            }}
          >
            {slide + 1} / {photos.length}
          </div>
        </div>
        {photos.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 6,
              marginTop: 10,
            }}
          >
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                style={{
                  width: i === slide ? 16 : 6,
                  height: 6,
                  borderRadius: 4,
                  border: "none",
                  background: i === slide ? accent : "#d1d5db",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── YouTube Embed Component ──
function YouTubeEmbed({ url, accent }: { url: string; accent: string }) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  if (!m) return null;
  return (
    <section style={{ padding: "0 24px 24px" }}>
      <div
        style={{
          background: "rgba(255,255,255,0.5)",
          borderRadius: 20,
          padding: 20,
        }}
      >
        <p
          style={{
            fontSize: 12,
            color: accent,
            letterSpacing: 3,
            margin: "0 0 16px",
            textAlign: "center",
          }}
        >
          ▶️ VIDEO
        </p>
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            aspectRatio: "16/9",
            background: "#000",
          }}
        >
          <iframe
            src={`https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1`}
            title="Wedding Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: "100%", height: "100%", border: "none" }}
          />
        </div>
      </div>
    </section>
  );
}

// ── ParticleCanvas: floating petal / heart / bokeh / snowflake effects ──
function ParticleCanvas({ effect }: { effect: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!effect || effect === "none") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PETAL_COLORS = ["#f43f5e", "#fb7185", "#fda4af", "#fecdd3", "#e11d48"];
    const GOLD_COLORS = ["#fef08a", "#fde047", "#eab308", "#ca8a04", "#ffffff"];

    interface Particle {
      x: number;
      y: number;
      size: number;
      speed: number;
      speedX: number;
      opacity: number;
      rotation: number;
      rotSpeed: number;
      flip: number;
      flipSpeed: number;
      color: string;
      isGold: boolean;
    }

    const isMobile = canvas.width < 640;
    const count = isMobile ? 22 : 45;

    const particles: Particle[] = Array.from({ length: count }, () => {
      const isGold = effect === "goldDust" || (effect === "petals" && Math.random() < 0.2);
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: isGold ? Math.random() * 3 + 1.5 : Math.random() * 12 + 8,
        speed: (Math.random() * 1.2 + 0.8),
        speedX: (Math.random() * 1 - 0.5),
        opacity: Math.random() * 0.6 + 0.35,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 1.5,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.015,
        color: isGold
          ? GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]
          : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        isGold,
      };
    });

    let animId: number;
    let tick = 0;
    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick++;

      for (const p of particles) {
        p.flip += p.flipSpeed;
        const scaleX = Math.cos(p.flip);
        const wind = Math.sin(tick * 0.02 + p.y * 0.01) * 0.7;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(scaleX, 1);

        if (p.isGold) {
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowColor = "#fef08a";
          ctx.shadowBlur = 6;
          ctx.fill();
        } else if (effect === "hearts") {
          ctx.beginPath();
          const topH = p.size * 0.3;
          ctx.moveTo(0, topH);
          ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topH);
          ctx.bezierCurveTo(-p.size / 2, (p.size + topH) / 2, 0, (p.size + topH) / 2, 0, p.size);
          ctx.bezierCurveTo(0, (p.size + topH) / 2, p.size / 2, (p.size + topH) / 2, p.size / 2, topH);
          ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topH);
          ctx.fillStyle = p.color;
          ctx.fill();
        } else {
          // Organic curved rose/sakura petal
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-p.size / 2, -p.size / 2, -p.size / 2, p.size / 2, 0, p.size);
          ctx.bezierCurveTo(p.size / 2, p.size / 2, p.size / 2, -p.size / 2, 0, 0);
          ctx.fillStyle = p.color;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 3;
          ctx.fill();
        }
        ctx.restore();

        p.y += p.speed;
        p.x += p.speedX + wind;
        p.rotation += p.rotSpeed;
        if (p.y > canvas.height + 20 || p.x < -30 || p.x > canvas.width + 30) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }
      }
      animId = requestAnimationFrame(draw);
    }
    draw();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, [effect]);

  if (!effect || effect === "none") return null;
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 5,
      }}
    />
  );
}

// ── ShareButtons: Zalo + Facebook + Copy link ──
function ShareButtons({
  slug,
  groomName,
  brideName,
}: {
  slug: string;
  groomName: string;
  brideName: string;
}) {
  const [copied, setCopied] = useState(false);
  const url =
    typeof window !== "undefined"
      ? window.location.href
      : `https://7app.online/i/${slug}`;
  const text = `${groomName} & ${brideName} trân trọng kính mời bạn`;

  function shareZalo() {
    window.open(
      `https://zalo.me/share/link?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
    );
  }
  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      "_blank",
      "width=600,height=400",
    );
  }
  function copyLink() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: 84,
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        gap: 8,
        zIndex: 80,
        alignItems: "center",
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(16px)",
        borderRadius: 50,
        padding: "8px 16px",
        boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
        border: "1px solid rgba(255,255,255,0.6)",
      }}
    >
      <button
        onClick={shareZalo}
        title="Chia sẻ Zalo"
        style={{
          background: "linear-gradient(135deg, #0068ff, #0099ff)",
          border: "none",
          borderRadius: 50,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 16,
          color: "#fff",
          boxShadow: "0 2px 8px rgba(0,104,255,0.35)",
        }}
      >
        Z
      </button>
      <button
        onClick={shareFacebook}
        title="Chia sẻ Facebook"
        style={{
          background: "linear-gradient(135deg, #1877f2, #42a5f5)",
          border: "none",
          borderRadius: 50,
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 16,
          color: "#fff",
          boxShadow: "0 2px 8px rgba(24,119,242,0.35)",
        }}
      >
        f
      </button>
      <button
        onClick={copyLink}
        title="Sao chép link"
        style={{
          background: copied
            ? "linear-gradient(135deg, #10b981, #059669)"
            : "#f3f4f6",
          border: "none",
          borderRadius: 50,
          padding: "0 12px",
          height: 36,
          display: "flex",
          alignItems: "center",
          gap: 4,
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          color: copied ? "#fff" : "#374151",
          transition: "all 0.3s",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "✓ Đã sao chép!" : "🔗 Sao chép"}
      </button>
    </div>
  );
}

// ── HeartButton: Floating like button with animated count ──
function HeartButton({ slug }: { slug: string }) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // Load initial count
    fetch(`/api/likes?slug=${slug}`)
      .then((r) => r.json())
      .then((d) => setCount(d.likes || 0))
      .catch(() => {});
    // Check localStorage
    const key = `liked:${slug}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) {
      setLiked(true);
    }
  }, [slug]);

  async function handleLike() {
    if (liked) return;
    setAnimating(true);
    setLiked(true);
    const key = `liked:${slug}`;
    localStorage.setItem(key, "1");
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const d = await res.json();
      setCount(d.likes || count + 1);
    } catch {
      setCount((c) => c + 1);
    }
    setTimeout(() => setAnimating(false), 600);
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      style={{
        position: "fixed",
        bottom: 24,
        right: 20,
        zIndex: 90,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "10px 14px",
        borderRadius: 50,
        border: "none",
        background: liked
          ? "linear-gradient(135deg, #ff6b9d, #ff3366)"
          : "rgba(255,255,255,0.95)",
        color: liked ? "#fff" : "#ff6b9d",
        fontSize: 22,
        cursor: liked ? "default" : "pointer",
        boxShadow: liked
          ? "0 4px 20px rgba(255,107,157,0.4)"
          : "0 2px 12px rgba(0,0,0,0.12)",
        transform: animating ? "scale(1.3)" : "scale(1)",
        transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <span style={{ lineHeight: 1 }}>{liked ? "❤️" : "🤍"}</span>
      {count > 0 && (
        <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1 }}>
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Public Invitation ──
// Suspense wrapper required because this component uses useSearchParams()
// Without Suspense, Next.js App Router hydration causes React error #310
export function InvitationPageInner({
  params,
  initialProject,
  initialIsPremium,
}: {
  params: Promise<{ slug: string }>;
  initialProject?: any;
  initialIsPremium?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [loading, setLoading] = useState(!initialProject);
  const [pageSlug, setPageSlug] = useState(initialProject?.slug || "");
  const audioRef = useRef<HTMLAudioElement>(null);
  const [projectId, setProjectId] = useState(initialProject?.id || "");
  const [templateSlug, setTemplateSlug] = useState(initialProject?.template || "rose-garden");
  const searchParams = useSearchParams();
  const guestName = searchParams.get("guest") || "";
  const [particleEffect, setParticleEffect] = useState(initialProject?.particle_effect || "petals");
  const [fontFamily, setFontFamily] = useState("'Georgia', serif");
  const [canvasJson, setCanvasJson] = useState<string | null>(initialProject?.canvas_json || null);
  const [isPremium, setIsPremium] = useState(initialIsPremium || false);
  const [introEffect, setIntroEffect] = useState<string>("envelope");
  const [data, setData] = useState<InvitationData>({
    groomName: initialProject?.groom_name || "",
    brideName: initialProject?.bride_name || "",
    weddingDate: initialProject?.wedding_date || "",
    weddingTime: initialProject?.wedding_time || "",
    venueName: initialProject?.venue_name || "",
    venueAddress: initialProject?.venue_address || "",
    googleMapsUrl: initialProject?.google_maps_url || "",
    groomParentNames: initialProject?.groom_parent_names || "",
    brideParentNames: initialProject?.bride_parent_names || "",
    story: initialProject?.story || "",
    message: initialProject?.message || "",
    bankName: initialProject?.bank_name || "",
    bankAccount: initialProject?.bank_account || "",
    bankOwner: initialProject?.bank_owner || "",
    photos: (() => {
      try {
        return JSON.parse(initialProject?.photos || "[]");
      } catch {
        return [];
      }
    })(),
    musicUrl: initialProject?.music_url || "",
    musicName: initialProject?.music_name || "",
  });

  useEffect(() => {
    async function loadProject() {
      const { slug } = await params;
      setPageSlug(slug);

      if (initialProject) {
        if (initialProject.canvas_json) {
          try {
            const parsed = JSON.parse(initialProject.canvas_json);
            if (parsed?.effects?.introEffect) {
              setIntroEffect(parsed.effects.introEffect);
              if (parsed.effects.introEffect.startsWith("curtain")) {
                setTimeout(() => setIsOpen(true), 100);
              }
            }
          } catch {}
        } else {
          const FONT_MAP: Record<string, string> = {
            serif: "'Playfair Display', Georgia, serif",
            script: "'Dancing Script', cursive",
            sans: "'Inter', system-ui, sans-serif",
            traditional: "'Cormorant Garamond', Georgia, serif",
            bold: "'Lora', Georgia, serif",
          };
          setFontFamily(
            FONT_MAP[initialProject.font_family || "serif"] || FONT_MAP.serif,
          );
        }

        fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        }).catch(() => {});

        setLoading(false);
        return;
      }

      const { createBrowserClient } = await import("@supabase/ssr");

      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      );

      const { data: project } = await supabase
        .from("projects")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .maybeSingle();

      if (project) {
        setProjectId(project.id);

        // Sprint 47: Check owner's subscription plan for watermark
        if (project.user_id) {
          const { data: sub } = await supabase
            .from("subscriptions")
            .select("plan")
            .eq("user_id", project.user_id)
            .maybeSingle();
          if (sub?.plan === "basic" || sub?.plan === "premium") {
            setIsPremium(true);
          }
        }

        // Sprint 7: canvas_json early-return check
        if (project.canvas_json) {
          setCanvasJson(project.canvas_json);
          // Extract intro effect from canvas_json
          try {
            const parsed = JSON.parse(project.canvas_json);
            if (parsed?.effects?.introEffect) {
              setIntroEffect(parsed.effects.introEffect);
              // Curtain effects auto-open (no click needed)
              if (parsed.effects.introEffect.startsWith("curtain")) {
                setTimeout(() => setIsOpen(true), 100);
              }
            }
          } catch {
            /* ignore parse errors */
          }
          setLoading(false);
          return;
        }
        setTemplateSlug(project.template || "rose-garden");
        // Sprint 6: particle + font
        setParticleEffect(project.particle_effect || "petals");
        const FONT_MAP: Record<string, string> = {
          serif: "'Playfair Display', Georgia, serif",
          script: "'Dancing Script', cursive",
          sans: "'Inter', system-ui, sans-serif",
          traditional: "'Cormorant Garamond', Georgia, serif",
          bold: "'Lora', Georgia, serif",
        };
        setFontFamily(
          FONT_MAP[project.font_family || "serif"] || FONT_MAP.serif,
        );
        setData({
          groomName: project.groom_name || "Chú rể",
          brideName: project.bride_name || "Cô dâu",
          weddingDate: project.wedding_date || "",
          weddingTime: project.wedding_time || "",
          venueName: project.venue_name || "",
          venueAddress: project.venue_address || "",
          googleMapsUrl: project.google_maps_url || "",
          groomParentNames: project.groom_parent_names || "",
          brideParentNames: project.bride_parent_names || "",
          story: project.story || "",
          message: project.message || "",
          bankName: project.bank_name || "",
          bankAccount: project.bank_account || "",
          bankOwner: project.bank_owner || "",
          groomPhone: project.groom_phone || "",
          photos: (() => {
            try {
              return JSON.parse(project.photos || "[]");
            } catch {
              return [];
            }
          })(),
          musicUrl: project.music_url || "",
          musicName: project.music_name || "",
          youtubeUrl: project.youtube_url || "",
        });

        // Increment view count
        fetch("/api/views", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        }).catch(() => {});
      } else if (slug === "demo-wedding") {
        // Demo fallback for landing page "Xem demo" button
        setProjectId("demo");
        setTemplateSlug("rose-garden");
        setData({
          groomName: "Minh",
          brideName: "Mai",
          weddingDate: "2026-06-15",
          weddingTime: "10:00",
          venueName: "Trung tâm Tiệc cưới Diamond Palace",
          venueAddress: "123 Nguyễn Huệ, Quận 1, TP.HCM",
          googleMapsUrl: "https://maps.google.com/?q=diamond+palace+hcm",
          groomParentNames: "Ông Nguyễn Văn A & Bà Lê Thị B",
          brideParentNames: "Ông Trần Văn C & Bà Phạm Thị D",
          story:
            "Chúng tôi gặp nhau vào một ngày mùa thu Sài Gòn. Ánh nắng chiều xuyên qua tán lá cổ thụ trên con đường Nguyễn Du, và tình yêu bắt đầu từ đó.",
          message:
            "Sự hiện diện của bạn là niềm vinh hạnh lớn lao cho chúng tôi.",
          bankName: "Vietcombank",
          bankAccount: "1234567890",
          bankOwner: "NGUYEN VAN MINH",
          musicUrl:
            "https://cdn.freesound.org/previews/612/612095_5674468-lq.mp3",
          musicName: "Beautiful Wedding",
          groomPhone: "0901234567",
          photos: [
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=600",
            "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600",
            "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600",
            "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=600",
          ],
        });
      } else if (slug === "demo-elegant") {
        // Demo "Thiệp cưới 36" — 1:1 CineLove clone with Asian couple photos
        setProjectId("demo-elegant");
        setCanvasJson(
          JSON.stringify({
            canvasWidth: 420,
            canvasHeight: 9200,
            canvasBackground:
              "linear-gradient(180deg, #f5f0eb 0%, #ffffff 5%, #faf8f5 15%, #ffffff 35%, #faf7f4 55%, #ffffff 75%, #f5f0eb 100%)",
            effects: { introEffect: "envelope", particleEffect: "petals" },
            elements: [
              // ── Section 1: Quote top (with breathing room) ──
              {
                id: "s1-quote",
                type: "text",
                top: 40,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 1,
                locked: false,
                visible: true,
                opacity: 0.55,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 1000, delay: 300 },
                continuous: null,
                props: {
                  text: "I love three things in this world.\nSun, moon and you.\nSun for morning, moon for night,\nand you forever.",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 14,
                  fontWeight: "normal",
                  fontStyle: "italic",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.7,
                  letterSpacing: 0.5,
                },
              },

              // ── Section 2: Hero — 2 photos side-by-side (CineLove layout) ──
              {
                id: "s2-hero-left",
                type: "image",
                top: 160,
                left: 0,
                width: 207,
                height: 530,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 1000, delay: 200 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&h=700&fit=crop&crop=faces",
                  objectFit: "cover",
                  crop: null,
                },
              },
              {
                id: "s2-hero-right",
                type: "image",
                top: 160,
                left: 213,
                width: 207,
                height: 530,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 2,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 1000, delay: 400 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=700&fit=crop&crop=faces",
                  objectFit: "cover",
                  crop: null,
                },
              },

              // ── Section 3: Couple names (script font, large) ──
              {
                id: "s3-bride",
                type: "text",
                top: 740,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "slideUp", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  text: "Mai Anh",
                  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                  fontSize: 42,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#2c2417",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 1,
                },
              },
              {
                id: "s3-ampersand",
                type: "text",
                top: 800,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.5,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 400 },
                continuous: null,
                props: {
                  text: "&",
                  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                  fontSize: 36,
                  fontWeight: "normal",
                  fontStyle: "italic",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 0,
                },
              },
              {
                id: "s3-groom",
                type: "text",
                top: 850,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "slideUp", duration: 800, delay: 600 },
                continuous: null,
                props: {
                  text: "Minh Quân",
                  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                  fontSize: 42,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#2c2417",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 1,
                },
              },

              // ── Section 4: Poetry (handwriting font) ──
              {
                id: "s4-poem1",
                type: "text",
                top: 960,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.85,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  text: "Đời dài muôn mảnh bình yên\nEm mang lãng mạn dịu hiền bước qua.\nSáng ngời dáng ngọc ngọc ngà\nCùng anh sánh bước chan hòa trọn đời.",
                  fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                  fontSize: 18,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#5c4f3d",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.8,
                  letterSpacing: 0.3,
                },
              },

              // ── Section 5: Full-width photo 1 ──
              {
                id: "s5-photo1",
                type: "image",
                top: 1150,
                left: 0,
                width: 420,
                height: 320,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 8,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: {
                  offsetX: 0,
                  offsetY: 6,
                  blur: 24,
                  spread: 0,
                  color: "rgba(0,0,0,0.12)",
                },
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&fit=crop",
                  objectFit: "cover",
                  crop: null,
                },
              },

              // ── Section 6: Countdown widget ──
              {
                id: "s6-countdown",
                type: "widget",
                top: 1560,
                left: 35,
                width: 350,
                height: 120,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 300 },
                continuous: null,
                props: {
                  widgetType: "countdown",
                  config: {
                    targetDate: "2026-06-15T10:00:00",
                    style: "elegant",
                  },
                },
              },

              // ── Section 7: Invite message ──
              {
                id: "s7-invite",
                type: "text",
                top: 1780,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  text: "Mời bạn tới dự lễ thành hôn\ncủa chúng mình\nĐể cùng chứng kiến khoảnh khắc\nthiêng liêng nhất",
                  fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                  fontSize: 18,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#5c4f3d",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.7,
                  letterSpacing: 0.3,
                },
              },

              // ── Section 8: Date / Time box ──
              {
                id: "s8-date-box",
                type: "shape",
                top: 2010,
                left: 60,
                width: 300,
                height: 200,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 400 },
                continuous: null,
                props: {
                  shapeType: "rectangle",
                  fill: "rgba(250,248,245,0.9)",
                  stroke: "rgba(212,197,169,0.3)",
                  strokeWidth: 1,
                },
              },
              {
                id: "s8-day",
                type: "text",
                top: 2020,
                left: 60,
                width: 300,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 6,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "15",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 72,
                  fontWeight: "bold",
                  fontStyle: "normal",
                  color: "#2c2417",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1,
                  letterSpacing: 0,
                },
              },
              {
                id: "s8-weekday",
                type: "text",
                top: 2105,
                left: 60,
                width: 300,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 6,
                locked: false,
                visible: true,
                opacity: 0.6,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "Chủ Nhật",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 15,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 3,
                },
              },
              {
                id: "s8-time",
                type: "text",
                top: 2140,
                left: 60,
                width: 140,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 6,
                locked: false,
                visible: true,
                opacity: 0.7,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "10:00 AM",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 13,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 1,
                },
              },
              {
                id: "s8-month",
                type: "text",
                top: 2140,
                left: 160,
                width: 100,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 6,
                locked: false,
                visible: true,
                opacity: 0.7,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "Tháng 6",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 13,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 1,
                },
              },
              {
                id: "s8-year",
                type: "text",
                top: 2140,
                left: 260,
                width: 100,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 6,
                locked: false,
                visible: true,
                opacity: 0.7,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "2026",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 13,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 1,
                },
              },

              // ── Section 9: Venue ──
              {
                id: "s9-venue-label",
                type: "text",
                top: 2320,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.5,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 0 },
                continuous: null,
                props: {
                  text: "A D D R E S S",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 12,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 6,
                },
              },
              {
                id: "s9-venue-name",
                type: "text",
                top: 2350,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: null,
                continuous: null,
                props: {
                  text: "Trung tâm Tiệc cưới Cinelove",
                  fontFamily: "'Playfair Display', Georgia, serif",
                  fontSize: 20,
                  fontWeight: "600",
                  fontStyle: "normal",
                  color: "#2c2417",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.4,
                  letterSpacing: 0,
                },
              },

              // ── Section 10: Full-width photo 2 ──
              {
                id: "s10-photo2",
                type: "image",
                top: 2460,
                left: 0,
                width: 420,
                height: 560,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&fit=crop",
                  objectFit: "cover",
                  crop: null,
                },
              },

              // ── Section 11: English quote ──
              {
                id: "s11-en-quote",
                type: "text",
                top: 3120,
                left: 40,
                width: 340,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.5,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 0 },
                continuous: null,
                props: {
                  text: "LOVE AND FREEDOM\nYOU AND\nGENTLENESS",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 20,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.5,
                  letterSpacing: 4,
                },
              },

              // ── Section 12: Poetry 2 (handwriting) ──
              {
                id: "s12-poem2",
                type: "text",
                top: 3280,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.85,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 0 },
                continuous: null,
                props: {
                  text: "Đời này quý giá vô ngần\nCó anh chung bước, muôn phần đẹp tươi.",
                  fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                  fontSize: 18,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#5c4f3d",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.8,
                  letterSpacing: 0.3,
                },
              },

              // ── Section 13: Full-width photo 3 ──
              {
                id: "s13-photo3",
                type: "image",
                top: 3450,
                left: 0,
                width: 420,
                height: 560,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&fit=crop",
                  objectFit: "cover",
                  crop: null,
                },
              },

              // ── Section 14: Calendar widget ──
              {
                id: "s14-calendar",
                type: "widget",
                top: 4110,
                left: 35,
                width: 350,
                height: 320,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 200 },
                continuous: null,
                props: {
                  widgetType: "calendar",
                  config: { weddingDate: "2026-06-15" },
                },
              },

              // ── Section 15: Map widget ──
              {
                id: "s15-map",
                type: "widget",
                top: 4530,
                left: 35,
                width: 350,
                height: 300,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 0 },
                continuous: null,
                props: {
                  widgetType: "map",
                  config: {
                    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
                    venueName: "Trung tâm Tiệc cưới Cinelove",
                    googleMapsUrl:
                      "https://maps.google.com/?q=trung+tam+tiec+cuoi+cinelove",
                  },
                },
              },

              // ── Section 16: Detail message ──
              {
                id: "s16-detail",
                type: "text",
                top: 4930,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.85,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 0 },
                continuous: null,
                props: {
                  text: "Xin vui lòng xác nhận trước với chúng mình\nsố lượng người tham dự để tiện sắp xếp chỗ ngồi.\n\nNếu có việc bận đột xuất không thể đến được,\nmong bạn báo trước.\n\nHẹn gặp bạn tại đám cưới nhé~",
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 14,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#5c4f3d",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.7,
                  letterSpacing: 0.3,
                },
              },

              // ── Section 17: Full-width photo 4 ──
              {
                id: "s17-photo4",
                type: "image",
                top: 5200,
                left: 0,
                width: 420,
                height: 560,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 200 },
                continuous: null,
                props: {
                  src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&fit=crop",
                  objectFit: "cover",
                  crop: null,
                },
              },

              // ── Section 18: RSVP widget ──
              {
                id: "s18-rsvp",
                type: "widget",
                top: 5860,
                left: 35,
                width: 350,
                height: 300,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 0 },
                continuous: null,
                props: { widgetType: "rsvp", config: {} },
              },

              // ── Section 19: QR Box widget ──
              {
                id: "s19-qr",
                type: "widget",
                top: 6260,
                left: 35,
                width: 350,
                height: 350,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 1,
                borderRadius: 16,
                border: {
                  width: 1,
                  color: "rgba(212,197,169,0.3)",
                  style: "solid",
                },
                shadow: null,
                entrance: { type: "fadeIn", duration: 600, delay: 0 },
                continuous: null,
                props: {
                  widgetType: "qrbox",
                  config: {
                    bankBin: "970436",
                    accountNumber: "1234567890",
                    accountName: "TRAN MAI ANH",
                    bankName: "Vietcombank",
                  },
                },
              },

              // ── Section 20: Closing poem ──
              {
                id: "s20-closing",
                type: "text",
                top: 6720,
                left: 30,
                width: 360,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.85,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 800, delay: 0 },
                continuous: null,
                props: {
                  text: "Non sông một chặng đường dài\nBa sinh hữu hạnh, duyên này thành đôi.\nTiệc vui ngắn ngủi mà thôi\nNếu điều sơ suất, mong người lượng thương.",
                  fontFamily: "'Dancing Script', 'Great Vibes', cursive",
                  fontSize: 18,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#5c4f3d",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.8,
                  letterSpacing: 0.3,
                },
              },

              // ── Section 21: Couple illustration + Thank You ──
              {
                id: "s21-illustration",
                type: "image",
                top: 6980,
                left: 110,
                width: 200,
                height: 200,
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.9,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "zoomIn", duration: 800, delay: 200 },
                continuous: { type: "float", duration: 3000 },
                props: {
                  src: "https://storyset.com/illustration/wedding/cuate",
                  objectFit: "contain",
                  crop: null,
                },
              },
              {
                id: "s21-thankyou",
                type: "text",
                top: 7200,
                left: 20,
                width: 380,
                height: "auto",
                rotation: 0,
                scaleX: 1,
                scaleY: 1,
                zIndex: 5,
                locked: false,
                visible: true,
                opacity: 0.5,
                borderRadius: 0,
                border: { width: 0, color: "transparent", style: "solid" },
                shadow: null,
                entrance: { type: "fadeIn", duration: 1000, delay: 0 },
                continuous: null,
                props: {
                  text: "THANK YOU",
                  fontFamily: "'Great Vibes', 'Dancing Script', cursive",
                  fontSize: 36,
                  fontWeight: "normal",
                  fontStyle: "normal",
                  color: "#8b7e6a",
                  backgroundColor: "transparent",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: 3,
                },
              },
            ],
          }),
        );
        setLoading(false);
      }
      setLoading(false);
    }
    loadProject();
  }, []);

  function fadeAudioIn(
    audio: HTMLAudioElement,
    durationMs = 2500,
    targetVolume = 0.85,
  ) {
    audio.volume = 0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          const stepTime = 50;
          const totalSteps = durationMs / stepTime;
          const stepInc = targetVolume / totalSteps;
          const interval = setInterval(() => {
            if (audio.paused) {
              clearInterval(interval);
              return;
            }
            if (audio.volume + stepInc < targetVolume) {
              audio.volume = Math.min(targetVolume, audio.volume + stepInc);
            } else {
              audio.volume = targetVolume;
              clearInterval(interval);
            }
          }, stepTime);
        })
        .catch(() => {});
    }
  }

  // Sprint 42: Auto-open for non-envelope intro effects (curtain/fade/slide)
  // MUST be before any conditional returns (React Rules of Hooks)
  useEffect(() => {
    if (!isOpen && introEffect !== "envelope" && !loading) {
      setIsOpen(true);
    }
  }, [introEffect, isOpen, loading]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowConfetti(true);
    if (audioRef.current) {
      fadeAudioIn(audioRef.current, 2500, 0.85);
      setIsPlaying(true);
    } else {
      setIsPlaying(true);
    }
  };

  const toggleMusic = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        fadeAudioIn(audioRef.current, 1500, 0.85);
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #fce7f3, #fdf2f8)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#be185d",
            }}
          >
            💌
          </p>
          <p style={{ fontSize: 14, color: "#be185d" }}>
            Đang tải thiệp mời...
          </p>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Sprint 7: Canvas editor mode — render from canvas_json
  if (canvasJson) {
    return (
      <CanvasInvitation
        canvasJson={canvasJson}
        guestName={guestName || undefined}
        projectId={projectId || undefined}
        slug={pageSlug || undefined}
        showWatermark={!isPremium}
      />
    );
  }

  if (!projectId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #fce7f3, #fdf2f8)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: 48, margin: "0 0 16px" }}>💔</p>
          <p style={{ fontSize: 16, color: "#831843", fontWeight: 600 }}>
            Thiệp không tồn tại hoặc chưa xuất bản
          </p>
          <a href="/" style={{ fontSize: 13, color: "#be185d" }}>
            ← Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    // Envelope is the default intro animation with click-to-open
    return (
      <EnvelopeAnimation
        groomName={data.groomName}
        brideName={data.brideName}
        guestName={guestName}
        onOpen={handleOpen}
      />
    );
  }

  const theme = THEMES[templateSlug] || DEFAULT_THEME;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.bg,
        fontFamily: fontFamily,
        maxWidth: 480,
        width: "100%",
        overflowX: "hidden",
        margin: "0 auto",
        position: "relative",
        animation: "fadeIn 0.8s ease-in",
        color: theme.text,
      }}
    >
      {/* Sprint 42: Curtain Overlay — auto-dismisses after animation */}
      {introEffect.startsWith("curtain") && (
        <div
          className={`curtain-overlay curtain-${introEffect.replace("curtain", "").toLowerCase()}`}
        >
          <div className="curtain-left">
            <span className="curtain-ornament">
              {introEffect === "curtainGold"
                ? "✨"
                : introEffect === "curtainBlue"
                  ? "💎"
                  : "🌸"}
            </span>
          </div>
          <div className="curtain-right">
            <span className="curtain-ornament">
              {introEffect === "curtainGold"
                ? "👑"
                : introEffect === "curtainBlue"
                  ? "💍"
                  : "🌹"}
            </span>
          </div>
        </div>
      )}
      {/* Particle Effect Overlay */}
      <ParticleCanvas effect={particleEffect} />
      {/* Background Music Audio */}
      {data.musicUrl && (
        <audio ref={audioRef} src={data.musicUrl} loop preload="auto" />
      )}

      {/* Confetti */}
      {showConfetti && <ConfettiCanvas />}

      {/* Floating Music Player — Premium vinyl disc style */}
      {data.musicUrl && (
        <button
          onClick={toggleMusic}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 50,
            width: 52,
            height: 52,
            borderRadius: "50%",
            border: "none",
            background:
              "radial-gradient(circle at 30% 30%, #555 0%, #222 40%, #111 100%)",
            color: "#fff",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: isPlaying ? "spin 3s linear infinite" : "none",
            boxShadow:
              "0 4px 20px rgba(0,0,0,0.35), inset 0 0 0 8px rgba(255,255,255,0.08), inset 0 0 0 18px rgba(0,0,0,0.3)",
            transition: "box-shadow 0.3s",
          }}
          title={isPlaying ? "Tắt nhạc" : "Bật nhạc"}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: isPlaying
                ? "linear-gradient(135deg, #ff6b9d, #c084fc)"
                : "#666",
              border: "2px solid rgba(255,255,255,0.3)",
              transition: "background 0.3s",
            }}
          />
        </button>
      )}

      {/* Hero Section — Layout-specific */}
      {(() => {
        const layout = getLayout(templateSlug);

        if (layout === "cinematic") {
          // ── CINEMATIC: Full-screen hero, dramatic typography ──
          return (
            <section
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "40px 24px",
                textAlign: "center",
                position: "relative",
              }}
            >
              {data.photos.filter((p) => p.trim()).length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 0,
                    backgroundImage: `url(${data.photos[0]})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    filter: "brightness(0.35) blur(2px)",
                  }}
                />
              )}
              <div style={{ position: "relative", zIndex: 1 }}>
                <p
                  style={{
                    fontSize: 11,
                    letterSpacing: 6,
                    margin: "0 0 32px",
                    color: "rgba(255,255,255,0.6)",
                    textTransform: "uppercase",
                  }}
                >
                  The Wedding Of
                </p>
                <h1
                  style={{
                    fontSize: 52,
                    fontWeight: 200,
                    color: "#fff",
                    fontStyle: "italic",
                    margin: "0 0 8px",
                    lineHeight: 1.1,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {data.groomName}
                </h1>
                <p
                  style={{
                    fontSize: 28,
                    color: theme.accent,
                    margin: "0 0 8px",
                    fontWeight: 200,
                  }}
                >
                  &amp;
                </p>
                <h1
                  style={{
                    fontSize: 52,
                    fontWeight: 200,
                    color: "#fff",
                    fontStyle: "italic",
                    margin: "0 0 40px",
                    lineHeight: 1.1,
                    fontFamily: "'Playfair Display', Georgia, serif",
                    textShadow: "0 2px 20px rgba(0,0,0,0.3)",
                  }}
                >
                  {data.brideName}
                </h1>
                {data.weddingDate && (
                  <p
                    style={{
                      fontSize: 14,
                      color: "rgba(255,255,255,0.8)",
                      letterSpacing: 3,
                      margin: 0,
                      borderTop: "1px solid rgba(255,255,255,0.2)",
                      paddingTop: 20,
                    }}
                  >
                    {new Date(data.weddingDate).toLocaleDateString("vi-VN", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                )}
                {guestName && (
                  <div
                    style={{
                      marginTop: 24,
                      padding: "10px 24px",
                      borderRadius: 30,
                      background: "rgba(255,255,255,0.12)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      display: "inline-block",
                      fontSize: 14,
                      color: "#fff",
                      fontStyle: "italic",
                    }}
                  >
                    Kính gởi: <strong>{decodeURIComponent(guestName)}</strong>
                  </div>
                )}
              </div>
            </section>
          );
        }

        if (layout === "minimal") {
          // ── MINIMAL: Big typography, lots of whitespace ──
          return (
            <section
              style={{
                padding: "100px 32px 60px",
                textAlign: "center",
              }}
            >
              <h1
                style={{
                  fontSize: 48,
                  fontWeight: 100,
                  color: theme.heading,
                  margin: "0 0 0",
                  lineHeight: 1.2,
                  letterSpacing: -1,
                }}
              >
                {data.groomName}
              </h1>
              <div
                style={{
                  width: 40,
                  height: 1,
                  background: theme.accent,
                  margin: "20px auto",
                  opacity: 0.5,
                }}
              />
              <h1
                style={{
                  fontSize: 48,
                  fontWeight: 100,
                  color: theme.heading,
                  margin: "0 0 32px",
                  lineHeight: 1.2,
                  letterSpacing: -1,
                }}
              >
                {data.brideName}
              </h1>
              {data.weddingDate && (
                <p
                  style={{
                    fontSize: 13,
                    color: theme.accent,
                    letterSpacing: 4,
                    margin: "0 0 8px",
                    fontWeight: 500,
                  }}
                >
                  {new Date(data.weddingDate).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {(data.groomParentNames || data.brideParentNames) && (
                <div
                  style={{
                    fontSize: 12,
                    color: theme.text,
                    opacity: 0.5,
                    marginTop: 16,
                    lineHeight: 1.8,
                  }}
                >
                  {data.groomParentNames && (
                    <p style={{ margin: 0 }}>
                      Con trai: {data.groomParentNames}
                    </p>
                  )}
                  {data.brideParentNames && (
                    <p style={{ margin: 0 }}>
                      Con gái: {data.brideParentNames}
                    </p>
                  )}
                </div>
              )}
              {guestName && (
                <p
                  style={{
                    marginTop: 28,
                    fontSize: 15,
                    color: theme.text,
                    fontStyle: "italic",
                    opacity: 0.7,
                  }}
                >
                  Kính gởi:{" "}
                  <strong style={{ color: theme.heading }}>
                    {decodeURIComponent(guestName)}
                  </strong>
                </p>
              )}
            </section>
          );
        }

        // ── CLASSIC (default) + photo-as-hero if photo uploaded ──
        const heroPhoto = data.photos.filter((p) => p.trim())[0];
        return (
          <section
            style={{
              textAlign: "center",
              padding: heroPhoto ? "0" : "60px 24px 40px",
              position: "relative",
              minHeight: heroPhoto ? 420 : undefined,
              overflow: "hidden",
            }}
          >
            {/* Photo hero background */}
            {heroPhoto && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${heroPhoto})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center top",
                  zIndex: 0,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.75) 100%)",
                  }}
                />
              </div>
            )}
            <div
              style={{
                position: "relative",
                zIndex: 1,
                padding: heroPhoto ? "70px 24px 50px" : "0",
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: 5,
                  margin: "0 0 20px",
                  color: heroPhoto ? "rgba(255,255,255,0.7)" : theme.label,
                  textTransform: "uppercase",
                }}
              >
                WE ARE GETTING MARRIED
              </p>
              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  color: heroPhoto ? "#fff" : theme.heading,
                  fontStyle: "italic",
                  margin: "0 0 4px",
                  lineHeight: 1.2,
                  textShadow: heroPhoto ? "0 2px 12px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {data.groomName}
              </h1>
              <p
                style={{ fontSize: 22, color: theme.accent, margin: "0 0 4px" }}
              >
                &amp;
              </p>
              <h1
                style={{
                  fontSize: 42,
                  fontWeight: 300,
                  color: heroPhoto ? "#fff" : theme.heading,
                  fontStyle: "italic",
                  margin: "0 0 28px",
                  lineHeight: 1.2,
                  textShadow: heroPhoto ? "0 2px 12px rgba(0,0,0,0.4)" : "none",
                }}
              >
                {data.brideName}
              </h1>
              {data.weddingDate && (
                <p
                  style={{
                    fontSize: 12,
                    letterSpacing: 3,
                    margin: "0 0 16px",
                    color: heroPhoto ? "rgba(255,255,255,0.85)" : theme.label,
                  }}
                >
                  {new Date(data.weddingDate).toLocaleDateString("vi-VN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
              {(data.groomParentNames || data.brideParentNames) && (
                <div
                  style={{
                    fontSize: 12,
                    color: heroPhoto ? "rgba(255,255,255,0.7)" : "#9ca3af",
                    lineHeight: 1.6,
                  }}
                >
                  {data.groomParentNames && (
                    <p style={{ margin: "0 0 2px" }}>
                      Con trai: {data.groomParentNames}
                    </p>
                  )}
                  {data.brideParentNames && (
                    <p style={{ margin: 0 }}>
                      Con gái: {data.brideParentNames}
                    </p>
                  )}
                </div>
              )}
              {guestName && (
                <div
                  style={{
                    marginTop: 20,
                    padding: "10px 20px",
                    borderRadius: 12,
                    background: heroPhoto
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.5)",
                    backdropFilter: "blur(8px)",
                    display: "inline-block",
                    fontSize: 14,
                    color: heroPhoto ? "#fff" : theme.accent,
                    fontStyle: "italic",
                  }}
                >
                  💌 Kính gởi: <strong>{decodeURIComponent(guestName)}</strong>
                </div>
              )}
            </div>
          </section>
        );
      })()}

      {/* Calendar */}
      {data.weddingDate && (
        <ScrollReveal delay={0.1}>
          <section style={{ padding: "0 24px 24px" }}>
            <CalendarWidget date={data.weddingDate} />
          </section>
        </ScrollReveal>
      )}

      {/* Countdown */}
      {data.weddingDate && (
        <ScrollReveal delay={0.15}>
          <section style={{ padding: "0 24px 24px" }}>
            <CountdownWidget
              targetDate={`${data.weddingDate}T${data.weddingTime || "12:00"}`}
            />
          </section>
        </ScrollReveal>
      )}

      {/* Story */}
      {data.story && (
        <ScrollReveal delay={0.1}>
          <section style={{ padding: "0 24px 24px" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.5)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: theme.label,
                  letterSpacing: 3,
                  margin: "0 0 12px",
                }}
              >
                💕 CÂU CHUYỆN CỦA CHÚNG TÔI
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: "#374151",
                  lineHeight: 1.8,
                  margin: 0,
                }}
              >
                {data.story}
              </p>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Photo Slideshow */}
      <ScrollReveal delay={0.1}>
        <PhotoSlideshow photos={data.photos} accent={theme.accent} />
      </ScrollReveal>

      {/* YouTube Embed */}
      {data.youtubeUrl && (
        <ScrollReveal delay={0.1}>
          <YouTubeEmbed url={data.youtubeUrl} accent={theme.accent} />
        </ScrollReveal>
      )}

      {/* Venue + Map */}
      {data.venueName && (
        <ScrollReveal delay={0.1}>
          <section style={{ padding: "0 24px 24px" }}>
            <MapWidget
              venueName={data.venueName}
              venueAddress={data.venueAddress}
              mapsUrl={data.googleMapsUrl}
            />
          </section>
        </ScrollReveal>
      )}

      {/* Message */}
      {data.message && (
        <ScrollReveal delay={0.1}>
          <section style={{ padding: "0 24px 24px", textAlign: "center" }}>
            <div
              style={{
                background: "rgba(255,255,255,0.5)",
                borderRadius: 20,
                padding: 24,
              }}
            >
              <p
                style={{
                  fontSize: 12,
                  color: theme.label,
                  letterSpacing: 3,
                  margin: "0 0 12px",
                }}
              >
                💌 LỜI MỜI
              </p>
              <p
                style={{
                  fontSize: 15,
                  color: "#374151",
                  fontStyle: "italic",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                &ldquo;{data.message}&rdquo;
              </p>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* RSVP */}
      <ScrollReveal delay={0.1}>
        <section data-section="rsvp" style={{ padding: "0 24px 24px" }}>
          <RsvpWidget projectId={projectId} />
        </section>
      </ScrollReveal>

      {/* Wish Wall */}
      <ScrollReveal delay={0.15}>
        <section data-section="wishes" style={{ padding: "0 24px 24px" }}>
          <WishWallWidget projectId={projectId} />
        </section>
      </ScrollReveal>

      {/* Gift QR */}
      <ScrollReveal delay={0.1}>
        <section style={{ padding: "0 24px 24px" }}>
          <GiftQrWidget
            bankName={data.bankName}
            bankAccount={data.bankAccount}
            bankOwner={data.bankOwner}
          />
        </section>
      </ScrollReveal>

      {/* Footer — LoveStory watermark (hidden on premium) */}
      {!isPremium && (
        <footer
          style={{
            textAlign: "center",
            padding: "24px",
            borderTop: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <a
            href={`/?ref=watermark&source=${encodeURIComponent(
              pageSlug || "invitation",
            )}&k_factor=1&utm_medium=viral_badge`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, rgba(255,107,157,0.08), rgba(192,132,252,0.08))",
              border: "1px solid rgba(255,107,157,0.15)",
              textDecoration: "none",
              fontSize: 12,
              color: "#9ca3af",
            }}
          >
            ❤️ Tạo thiệp cưới miễn phí tại{" "}
            <strong style={{ color: "#ff6b9d", marginLeft: 4 }}>LoveStory</strong>
          </a>
        </footer>
      )}

      {/* Floating Click-to-Call button (bottom-left) */}
      {data.groomPhone && (
        <a
          href={`tel:${data.groomPhone}`}
          style={{
            position: "fixed",
            bottom: 24,
            left: 20,
            zIndex: 90,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 50,
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            boxShadow: "0 4px 20px rgba(16,185,129,0.35)",
            animation: "pulse 2s infinite",
          }}
        >
          📞{" "}
          <span
            style={{
              maxWidth: 120,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {data.groomPhone}
          </span>
        </a>
      )}

      {/* ── Share Buttons ── */}
      {pageSlug && (
        <ShareButtons
          slug={pageSlug}
          groomName={data.groomName}
          brideName={data.brideName}
        />
      )}

      {/* ── Viral Growth CTA — "Tạo thiệp của bạn" ── */}
      <div
        style={{
          maxWidth: 480,
          margin: "32px auto 80px",
          padding: "0 16px",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(16px)",
            borderRadius: 20,
            border: "1px solid rgba(255,107,157,0.15)",
            boxShadow: "0 4px 24px rgba(255,107,157,0.1)",
            padding: "20px 24px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              letterSpacing: 3,
              color: "#9ca3af",
              margin: "0 0 8px",
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Được tạo bởi
          </p>
          <p
            style={{
              fontSize: 20,
              fontWeight: 800,
              margin: "0 0 4px",
              background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            ❤️ LoveStory
          </p>
          <p
            style={{
              fontSize: 13,
              color: "#6b7280",
              margin: "0 0 16px",
              lineHeight: 1.5,
            }}
          >
            Tạo thiệp cưới online đẹp, miễn phí trong 5 phút
          </p>
          <a
            href={`/login?ref=invitation&from=${pageSlug || "unknown"}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 24px",
              borderRadius: 50,
              background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(255,107,157,0.4)",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 10px 28px rgba(255,107,157,0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 6px 20px rgba(255,107,157,0.4)";
            }}
          >
            💌 Tạo thiệp cưới miễn phí →
          </a>
        </div>
      </div>

      {/* Floating Heart button (bottom-right) */}
      {pageSlug && <HeartButton slug={pageSlug} />}

      {/* Sticky Bottom RSVP CTA — Cinelove style */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 45,
          maxWidth: 480,
          margin: "0 auto",
          padding: "10px 16px",
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(12px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => {
            const rsvpEl = document.querySelector('[data-section="rsvp"]');
            if (rsvpEl)
              rsvpEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          style={{
            flex: 1,
            padding: "12px 0",
            borderRadius: 10,
            background: theme.buttonGrad,
            color: "#fff",
            fontSize: 14,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            boxShadow: `0 4px 16px ${theme.accent}40`,
          }}
        >
          Xác nhận tham dự
        </button>
        <button
          onClick={() => {
            const wishEl = document.querySelector('[data-section="wishes"]');
            if (wishEl)
              wishEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
          style={{
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "#fff",
            color: "#374151",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Gửi lời chúc
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
}

export default function PublicInvitationPage({
  params,
  initialProject,
  initialIsPremium,
}: {
  params: Promise<{ slug: string }>;
  initialProject?: any;
  initialIsPremium?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <InvitationPageInner
        params={params}
        initialProject={initialProject}
        initialIsPremium={initialIsPremium}
      />
    </Suspense>
  );
}
