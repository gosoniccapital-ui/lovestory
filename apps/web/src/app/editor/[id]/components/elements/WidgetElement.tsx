"use client";

import { useEffect, useState } from "react";
import type { CanvasElement } from "../useCanvasReducer";
import { WaxSeal } from "@/components/WaxSeal";

interface WidgetElementProps {
    element: CanvasElement;
    zoom: number;
    isSelected: boolean;
    onSelect: () => void;
}

// ── CALENDAR WIDGET ──
function CalendarWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const targetDate = props.targetDate ? new Date(props.targetDate) : new Date();
    const month = targetDate.toLocaleString("vi-VN", { month: "long" });
    const year = targetDate.getFullYear();
    const day = targetDate.getDate();
    const weekday = targetDate.toLocaleString("vi-VN", { weekday: "long" });
    const firstDay = new Date(year, targetDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(year, targetDate.getMonth() + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return (
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12 * scale, border: "1px solid #e5e7eb", padding: 12 * scale, fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ textAlign: "center", marginBottom: 8 * scale }}>
                <p style={{ fontSize: 14 * scale, fontWeight: 700, color: "#374151", margin: 0, textTransform: "capitalize" }}>{month} {year}</p>
                <p style={{ fontSize: 10 * scale, color: "#9ca3af", margin: "2px 0 0" }}>{props.lunarDate || weekday}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, fontSize: 8 * scale, textAlign: "center" }}>
                {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map(d => (
                    <span key={d} style={{ fontWeight: 600, color: "#9ca3af", padding: 2 * scale }}>{d}</span>
                ))}
                {days.map((d, i) => (
                    <span key={i} style={{ padding: 2 * scale, borderRadius: 999, fontWeight: d === day ? 700 : 400, background: d === day ? "#ff6b9d" : "transparent", color: d === day ? "#fff" : d ? "#374151" : "transparent" }}>{d ?? "."}</span>
                ))}
            </div>
        </div>
    );
}

// ── COUNTDOWN WIDGET ── (CineLove parity: 4 style themes)
function CountdownWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
     
    const [now, setNow] = useState(Date.now());
     
    useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(iv); }, []);

    const cfg = ((props as { config?: Record<string, string | undefined> }).config) ?? {};
    const targetDate = cfg.targetDate;
    const label = cfg.label ?? props.label ?? "ĐẾM NGƯỢC NGÀY CƯỚI";
    const style = cfg.style ?? "pink";
    const target = targetDate ? new Date(targetDate).getTime() : Date.now() + 30 * 86400000;
    const diff = Math.max(0, target - now);
    const blocks = [
        { value: Math.floor(diff / 86400000), label: "Ngày" },
        { value: Math.floor((diff % 86400000) / 3600000), label: "Giờ" },
        { value: Math.floor((diff % 3600000) / 60000), label: "Phút" },
        { value: Math.floor((diff % 60000) / 1000), label: "Giây" },
    ];

    const themes: Record<string, { bg: string; text: string; numColor: string; blockBg: string; blockBorder: string }> = {
        pink: {
            bg: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
            text: "#831843",
            numColor: "#e11d48",
            blockBg: "#fff",
            blockBorder: "rgba(225,29,72,0.1)",
        },
        gold: {
            bg: "linear-gradient(135deg, #fdf9f0 0%, #f5e6c8 100%)",
            text: "#92400e",
            numColor: "#c9a84c",
            blockBg: "#fffbf0",
            blockBorder: "rgba(201,168,76,0.2)",
        },
        dark: {
            bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
            text: "#fef3c7",
            numColor: "#c9a84c",
            blockBg: "rgba(255,255,255,0.08)",
            blockBorder: "rgba(201,168,76,0.3)",
        },
        minimal: {
            bg: "#fff",
            text: "#374151",
            numColor: "#1f2937",
            blockBg: "#f9fafb",
            blockBorder: "rgba(0,0,0,0.08)",
        },
    };
    const t = themes[style] ?? themes.pink;

    return (
        <div style={{ width: "100%", height: "100%", background: t.bg, borderRadius: 12 * scale, padding: 12 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale }}>
            <p style={{ fontSize: 10 * scale, fontWeight: 700, color: t.text, margin: 0, letterSpacing: 1.5, textTransform: "uppercase" }}>{label}</p>
            <div style={{ display: "flex", gap: 8 * scale }}>
                {blocks.map(b => (
                    <div key={b.label} style={{ textAlign: "center", background: t.blockBg, borderRadius: 8 * scale, padding: `${6 * scale}px ${10 * scale}px`, boxShadow: `0 2px 8px ${t.blockBorder}`, minWidth: 48 * scale, border: `1px solid ${t.blockBorder}` }}>
                        <p style={{ fontSize: 22 * scale, fontWeight: 800, color: t.numColor, margin: 0, lineHeight: 1, fontFamily: "'Inter', sans-serif", fontVariantNumeric: "tabular-nums" }}>{String(b.value).padStart(2, "0")}</p>
                        <p style={{ fontSize: 8 * scale, color: t.text, margin: "2px 0 0", opacity: 0.7, fontWeight: 600 }}>{b.label}</p>
                    </div>
                ))}
            </div>
            {target > Date.now() && (
                <p style={{ fontSize: 8 * scale, color: t.text, margin: 0, opacity: 0.5 }}>
                    {new Date(target).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                </p>
            )}
        </div>
    );
}

// ── MAP WIDGET ──
function MapWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const cfg = ((props as { config?: Record<string, string | undefined> }).config) ?? {};
    const venueName = cfg.venueName ?? props.venueName ?? props.label ?? "Vị trí tiệc cưới";
    const venueAddress = cfg.venueAddress ?? props.venueAddress ?? "Nhấn để xem trên bản đồ";
    const mapUrl = cfg.mapUrl ?? props.mapUrl ?? "";
    return (
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12 * scale, border: "1px solid #e5e7eb", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg, #d1fae5, #ecfdf5)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                <span style={{ fontSize: 32 * scale }}>📍</span>
                <div style={{ position: "absolute", bottom: 6, right: 6, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: 7 * scale, padding: `${2 * scale}px ${6 * scale}px`, borderRadius: 4 * scale }}>Google Maps</div>
            </div>
            <div style={{ padding: `${8 * scale}px ${12 * scale}px`, background: "#fff" }}>
                <p style={{ fontSize: 11 * scale, fontWeight: 700, color: "#374151", margin: "0 0 2px" }}>{venueName}</p>
                <p style={{ fontSize: 9 * scale, color: "#9ca3af", margin: "0 0 6px" }}>{venueAddress}</p>
                <button
                    onClick={(e) => { e.stopPropagation(); if (mapUrl) window.open(mapUrl, "_blank"); }}
                    style={{ width: "100%", padding: `${6 * scale}px`, borderRadius: 8 * scale, border: "none", background: "#10b981", color: "#fff", fontSize: 10 * scale, fontWeight: 700, cursor: "pointer" }}
                >
                    🗺️ Chỉ đường
                </button>
            </div>
        </div>
    );
}

// ── RSVP WIDGET (Premium CineLove style) ──
function RSVPWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const cfg = ((props as { config?: Record<string, unknown> }).config) ?? {};
    const rsvpTitle = String(cfg.rsvpTitle ?? props.rsvpTitle ?? "Xác nhận tham dự");
    const rsvpSubtitle = String(cfg.rsvpSubtitle ?? props.rsvpSubtitle ?? "Vui lòng xác nhận sự hiện diện của bạn");
    const rsvpButtonText = String(cfg.rsvpButtonText ?? props.rsvpButtonText ?? "Gửi xác nhận 💌");
    const showPhone = !!(cfg.rsvpShowPhone ?? props.rsvpShowPhone);
    const showGuest = !!(cfg.rsvpShowGuestCount ?? props.rsvpShowGuestCount);
    const showDietary = !!(cfg.rsvpShowDietary ?? props.rsvpShowDietary);
    const showMessage = !!(cfg.rsvpShowMessage ?? props.rsvpShowMessage);

    const inputStyle = { width: "100%", padding: `${7 * scale}px ${10 * scale}px`, border: "1px solid #fce7f3", borderRadius: 8 * scale, fontSize: 10 * scale, outline: "none", background: "#fff8fc", boxSizing: "border-box" as const, color: "#4a2635" };
    return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #fff8fc 0%, #fff 100%)", borderRadius: 12 * scale, border: "1px solid #fce7f3", padding: 14 * scale, display: "flex", flexDirection: "column", gap: 6 * scale, boxShadow: "0 2px 16px rgba(225,29,72,0.06)", overflow: "auto" }}>
            <div style={{ textAlign: "center", paddingBottom: 6 * scale, borderBottom: `1px solid #fce7f3` }}>
                <p style={{ fontSize: 13 * scale, fontWeight: 700, color: "#831843", margin: 0, fontFamily: "'Cormorant Garamond', serif" }}>{rsvpTitle}</p>
                <p style={{ fontSize: 9 * scale, color: "#be185d", margin: `${2 * scale}px 0 0`, opacity: 0.8 }}>{rsvpSubtitle}</p>
            </div>
            <input type="text" placeholder="Họ và tên *" readOnly style={inputStyle} />
            {showPhone && <input type="tel" placeholder="Số điện thoại" readOnly style={inputStyle} />}
            {showGuest && <input type="number" placeholder="Số người tham dự" readOnly style={inputStyle} />}
            {showDietary && (
                <select disabled style={{ ...inputStyle, color: "#9ca3af", cursor: "default", appearance: "none" as const }}>
                    <option>Chế độ ăn (Bình thường)</option>
                </select>
            )}
            {showMessage && <textarea placeholder="Lời nhắn cho cô dâu chú rể..." readOnly rows={2} style={{ ...inputStyle, resize: "none" as const, fontFamily: "inherit" }} />}
            <div style={{ display: "flex", gap: 6 * scale }}>
                {["Tham dự ✓", "Không thể ✗"].map(opt => (
                    <button key={opt} style={{ flex: 1, padding: `${6 * scale}px`, borderRadius: 8 * scale, border: `1px solid ${opt.includes("✓") ? "#10b981" : "#e5e7eb"}`, background: opt.includes("✓") ? "#ecfdf5" : "#fff", fontSize: 9 * scale, fontWeight: 600, cursor: "pointer", color: opt.includes("✓") ? "#10b981" : "#6b7280" }}>{opt}</button>
                ))}
            </div>
            <button style={{ width: "100%", padding: `${8 * scale}px`, borderRadius: 8 * scale, border: "none", background: "linear-gradient(135deg, #ff6b9d, #e11d48)", color: "#fff", fontSize: 11 * scale, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>{rsvpButtonText}</button>
        </div>
    );
}

// ── QR WIDGET ──
function QRWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    return (
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12 * scale, border: "1px solid #e5e7eb", padding: 12 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 10 * scale, fontWeight: 600, color: "#374151", margin: 0 }}>{props.label || "Quét mã QR"}</p>
            <div style={{ width: 80 * scale, height: 80 * scale, background: "#f9fafb", borderRadius: 8 * scale, border: "2px solid #e5e7eb", display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, padding: 6 * scale, boxSizing: "border-box" }}>
                {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} style={{ background: [0,1,2,4,5,6,7,13,14,20,21,27,28,34,35,41,42,43,44,46,47,48].includes(i) ? "#374151" : "transparent", borderRadius: 1 }} />
                ))}
            </div>
            {props.bankName && (
                <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 8 * scale, color: "#6b7280", margin: 0 }}>{props.bankName}</p>
                    <p style={{ fontSize: 9 * scale, fontWeight: 600, color: "#374151", margin: 0 }}>{props.accountNumber}</p>
                    <p style={{ fontSize: 8 * scale, color: "#9ca3af", margin: 0 }}>{props.accountName}</p>
                </div>
            )}
        </div>
    );
}

// ── GIFT/ENVELOPE WIDGET ──
function GiftWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #fef3c7, #fefde8)", borderRadius: 12 * scale, padding: 14 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale, border: "1px solid #fcd34d" }}>
            <span style={{ fontSize: 24 * scale }}>💰</span>
            <p style={{ fontSize: 12 * scale, fontWeight: 700, color: "#92400e", margin: 0 }}>{props.label || "Phong bì mừng cưới"}</p>
            {props.bankName && (
                <div style={{ background: "#fff", borderRadius: 8 * scale, padding: `${6 * scale}px ${12 * scale}px`, textAlign: "center", width: "100%", boxSizing: "border-box" }}>
                    <p style={{ fontSize: 9 * scale, color: "#6b7280", margin: 0 }}>{props.bankName}</p>
                    <p style={{ fontSize: 11 * scale, fontWeight: 700, color: "#374151", margin: "2px 0", letterSpacing: 1 }}>{props.accountNumber || "0123456789"}</p>
                    <p style={{ fontSize: 9 * scale, color: "#9ca3af", margin: 0 }}>{props.accountName || "NGUYEN VAN A"}</p>
                </div>
            )}
        </div>
    );
}

// ── YOUTUBE WIDGET ──
function YouTubeWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const url = props.youtubeUrl ?? "";
    const match = url.match(/(?:v=|\/embed\/|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    const videoId = match?.[1];
    return (
        <div style={{ width: "100%", height: "100%", background: "#000", borderRadius: 12 * scale, overflow: "hidden", position: "relative" }}>
            {videoId ? (
                <div style={{ width: "100%", height: "100%", background: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg) center/cover`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 48 * scale, height: 34 * scale, background: "rgba(255,0,0,0.9)", borderRadius: 8 * scale, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 0, height: 0, borderTop: `${8 * scale}px solid transparent`, borderBottom: `${8 * scale}px solid transparent`, borderLeft: `${14 * scale}px solid #fff`, marginLeft: 3 * scale }} />
                    </div>
                </div>
            ) : (
                <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale, color: "#9ca3af" }}>
                    <span style={{ fontSize: 28 * scale }}>▶️</span>
                    <p style={{ fontSize: 10 * scale, margin: 0 }}>{props.label || "Dán link YouTube"}</p>
                </div>
            )}
        </div>
    );
}

// ── VINYL MUSIC WIDGET (Sprint 3 — CineLove parity) ──
function VinylMusicWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const cfg = ((props as { config?: Record<string, unknown> }).config) ?? {};
    const title = String(cfg.musicTitle ?? "Bài hát tặng em");
    const artist = String(cfg.musicArtist ?? "Nhạc sĩ yêu thương");
    const genre = String(cfg.musicGenre ?? "wedding");
    const isPlaying = true; // always animate in editor preview

    const genreColors: Record<string, { outer: string; inner: string; label: string; text: string }> = {
        wedding: { outer: "#831843", inner: "#fce7f3", label: "Wedding", text: "#831843" },
        vpop: { outer: "#1e40af", inner: "#eff6ff", label: "V-POP", text: "#1e40af" },
        international: { outer: "#1f2937", inner: "#f3f4f6", label: "International", text: "#374151" },
        lofi: { outer: "#78350f", inner: "#fef3c7", label: "Lo-Fi", text: "#92400e" },
    };
    const colors = genreColors[genre] ?? genreColors.wedding;
    const uid = `vinyl-${genre}`;

    return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)", borderRadius: 12 * scale, padding: 12 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 * scale, overflow: "hidden", position: "relative" }}>
            {/* CSS spin animation */}
            <style>{`@keyframes ${uid}-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

            {/* Vinyl disc with tone arm needle */}
            <div style={{ position: "relative", width: 72 * scale, height: 72 * scale }}>
                {/* Rotating record */}
                <div style={{ width: "100%", height: "100%", animation: isPlaying ? `${uid}-spin 4s linear infinite` : "none" }}>
                    <svg width={72 * scale} height={72 * scale} viewBox="0 0 72 72" style={{ position: "absolute", top: 0, left: 0 }}>
                        <circle cx="36" cy="36" r="35" fill="#111" stroke="#333" strokeWidth="1"/>
                        {/* Grooves */}
                        {[30, 26, 22, 18, 14].map(r => (
                            <circle key={r} cx="36" cy="36" r={r} fill="none" stroke="#2a2a2a" strokeWidth="1"/>
                        ))}
                        {/* Color label */}
                        <circle cx="36" cy="36" r="12" fill={colors.inner}/>
                        <circle cx="36" cy="36" r="3" fill={colors.outer}/>
                        {/* Highlight gleam */}
                        <ellipse cx="28" cy="22" rx="6" ry="3" fill="rgba(255,255,255,0.06)" transform="rotate(-30 28 22)"/>
                    </svg>
                </div>
                {/* Tone arm needle */}
                <div style={{ position: "absolute", top: -4 * scale, right: -2 * scale, width: 20 * scale, height: 24 * scale, transformOrigin: "top right", transform: isPlaying ? "rotate(15deg)" : "rotate(-15deg)", transition: "transform 0.3s ease" }}>
                    <svg width={20 * scale} height={24 * scale} viewBox="0 0 20 24" fill="none">
                        <circle cx="16" cy="4" r="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1"/>
                        <path d="M16 4 L7 16 L3 20" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round"/>
                        <rect x="2" y="18" width="4" height="3" rx="1" fill="#f43f5e"/>
                    </svg>
                </div>
            </div>

            {/* Music info */}
            <div style={{ textAlign: "center", width: "100%", padding: `0 ${4 * scale}px` }}>
                <p style={{ fontSize: 10 * scale, fontWeight: 700, color: "#f9fafb", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</p>
                <p style={{ fontSize: 8 * scale, color: "#9ca3af", margin: `${2 * scale}px 0 0`, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{artist}</p>
            </div>

            {/* Playback bar */}
            <div style={{ width: "80%", height: 3 * scale, background: "#374151", borderRadius: 99 }}>
                <div style={{ width: "45%", height: "100%", background: `linear-gradient(90deg, ${colors.outer}, #f472b6)`, borderRadius: 99 }}/>
            </div>

            {/* Genre badge */}
            <div style={{ position: "absolute", top: 6 * scale, right: 6 * scale, background: colors.outer, color: "#fff", fontSize: 6 * scale, fontWeight: 700, padding: `${2 * scale}px ${5 * scale}px`, borderRadius: 99, letterSpacing: 0.5 }}>{colors.label}</div>

            {/* Control icons */}
            <div style={{ display: "flex", gap: 10 * scale, alignItems: "center" }}>
                {["⏮", "⏸", "⏭"].map(icon => (
                    <span key={icon} style={{ fontSize: icon === "⏸" ? 14 * scale : 10 * scale, cursor: "pointer", opacity: icon === "⏸" ? 1 : 0.5 }}>{icon}</span>
                ))}
            </div>
        </div>
    );
}

// ── CALL BUTTON WIDGET (Sprint 33 — Cinelove parity) ──
function CallWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #ecfdf5, #d1fae5)", borderRadius: 12 * scale, border: "1px solid #6ee7b7", padding: 14 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale }}>
            <span style={{ fontSize: 28 * scale }}>📞</span>
            <p style={{ fontSize: 12 * scale, fontWeight: 700, color: "#065f46", margin: 0 }}>{props.label || "Liên hệ cô/chú rể"}</p>
            <p style={{ fontSize: 10 * scale, color: "#059669", margin: 0, fontWeight: 600 }}>{props.phoneNumber || "0909 xxx xxx"}</p>
            <button style={{ padding: `${7 * scale}px ${20 * scale}px`, borderRadius: 99, border: "none", background: "#10b981", color: "#fff", fontSize: 10 * scale, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 * scale }}>📱 Gọi ngay</button>
        </div>
    );
}

// ── ALBUM WIDGET (Sprint 35 — Cinelove parity) ──
function AlbumWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const images = (props.albumImages || "").split(",").filter(Boolean);
    return (
        <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 12 * scale, border: "1px solid #e5e7eb", padding: 10 * scale, display: "flex", flexDirection: "column", gap: 6 * scale, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11 * scale, fontWeight: 700, color: "#374151", margin: 0, textAlign: "center" }}>{props.label || "Album ảnh cưới"}</p>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 * scale, overflow: "hidden" }}>
                {(images.length > 0 ? images : ["📷", "📷", "📷", "📷"]).map((img, i) => (
                    <div key={i} style={{ background: "linear-gradient(135deg, #fdf2f8, #fce7f3)", borderRadius: 6 * scale, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", aspectRatio: "1" }}>
                        {img.startsWith("http") ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                            <span style={{ fontSize: 20 * scale, opacity: 0.4 }}>{img}</span>
                        )}
                    </div>
                ))}
            </div>
            <p style={{ fontSize: 8 * scale, color: "#9ca3af", margin: 0, textAlign: "center" }}>Vuốt để xem thêm ảnh</p>
        </div>
    );
}

// ── GUEST NAME WIDGET (Sprint 35 — Cinelove parity) ──
function GuestNameWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #fdf2f8, #faf5ff)", borderRadius: 12 * scale, border: "1px dashed #d946ef", padding: 14 * scale, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 * scale }}>
            <span style={{ fontSize: 24 * scale }}>👤</span>
            <p style={{ fontSize: 10 * scale, fontWeight: 600, color: "#9333ea", margin: 0, textTransform: "uppercase", letterSpacing: 1 }}>{props.guestNameLabel || "Trân trọng kính mời"}</p>
            <p style={{ fontSize: 16 * scale, fontWeight: 800, color: "#7c3aed", margin: 0, fontStyle: "italic" }}>Tên khách mời</p>
            <p style={{ fontSize: 8 * scale, color: "#a78bfa", margin: 0 }}>Tên sẽ tự động thay đổi khi gửi thiệp</p>
        </div>
    );
}

// ── 3D WAX SEAL MONOGRAM WIDGET (Sprint 54 — CineLove Parity) ──
function WaxSealWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const raw = props as Record<string, unknown>;
    const cfg = (raw.config as Record<string, unknown>) ?? {};
    const monogram = String(cfg.monogram ?? raw.monogram ?? raw.label ?? "K & T");
    const color = (cfg.waxColor ?? raw.waxColor ?? "crimson") as string;
    const icon = (cfg.waxIcon ?? raw.waxIcon ?? "none") as any;
    return (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <WaxSeal monogram={monogram} color={color} icon={icon} size={Math.min(120, 80 * scale)} interactive={false} />
        </div>
    );
}

// ── 3D ENVELOPE WIDGET (Sprint 54 — CineLove Parity) ──
function EnvelopeWidget({ props, scale }: { props: CanvasElement["props"]; scale: number }) {
    const raw = props as Record<string, unknown>;
    const cfg = (raw.config as Record<string, unknown>) ?? {};
    const groomName = String(cfg.groomName ?? raw.groomName ?? "Hoàng Nam");
    const brideName = String(cfg.brideName ?? raw.brideName ?? "Mai Linh");
    const waxColor = (cfg.waxColor ?? raw.waxColor ?? "gold") as string;
    const envelopeColor = String(cfg.envelopeColor ?? raw.envelopeColor ?? "#fdf8f0");
    return (
        <div style={{ width: "100%", height: "100%", borderRadius: 12 * scale, background: envelopeColor, border: "1px solid rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 4px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "45%", background: "linear-gradient(0deg, rgba(0,0,0,0.05) 0%, transparent 100%)", clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} />
            <div style={{ zIndex: 2, marginBottom: 4 * scale }}>
                <WaxSeal monogram={`${groomName.charAt(0)} & ${brideName.charAt(0)}`} color={waxColor} size={48 * scale} interactive={false} />
            </div>
            <p style={{ margin: 0, fontSize: 10 * scale, fontWeight: 700, color: "#451a03", fontFamily: "'Great Vibes', cursive", zIndex: 2 }}>{groomName} & {brideName}</p>
        </div>
    );
}

// ── MAIN WIDGET ELEMENT ──
export function WidgetElement({ element, zoom, isSelected, onSelect }: WidgetElementProps) {
    const scale = zoom / 100;
    const { x, y, width, height, opacity, rotation, props } = element;
    const wt = (props as { widgetType?: string }).widgetType ?? "countdown";
    return (
        <div data-element-id={element.id} onClick={(e) => { e.stopPropagation(); onSelect(); }} style={{ position: "absolute", left: x * scale, top: y * scale, width: width * scale, height: height * scale, opacity: opacity ?? 1, transform: rotation ? `rotate(${rotation}deg)` : undefined, cursor: "pointer", outline: isSelected ? "2px solid #3b82f6" : "none", outlineOffset: 2, transition: "outline 0.1s" }}>
            {wt === "calendar" && <CalendarWidget props={props} scale={scale} />}
            {wt === "countdown" && <CountdownWidget props={props} scale={scale} />}
            {wt === "map" && <MapWidget props={props} scale={scale} />}
            {wt === "rsvp" && <RSVPWidget props={props} scale={scale} />}
            {wt === "qr" && <QRWidget props={props} scale={scale} />}
            {wt === "gift" && <GiftWidget props={props} scale={scale} />}
            {wt === "youtube" && <YouTubeWidget props={props} scale={scale} />}
            {wt === "callbutton" && <CallWidget props={props} scale={scale} />}
            {wt === "album" && <AlbumWidget props={props} scale={scale} />}
            {wt === "guestname" && <GuestNameWidget props={props} scale={scale} />}
            {wt === "music" && <VinylMusicWidget props={props} scale={scale} />}
            {wt === "waxseal" && <WaxSealWidget props={props} scale={scale} />}
            {wt === "envelope" && <EnvelopeWidget props={props} scale={scale} />}
        </div>
    );
}
