"use client";

import React from "react";
import { VIETNAM_BANKS, buildVietQrUrl } from "./vietnam-banks";

/* ------------------------------------------------------------------ */
/*  Helper                                                             */
/* ------------------------------------------------------------------ */

function str(v: unknown, fallback: string): string {
  return typeof v === "string" && v.length > 0 ? v : fallback;
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" ? v : fallback;
}

function arr<T>(v: unknown, fallback: T[]): T[] {
  return Array.isArray(v) ? (v as T[]) : fallback;
}

/* ------------------------------------------------------------------ */
/*  Countdown                                                          */
/* ------------------------------------------------------------------ */

function CountdownWidget({ config }: { config: Record<string, unknown> }) {
  const label = str(config.label, "Dem nguoc");
  const color = str(config.color, "#ffffff");
  const labelColor = str(config.labelColor, "#e5e7eb");
  const background = str(config.background, "rgba(0,0,0,0.5)");
  const borderRadius = num(config.borderRadius, 12);
  const fontSize = num(config.fontSize, 28);

  const units = [
    { value: "00", unit: "Ngay" },
    { value: "00", unit: "Gio" },
    { value: "00", unit: "Phut" },
    { value: "00", unit: "Giay" },
  ];

  return (
    <div
      style={{
        background,
        borderRadius,
        padding: 16,
        textAlign: "center",
        width: "100%",
      }}
    >
      {label && (
        <div style={{ color: labelColor, fontSize: 14, marginBottom: 12 }}>
          {label}
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 12,
        }}
      >
        {units.map((u) => (
          <div key={u.unit} style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize,
                fontWeight: 700,
                color,
                background: "rgba(255,255,255,0.1)",
                borderRadius: 8,
                width: 52,
                height: 52,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {u.value}
            </div>
            <div
              style={{
                fontSize: 10,
                color: labelColor,
                marginTop: 4,
                textTransform: "uppercase",
              }}
            >
              {u.unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Calendar                                                           */
/* ------------------------------------------------------------------ */

function CalendarWidget({ config }: { config: Record<string, unknown> }) {
  const targetDate = str(config.targetDate, "2025-12-31");
  const accentColor = str(config.accentColor, "#e11d48");
  const textColor = str(config.textColor, "#1f2937");
  const background = str(config.background, "#ffffff");
  const borderRadius = num(config.borderRadius, 12);

  const date = new Date(targetDate);
  const monthNames = [
    "Thang 1",
    "Thang 2",
    "Thang 3",
    "Thang 4",
    "Thang 5",
    "Thang 6",
    "Thang 7",
    "Thang 8",
    "Thang 9",
    "Thang 10",
    "Thang 11",
    "Thang 12",
  ];
  const month = monthNames[date.getMonth()] ?? "Thang 12";
  const year = date.getFullYear();
  const day = date.getDate();
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  return (
    <div
      style={{
        background,
        borderRadius,
        padding: 16,
        textAlign: "center",
        color: textColor,
        width: "100%",
      }}
    >
      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: accentColor,
          marginBottom: 8,
        }}
      >
        {month} {year}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: 2,
          fontSize: 11,
          marginBottom: 4,
        }}
      >
        {dayNames.map((d) => (
          <div key={d} style={{ fontWeight: 600, opacity: 0.6, padding: 4 }}>
            {d}
          </div>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
          marginTop: 8,
        }}
      >
        <div
          style={{
            background: accentColor,
            color: "#fff",
            borderRadius: "50%",
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          {day}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Map                                                                */
/* ------------------------------------------------------------------ */

function MapWidget({ config }: { config: Record<string, unknown> }) {
  const venueName = str(config.venueName, "Dia diem");
  const address = str(config.address, "Dia chi se hien thi o day");
  const height = num(config.height, 200);
  const borderRadius = num(config.borderRadius, 12);
  const accentColor = str(config.accentColor, "#e11d48");

  return (
    <div
      style={{
        borderRadius,
        overflow: "hidden",
        width: "100%",
        height,
        background: "#e5e7eb",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Grid lines to suggest a map */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Pin icon */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50% 50% 50% 0",
          background: accentColor,
          transform: "rotate(-45deg)",
          marginBottom: 12,
          position: "relative",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            width: 16,
            height: 16,
            borderRadius: "50%",
            background: "#fff",
          }}
        />
      </div>
      <div
        style={{
          fontWeight: 600,
          fontSize: 14,
          color: "#1f2937",
          position: "relative",
          zIndex: 1,
        }}
      >
        {venueName}
      </div>
      <div
        style={{
          fontSize: 12,
          color: "#6b7280",
          marginTop: 4,
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          padding: "0 16px",
        }}
      >
        {address}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RSVP                                                               */
/* ------------------------------------------------------------------ */

function RsvpWidget({ config }: { config: Record<string, unknown> }) {
  const title = str(config.title, "Xac nhan tham du");
  const subtitle = str(config.subtitle, "Vui long cho chung toi biet");
  const accentColor = str(config.accentColor, "#e11d48");
  const textColor = str(config.textColor, "#1f2937");
  const background = str(config.background, "#ffffff");
  const borderRadius = num(config.borderRadius, 12);

  return (
    <div
      style={{
        background,
        borderRadius,
        padding: 20,
        width: "100%",
        color: textColor,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
        {subtitle}
      </div>
      {/* Name field */}
      <div
        style={{
          border: "1px solid #d1d5db",
          borderRadius: 8,
          padding: "8px 12px",
          marginBottom: 10,
          fontSize: 13,
          color: "#9ca3af",
        }}
      >
        Ho va ten
      </div>
      {/* Attendance toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <div
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            background: accentColor,
            color: "#fff",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          Tham du
        </div>
        <div
          style={{
            flex: 1,
            padding: 8,
            borderRadius: 8,
            border: "1px solid #d1d5db",
            textAlign: "center",
            fontSize: 13,
            color: textColor,
          }}
        >
          Vang mat
        </div>
      </div>
      {/* Submit button */}
      <div
        style={{
          background: accentColor,
          color: "#fff",
          padding: 10,
          borderRadius: 8,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        Gui xac nhan
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  QR Box & Dynamic VietQR Generator                                 */
/* ------------------------------------------------------------------ */

interface PhotoItem {
  url: string;
  caption?: string;
  date?: string;
}

function QrBoxWidget({ config }: { config: Record<string, unknown> }) {
  const bankBin = str(config.bankBin, "");
  const bankName = str(config.bankName, "");
  const accountNumber = str(config.accountNumber, "");
  const accountName = str(config.accountName, "NGUYEN VAN A");
  const defaultAmount = str(config.amount, "");
  const defaultNote = str(config.note, "Mung cuoi");
  const accentColor = str(config.accentColor, "#e11d48");
  const textColor = str(config.textColor, "#1f2937");
  const borderRadius = num(config.borderRadius, 16);

  const [customGuest, setCustomGuest] = React.useState("");
  const [customWish, setCustomWish] = React.useState("");
  const [selectedAmount, setSelectedAmount] = React.useState(defaultAmount);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);

  const quickAmounts = [
    { label: "200k", value: "200000" },
    { label: "500k", value: "500000" },
    { label: "1 Triệu", value: "1000000" },
    { label: "2 Triệu", value: "2000000" },
  ];

  const dynamicNote = React.useMemo(() => {
    const parts: string[] = [defaultNote || "Mung cuoi"];
    if (customGuest.trim()) parts.push(customGuest.trim());
    if (customWish.trim()) parts.push(customWish.trim());
    return parts.join(" - ");
  }, [defaultNote, customGuest, customWish]);

  const hasQrData = bankBin && accountNumber;
  const qrUrl = hasQrData
    ? buildVietQrUrl(bankBin, accountNumber, selectedAmount, dynamicNote)
    : "";

  const displayBankName =
    bankName ||
    VIETNAM_BANKS.find((b) => b.bin === bankBin)?.name ||
    "Ngân hàng";

  const handleCopy = (text: string, field: string) => {
    if (!text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div
      style={{
        borderRadius,
        padding: 20,
        width: "100%",
        background: "linear-gradient(180deg, #ffffff 0%, #fffbf8 100%)",
        textAlign: "center",
        color: textColor,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "4px 12px",
          borderRadius: 99,
          background: "rgba(225, 29, 72, 0.08)",
          color: accentColor,
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 12,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <span>🎁</span> Mừng Cưới Chúc Phúc
      </div>

      <div
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: textColor,
          marginBottom: 4,
        }}
      >
        {displayBankName}
      </div>

      {hasQrData ? (
        <div style={{ position: "relative", display: "inline-block", margin: "10px auto" }}>
          <img
            src={qrUrl}
            alt="VietQR Napas 247"
            width={160}
            height={160}
            style={{
              display: "block",
              margin: "0 auto",
              borderRadius: 12,
              border: "1px solid #f1f5f9",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
            }}
          />
          <div
            style={{
              fontSize: 10,
              color: "#64748b",
              marginTop: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
            }}
          >
            <span>⚡</span> Quét qua mọi ứng dụng ngân hàng
          </div>
        </div>
      ) : (
        <div
          style={{
            width: 140,
            height: 140,
            margin: "12px auto",
            background: "#f8fafc",
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "2px dashed #cbd5e1",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div style={{ fontSize: 24 }}>📱</div>
          <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 500 }}>
            Chưa cấu hình QR
          </div>
        </div>
      )}

      {/* Account Info with 1-click copy */}
      <div
        style={{
          background: "#f8fafc",
          borderRadius: 12,
          padding: "10px 14px",
          marginTop: 10,
          border: "1px solid #e2e8f0",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 11, color: "#64748b" }}>Chủ tài khoản</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{accountName}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span style={{ fontSize: 11, color: "#64748b" }}>Số tài khoản: </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: accentColor, fontFamily: "monospace" }}>
              {accountNumber || "Chưa nhập"}
            </span>
          </div>
          {accountNumber && (
            <button
              onClick={() => handleCopy(accountNumber, "account")}
              style={{
                background: copiedField === "account" ? "#10b981" : "#ffffff",
                color: copiedField === "account" ? "#ffffff" : "#475569",
                border: "1px solid #cbd5e1",
                borderRadius: 6,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {copiedField === "account" ? "✓ Đã chép" : "Sao chép"}
            </button>
          )}
        </div>
      </div>

      {/* Quick Amount Selector */}
      <div style={{ marginTop: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", marginBottom: 6, textAlign: "left" }}>
          Gợi ý số tiền mừng cưới:
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {quickAmounts.map((q) => (
            <button
              key={q.value}
              onClick={() => setSelectedAmount(selectedAmount === q.value ? "" : q.value)}
              style={{
                padding: "6px 4px",
                borderRadius: 8,
                border: `1px solid ${selectedAmount === q.value ? accentColor : "#e2e8f0"}`,
                background: selectedAmount === q.value ? "rgba(225, 29, 72, 0.08)" : "#ffffff",
                color: selectedAmount === q.value ? accentColor : "#334155",
                fontSize: 11,
                fontWeight: selectedAmount === q.value ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Note Inputs */}
      <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8, textAlign: "left" }}>
        <input
          type="text"
          placeholder="Tên bạn (ví dụ: Bạn Nam)"
          value={customGuest}
          onChange={(e) => setCustomGuest(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <input
          type="text"
          placeholder="Lời chúc (ví dụ: Trăm năm hạnh phúc)"
          value={customWish}
          onChange={(e) => setCustomWish(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            fontSize: 12,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Copy Note Button */}
      <div
        style={{
          marginTop: 10,
          background: "#fff1f2",
          borderRadius: 8,
          padding: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px dashed #fecdd3",
        }}
      >
        <div style={{ fontSize: 11, color: "#9f1239", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
          Nội dung: <strong>{dynamicNote}</strong>
        </div>
        <button
          onClick={() => handleCopy(dynamicNote, "note")}
          style={{
            background: copiedField === "note" ? "#10b981" : "#e11d48",
            color: "#ffffff",
            border: "none",
            borderRadius: 6,
            padding: "3px 8px",
            fontSize: 10,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {copiedField === "note" ? "✓ Đã chép" : "Chép ND"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Photo Album (Grid, Storytelling Carousel & 3D Parallax)           */
/* ------------------------------------------------------------------ */

function AlbumWidget({ config }: { config: Record<string, unknown> }) {
  const rawPhotos = config.photos;
  const layout = str(config.layout, "grid"); // "grid" | "carousel" | "parallax_3d"
  const columns = num(config.columns, 2);
  const gap = num(config.gap, 10);
  const borderRadius = num(config.borderRadius, 12);
  const accentColor = str(config.accentColor, "#e11d48");
  const title = str(config.title, "Khoảnh Khắc Hạnh Phúc");
  const subtitle = str(config.subtitle, "Câu chuyện tình yêu của chúng mình");

  // Normalize photos into PhotoItem[]
  const photos: PhotoItem[] = React.useMemo(() => {
    if (!rawPhotos) {
      return [
        { url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80", caption: "Lần đầu gặp gỡ", date: "Mùa thu 2022" },
        { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80", caption: "Chuyến đi đầu tiên cùng nhau", date: "Đà Lạt 2023" },
        { url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80", caption: "Lời cầu hôn ngọt ngào", date: "Phú Quốc 2024" },
        { url: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&q=80", caption: "Chúng mình về chung một nhà", date: "Hôm nay" },
      ];
    }
    if (Array.isArray(rawPhotos)) {
      return rawPhotos.map((p, idx) => {
        if (typeof p === "string") {
          return { url: p, caption: `Khoảnh khắc ${idx + 1}` };
        }
        if (p && typeof p === "object") {
          return {
            url: str((p as Record<string, unknown>).url, ""),
            caption: str((p as Record<string, unknown>).caption, ""),
            date: str((p as Record<string, unknown>).date, ""),
          };
        }
        return { url: "", caption: "" };
      });
    }
    return [];
  }, [rawPhotos]);

  // Carousel active index & Lightbox modal state
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [lightboxIndex, setLightboxIndex] = React.useState<number | null>(null);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % photos.length);
  };
  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div style={{ width: "100%", boxSizing: "border-box" }}>
      {/* Title & Subtitle */}
      {(title || subtitle) && (
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          {title && (
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: accentColor,
                fontFamily: "'Playfair Display', serif",
                letterSpacing: "0.5px",
              }}
            >
              {title}
            </div>
          )}
          {subtitle && (
            <div
              style={{
                fontSize: 12,
                color: "#64748b",
                marginTop: 4,
                fontStyle: "italic",
                fontFamily: "'Cormorant Garamond', serif",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      )}

      {/* MODE 1: STORYTELLING CAROUSEL */}
      {layout === "carousel" && (
        <div style={{ position: "relative", width: "100%", overflow: "hidden", borderRadius }}>
          <div
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: "4/3",
              borderRadius,
              overflow: "hidden",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              background: "#000",
              cursor: "pointer",
            }}
            onClick={() => setLightboxIndex(activeIndex)}
          >
            {photos[activeIndex]?.url ? (
              <img
                src={photos[activeIndex].url}
                alt={photos[activeIndex].caption || "Wedding photo"}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 0.5s ease",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#94a3b8",
                  fontSize: 13,
                }}
              >
                Chưa có ảnh
              </div>
            )}

            {/* Story Gradient Overlay & Caption */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "30px 16px 14px",
                background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.85) 100%)",
                color: "#ffffff",
                textAlign: "left",
              }}
            >
              {photos[activeIndex]?.date && (
                <div
                  style={{
                    display: "inline-block",
                    padding: "2px 8px",
                    borderRadius: 4,
                    background: accentColor,
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  {photos[activeIndex].date}
                </div>
              )}
              {photos[activeIndex]?.caption && (
                <div style={{ fontSize: 13, fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.5)" }}>
                  {photos[activeIndex].caption}
                </div>
              )}
            </div>

            {/* Tap indicator */}
            <div
              style={{
                position: "absolute",
                top: 12,
                right: 12,
                background: "rgba(0,0,0,0.4)",
                backdropFilter: "blur(4px)",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: 99,
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              🔍 Chạm để phóng to
            </div>
          </div>

          {/* Navigation Arrows */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevSlide();
                }}
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(4px)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextSlide();
                }}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(4px)",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  color: "#1e293b",
                  fontWeight: 700,
                }}
              >
                ›
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {photos.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  style={{
                    width: activeIndex === idx ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: activeIndex === idx ? accentColor : "#cbd5e1",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    transition: "all 0.25s ease",
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODE 2: 3D PARALLAX TILT CARDS */}
      {layout === "parallax_3d" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
            perspective: "1000px",
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightboxIndex(i)}
              style={{
                position: "relative",
                borderRadius,
                overflow: "hidden",
                aspectRatio: "3/4",
                background: "#f1f5f9",
                boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.12)",
                cursor: "pointer",
                transform: "translateZ(0)",
                transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease",
              }}
              onMouseEnter={(e) => {
                const target = e.currentTarget;
                target.style.transform = "scale(1.03) translateY(-4px) rotateY(4deg)";
                target.style.boxShadow = "0 16px 30px -5px rgba(0, 0, 0, 0.2)";
              }}
              onMouseLeave={(e) => {
                const target = e.currentTarget;
                target.style.transform = "translateZ(0)";
                target.style.boxShadow = "0 10px 20px -5px rgba(0, 0, 0, 0.12)";
              }}
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#94a3b8",
                  }}
                >
                  Ảnh {i + 1}
                </div>
              )}

              {/* Caption Tag */}
              {photo.caption && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "16px 8px 8px",
                    background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.75) 100%)",
                    color: "#fff",
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* MODE 3: MASONRY / CLASSIC GRID */}
      {layout === "grid" && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap,
          }}
        >
          {photos.map((photo, i) => (
            <div
              key={i}
              onClick={() => setLightboxIndex(i)}
              style={{
                position: "relative",
                borderRadius,
                overflow: "hidden",
                aspectRatio: "1",
                background: "#f1f5f9",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                cursor: "pointer",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              {photo.url ? (
                <img
                  src={photo.url}
                  alt={photo.caption || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    color: "#94a3b8",
                  }}
                >
                  Ảnh {i + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* LIGHTBOX MODAL */}
      {lightboxIndex !== null && photos[lightboxIndex] && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.92)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            onClick={() => setLightboxIndex(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              background: "rgba(255,255,255,0.2)",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: 40,
              height: 40,
              fontSize: 20,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          <div
            style={{
              maxWidth: "90%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photos[lightboxIndex].url}
              alt=""
              style={{
                maxWidth: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 8,
                boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              }}
            />
            {photos[lightboxIndex].caption && (
              <div
                style={{
                  color: "#f8fafc",
                  fontSize: 15,
                  fontWeight: 600,
                  marginTop: 14,
                  textAlign: "center",
                  fontFamily: "'Playfair Display', serif",
                }}
              >
                {photos[lightboxIndex].caption}
                {photos[lightboxIndex].date && (
                  <span style={{ fontSize: 12, color: "#94a3b8", display: "block", marginTop: 4 }}>
                    {photos[lightboxIndex].date}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Lightbox Nav Buttons */}
          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! - 1 + photos.length) % photos.length);
                }}
                style={{
                  position: "absolute",
                  left: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev! + 1) % photos.length);
                }}
                style={{
                  position: "absolute",
                  right: 20,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "50%",
                  width: 44,
                  height: 44,
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Envelope                                                           */
/* ------------------------------------------------------------------ */


function EnvelopeWidget({ config }: { config: Record<string, unknown> }) {
  const groomName = str(config.groomName, "Chu re");
  const brideName = str(config.brideName, "Co dau");
  const label = str(config.label, "Thiep Moi");
  const envelopeColor = str(config.envelopeColor, "#fef3c7");
  const sealColor = str(config.sealColor, "#e11d48");
  const textColor = str(config.textColor, "#92400e");
  const fontFamily = str(config.fontFamily, "'Playfair Display', serif");

  return (
    <div
      style={{
        width: "100%",
        position: "relative",
        fontFamily,
      }}
    >
      {/* Envelope body */}
      <div
        style={{
          background: envelopeColor,
          borderRadius: 12,
          padding: "32px 20px",
          textAlign: "center",
          color: textColor,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Flap triangle */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            background: `linear-gradient(135deg, ${envelopeColor} 49.5%, transparent 50.5%), linear-gradient(-135deg, ${envelopeColor} 49.5%, transparent 50.5%)`,
            filter: "brightness(0.9)",
          }}
        />
        {/* Seal */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: sealColor,
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            zIndex: 1,
          }}
        >
          <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>W</div>
        </div>
        <div
          style={{
            fontSize: 12,
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>
          {groomName} & {brideName}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  YouTube                                                            */
/* ------------------------------------------------------------------ */

function YoutubeWidget({ config }: { config: Record<string, unknown> }) {
  const borderRadius = num(config.borderRadius, 12);
  const aspectRatio = str(config.aspectRatio, "16/9");

  return (
    <div
      style={{
        width: "100%",
        aspectRatio,
        borderRadius,
        background: "#0f0f0f",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Play button */}
      <div
        style={{
          width: 56,
          height: 40,
          background: "#e11d48",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderTop: "10px solid transparent",
            borderBottom: "10px solid transparent",
            borderLeft: "16px solid #fff",
            marginLeft: 4,
          }}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 8,
          left: 12,
          fontSize: 11,
          color: "#9ca3af",
        }}
      >
        YouTube Video
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Call Button                                                        */
/* ------------------------------------------------------------------ */

function CallButtonWidget({ config }: { config: Record<string, unknown> }) {
  const buttonLabel = str(config.label, "Goi dien");
  const callType = str(config.type, "call") as "call" | "zalo" | "sms";
  const accentColor = str(config.accentColor, "#e11d48");
  const textColor = str(config.textColor, "#ffffff");
  const borderRadius = num(config.borderRadius, 24);

  const typeLabels: Record<string, string> = {
    call: "Tel",
    zalo: "Zalo",
    sms: "SMS",
  };

  return (
    <div style={{ width: "100%", textAlign: "center" }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: accentColor,
          color: textColor,
          padding: "10px 24px",
          borderRadius,
          fontSize: 14,
          fontWeight: 600,
          cursor: "default",
        }}
      >
        <span style={{ fontSize: 11, opacity: 0.8 }}>
          [{typeLabels[callType] ?? "Tel"}]
        </span>
        {buttonLabel}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Guest Name                                                         */
/* ------------------------------------------------------------------ */

function GuestNameWidget({ config }: { config: Record<string, unknown> }) {
  const prefix = str(config.prefix, "Kinh gui");
  const defaultName = str(config.defaultName, "Quy khach");
  const fontSize = num(config.fontSize, 20);
  const fontFamily = str(config.fontFamily, "'Playfair Display', serif");
  const color = str(config.color, "#1f2937");
  const textAlign = str(
    config.textAlign,
    "center",
  ) as React.CSSProperties["textAlign"];
  const accentColor = str(config.accentColor, "#e11d48");

  return (
    <div
      style={{
        width: "100%",
        textAlign,
        fontFamily,
      }}
    >
      {prefix && (
        <div
          style={{
            fontSize: fontSize * 0.6,
            color,
            opacity: 0.7,
            marginBottom: 4,
          }}
        >
          {prefix}
        </div>
      )}
      <div
        style={{
          fontSize,
          fontWeight: 600,
          color: accentColor,
          borderBottom: `2px dashed ${accentColor}40`,
          display: "inline-block",
          paddingBottom: 4,
          minWidth: 120,
        }}
      >
        {defaultName}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Form Builder                                                       */
/* ------------------------------------------------------------------ */

interface FormField {
  id?: string;
  label?: string;
  type?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
}

function FormBuilderWidget({ config }: { config: Record<string, unknown> }) {
  const title = str(config.title, "Bieu mau");
  const subtitle = str(config.subtitle, "");
  const fields = arr<FormField>(config.fields, [
    { id: "1", label: "Ho ten", type: "text", placeholder: "Nhap ho ten" },
    { id: "2", label: "So dien thoai", type: "tel", placeholder: "Nhap SDT" },
  ]);
  const buttonText = str(config.buttonText, "Gui");
  const accentColor = str(config.accentColor, "#e11d48");
  const textColor = str(config.textColor, "#1f2937");
  const background = str(config.background, "#ffffff");
  const borderRadius = num(config.borderRadius, 12);

  return (
    <div
      style={{
        background,
        borderRadius,
        padding: 20,
        width: "100%",
        color: textColor,
      }}
    >
      <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
          {subtitle}
        </div>
      )}
      {fields.map((field, i) => (
        <div key={field.id ?? i} style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 4 }}>
            {field.label ?? `Truong ${i + 1}`}
            {field.required && (
              <span style={{ color: accentColor, marginLeft: 2 }}>*</span>
            )}
          </div>
          {field.type === "select" ? (
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              {field.placeholder ?? "Chon..."}
            </div>
          ) : field.type === "textarea" ? (
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#9ca3af",
                minHeight: 60,
              }}
            >
              {field.placeholder ?? "Nhap noi dung..."}
            </div>
          ) : (
            <div
              style={{
                border: "1px solid #d1d5db",
                borderRadius: 8,
                padding: "8px 12px",
                fontSize: 13,
                color: "#9ca3af",
              }}
            >
              {field.placeholder ?? "Nhap..."}
            </div>
          )}
        </div>
      ))}
      <div
        style={{
          background: accentColor,
          color: "#fff",
          padding: 10,
          borderRadius: 8,
          textAlign: "center",
          fontSize: 14,
          fontWeight: 600,
          marginTop: 8,
        }}
      >
        {buttonText}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main renderer                                                      */
/* ------------------------------------------------------------------ */

const WIDGET_MAP: Record<
  string,
  React.ComponentType<{ config: Record<string, unknown> }>
> = {
  countdown: CountdownWidget,
  calendar: CalendarWidget,
  map: MapWidget,
  rsvp: RsvpWidget,
  qrbox: QrBoxWidget,
  album: AlbumWidget,
  envelope: EnvelopeWidget,
  youtube: YoutubeWidget,
  callbutton: CallButtonWidget,
  guestname: GuestNameWidget,
  formbuilder: FormBuilderWidget,
};

export function WidgetRenderer({
  widgetType,
  config,
}: {
  widgetType: string;
  config: Record<string, unknown>;
}) {
  const Component = WIDGET_MAP[widgetType];

  if (!Component) {
    return (
      <div
        style={{
          padding: 16,
          background: "#fef2f2",
          borderRadius: 8,
          color: "#991b1b",
          fontSize: 13,
          textAlign: "center",
        }}
      >
        Widget khong ho tro: {widgetType}
      </div>
    );
  }

  return <Component config={config} />;
}

export default WidgetRenderer;
