"use client";

import { useRef } from "react";
import {
    Scissors, ImageIcon, Sparkles, Trash2,
    ChevronsUp, ChevronsDown, Copy,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    ChevronDown, Link2, Lock, Unlock,
} from "lucide-react";
import type { CanvasElement, Action, ParticleEffect } from "./useCanvasReducer";
import { AccordionSection } from "./AccordionSection";
import { FontPickerModal, SYSTEM_FONTS } from "./FontPickerModal";
import { useState } from "react";

// ── Color swatch presets ──
const COLOR_SWATCHES = [
    "#831843", "#C2185B", "#E91E63", "#F06292",
    "#7B1FA2", "#9C27B0", "#3949AB", "#1565C0",
    "#00695C", "#2E7D32", "#F57F17", "#E65100",
    "#4E342E", "#37474F", "#fff", "#000",
];

const SHADOW_PRESETS = [
    { label: "Nhẹ", value: "0 2px 8px rgba(0,0,0,0.15)" },
    { label: "Vừa", value: "0 4px 16px rgba(0,0,0,0.25)" },
    { label: "Đậm", value: "0 8px 32px rgba(0,0,0,0.4)" },
    { label: "Trong", value: "inset 0 0 20px rgba(0,0,0,0.2)" },
];

interface RightPanelProps {
    selectedEl: CanvasElement | null;
    allElements: CanvasElement[];
    dispatch: (action: Action) => void;
    background: string;
    particleEffect: string;
    canvasWidth: number;
    onReplaceImage: () => void;
    onShowFontPicker: () => void;
    showFontPicker: boolean;
    onCloseFontPicker: () => void;
    onSelectElement: (id: string) => void;
}

// ── Reusable row label ──
function Label({ children }: { children: React.ReactNode }) {
    return (
        <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 5, letterSpacing: 0.3 }}>
            {children}
        </label>
    );
}

// ── Color picker row ──
function ColorRow({ value, onChange }: { value: string; onChange: (c: string) => void }) {
    return (
        <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: 4, marginBottom: 6 }}>
                {COLOR_SWATCHES.map(c => (
                    <button key={c} onClick={() => onChange(c)} style={{
                        width: "100%", aspectRatio: "1", borderRadius: 4,
                        background: c, padding: 0, cursor: "pointer",
                        border: value === c ? "2.5px solid #ff6b9d" : "1.5px solid rgba(0,0,0,0.08)",
                        boxSizing: "border-box",
                    }} />
                ))}
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input type="color" value={value.startsWith("#") ? value : "#ffffff"} onChange={e => onChange(e.target.value)}
                    style={{ width: 32, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer", padding: 1 }} />
                <input type="text" value={value} onChange={e => onChange(e.target.value)}
                    style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, fontFamily: "monospace", outline: "none" }} />
            </div>
        </div>
    );
}

// ── Action button row (Lên / Xuống / Nhân đôi) ──
function LayerActions({ el, dispatch }: { el: CanvasElement; dispatch: (a: Action) => void }) {
    return (
        <div style={{ display: "flex", gap: 5, marginBottom: 4 }}>
            {[
                { icon: <ChevronsUp size={12} />, action: () => dispatch({ type: "BRING_FORWARD", id: el.id }), title: "Lên trên" },
                { icon: <ChevronsDown size={12} />, action: () => dispatch({ type: "SEND_BACKWARD", id: el.id }), title: "Xuống dưới" },
                { icon: <Copy size={12} />, action: () => dispatch({ type: "DUPLICATE", id: el.id }), title: "Nhân đôi" },
                { icon: <Trash2 size={12} />, action: () => dispatch({ type: "DELETE_ELEMENT", id: el.id }), title: "Xóa", danger: true },
            ].map((btn, i) => (
                <button key={i} title={btn.title} onClick={btn.action} style={{
                    flex: 1, padding: "6px 2px", borderRadius: 7, cursor: "pointer", fontSize: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid " + ((btn as { danger?: boolean }).danger ? "#fecdd3" : "#e5e7eb"),
                    background: (btn as { danger?: boolean }).danger ? "#fff1f2" : "#fff",
                    color: (btn as { danger?: boolean }).danger ? "#e11d48" : "#374151",
                }}>
                    {btn.icon}
                </button>
            ))}
        </div>
    );
}

// ══════════════════════════════════════════
// IMAGE PANEL
// ══════════════════════════════════════════
function ImagePanel({ el, dispatch, onReplaceImage }: { el: CanvasElement; dispatch: (a: Action) => void; onReplaceImage: () => void }) {
    const p = el.props;
    const upd = (changes: Record<string, unknown>) =>
        dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { props: { ...p, ...changes } } });

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Element thumbnail */}
            {p.src && (
                <div style={{ margin: "12px 16px 8px", display: "flex", justifyContent: "center" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.src} alt=""
                        style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 10, border: "2px solid #f3f4f6", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }} />
                </div>
            )}

            {/* Sprint 32: Crop mode controls */}
            <div style={{ padding: "4px 12px 12px", display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <button onClick={() => upd({ objectFit: p.objectFit === "contain" ? "cover" : "contain" })}
                        style={{
                            flex: 1, padding: "7px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
                            background: p.objectFit === "contain" ? "#eff6ff" : "#fff",
                            cursor: "pointer", fontSize: 11, fontWeight: 600,
                            color: p.objectFit === "contain" ? "#2563eb" : "#374151",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                        }}>
                        <Scissors size={12} /> {p.objectFit === "contain" ? "Vừa khung" : "Cắt vừa"}
                    </button>
                    {([
                        { label: "1:1", w: 1, h: 1 },
                        { label: "4:3", w: 4, h: 3 },
                        { label: "3:4", w: 3, h: 4 },
                        { label: "16:9", w: 16, h: 9 },
                    ] as const).map(r => (
                        <button key={r.label} onClick={() => {
                            const newW = Math.min(el.width, 350);
                            const newH = Math.round(newW * r.h / r.w);
                            dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { width: newW, height: newH } });
                        }}
                        style={{
                            padding: "7px 10px", borderRadius: 8, border: "1.5px solid #e5e7eb",
                            background: "#fff", cursor: "pointer", fontSize: 10, fontWeight: 600, color: "#6b7280",
                        }}>
                            {r.label}
                        </button>
                    ))}
                </div>
                <button onClick={onReplaceImage} style={{
                    width: "100%", padding: "9px 0", borderRadius: 8, border: "1.5px solid #e5e7eb",
                    background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#374151",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                    <ImageIcon size={13} /> Đổi ảnh
                </button>
                <button onClick={() => alert("Tính năng đang phát triển")} style={{
                    width: "100%", padding: "9px 0", borderRadius: 8, border: "none",
                    background: "linear-gradient(135deg, #8b5cf6, #6d28d9)",
                    cursor: "pointer", fontSize: 12, fontWeight: 700, color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                }}>
                    <Sparkles size={13} /> Xóa nền (AI)
                </button>
            </div>

            {/* Layer actions */}
            <div style={{ padding: "0 12px 8px" }}>
                <LayerActions el={el} dispatch={dispatch} />
            </div>

            <div style={{ height: 1, background: "#f3f4f6" }} />

            {/* ── Màu sắc (tint/overlay) ── */}
            <AccordionSection title="Màu sắc" icon="🎨" defaultOpen={false}>
                <Label>Bộ lọc màu</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5, marginBottom: 8 }}>
                    {[
                        { label: "Gốc", filter: "" },
                        { label: "B&W", filter: "grayscale(100%)" },
                        { label: "Sepia", filter: "sepia(80%)" },
                        { label: "Ấm", filter: "saturate(150%) hue-rotate(-15deg)" },
                        { label: "Mát", filter: "saturate(80%) hue-rotate(15deg) brightness(1.05)" },
                        { label: "Fade", filter: "opacity(70%) brightness(1.1)" },
                    ].map(f => (
                        <button key={f.label} onClick={() => upd({ filter: f.filter })} style={{
                            padding: "6px 4px", borderRadius: 7, fontSize: 11, cursor: "pointer",
                            border: `1px solid ${p.filter === f.filter ? "#ff6b9d" : "#e5e7eb"}`,
                            background: p.filter === f.filter ? "#fdf2f8" : "#fafafa",
                            color: "#374151", fontWeight: p.filter === f.filter ? 700 : 400,
                        }}>{f.label}</button>
                    ))}
                </div>
                <Label>Độ sáng: {p.brightness ?? 100}%</Label>
                <input type="range" min={0} max={200} value={p.brightness ?? 100}
                    onChange={e => upd({ brightness: Number(e.target.value) })} style={{ width: "100%", marginBottom: 6 }} />
                <Label>Tương phản: {p.contrast ?? 100}%</Label>
                <input type="range" min={0} max={200} value={p.contrast ?? 100}
                    onChange={e => upd({ contrast: Number(e.target.value) })} style={{ width: "100%", marginBottom: 6 }} />
                <Label>Bão hòa: {p.saturation ?? 100}%</Label>
                <input type="range" min={0} max={200} value={p.saturation ?? 100}
                    onChange={e => upd({ saturation: Number(e.target.value) })} style={{ width: "100%", marginBottom: 6 }} />
                <button onClick={() => upd({ brightness: 100, contrast: 100, saturation: 100, filter: "" })} style={{
                    width: "100%", padding: "5px 0", borderRadius: 6, border: "1px solid #e5e7eb",
                    background: "#f9fafb", cursor: "pointer", fontSize: 11, color: "#9ca3af",
                }}>Reset mặc định</button>

                {/* Image fit mode */}
                <div style={{ marginTop: 10 }}>
                    <Label>Chế độ ảnh</Label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4 }}>
                        {(["cover", "contain", "fill"] as const).map(fit => (
                            <button key={fit} onClick={() => upd({ objectFit: fit })} style={{
                                padding: "6px 4px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                                border: `1.5px solid ${(p.objectFit ?? "cover") === fit ? "#ff6b9d" : "#e5e7eb"}`,
                                background: (p.objectFit ?? "cover") === fit ? "#fdf2f8" : "#fff",
                                color: (p.objectFit ?? "cover") === fit ? "#ff6b9d" : "#374151",
                            }}>{fit === "cover" ? "Lấp đầy" : fit === "contain" ? "Vừa khung" : "Kéo dãn"}</button>
                        ))}
                    </div>
                </div>

                {/* Quick border radius */}
                <div style={{ marginTop: 10 }}>
                    <Label>Bo góc nhanh</Label>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[0, 8, 16, 50, 999].map(r => (
                            <button key={r} onClick={() => upd({ borderRadius: r })} style={{
                                flex: 1, padding: "6px 2px", borderRadius: 6, fontSize: 10, cursor: "pointer",
                                border: `1.5px solid ${(p.borderRadius ?? 0) === r ? "#ff6b9d" : "#e5e7eb"}`,
                                background: (p.borderRadius ?? 0) === r ? "#fdf2f8" : "#fff",
                                color: (p.borderRadius ?? 0) === r ? "#ff6b9d" : "#374151",
                            }}>{r === 0 ? "Vuông" : r === 999 ? "Tròn" : `${r}px`}</button>
                        ))}
                    </div>
                </div>
            </AccordionSection>

            {/* ── Khoảng đệm ── */}
            <AccordionSection title="Khoảng đệm" icon="📐" defaultOpen={false}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                        { label: "Trên", key: "paddingTop" },
                        { label: "Phải", key: "paddingRight" },
                        { label: "Dưới", key: "paddingBottom" },
                        { label: "Trái", key: "paddingLeft" },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <Label>{label}</Label>
                            <input type="number" min={0} max={100}
                                value={(p as Record<string, unknown>)[key] as number ?? 0}
                                onChange={e => upd({ [key]: Number(e.target.value) })}
                                style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                    ))}
                </div>
            </AccordionSection>

            {/* ── Đường viền ── */}
            <AccordionSection title="Đường viền" icon="🔲" defaultOpen={false}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Label>Độ dày</Label>
                        <input type="number" min={0} max={20}
                            value={p.borderWidth ?? 0}
                            onChange={e => upd({ borderWidth: Number(e.target.value) })}
                            style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Label>Bo góc</Label>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                            {[
                                { label: "↖", key: "borderRadiusTL" },
                                { label: "↗", key: "borderRadiusTR" },
                                { label: "↙", key: "borderRadiusBL" },
                                { label: "↘", key: "borderRadiusBR" },
                            ].map(({ label, key }) => (
                                <div key={key} style={{ display: "flex", alignItems: "center", gap: 2 }}>
                                    <span style={{ fontSize: 9, color: "#9ca3af", width: 12 }}>{label}</span>
                                    <input type="number" min={0} max={200}
                                        value={(p as Record<string, unknown>)[key] as number ?? (p.borderRadius ?? 0)}
                                        onChange={e => upd({ [key]: Number(e.target.value) })}
                                        style={{ width: "100%", padding: "4px 6px", border: "1px solid #e5e7eb", borderRadius: 4, fontSize: 11, outline: "none", boxSizing: "border-box" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <Label>Kiểu viền</Label>
                <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    {(["solid", "dashed", "dotted"] as const).map(style => (
                        <button key={style} onClick={() => upd({ borderStyle: style })} style={{
                            flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 11, cursor: "pointer",
                            border: `1.5px solid ${p.borderStyle === style ? "#ff6b9d" : "#e5e7eb"}`,
                            background: p.borderStyle === style ? "#fdf2f8" : "#fff",
                            color: p.borderStyle === style ? "#ff6b9d" : "#374151",
                        }}>{style === "solid" ? "Liền" : style === "dashed" ? "Đứt" : "Chấm"}</button>
                    ))}
                </div>
                <Label>Màu viền</Label>
                <ColorRow value={p.borderColor ?? "#000000"} onChange={c => upd({ borderColor: c })} />
            </AccordionSection>

            {/* ── Đổ bóng ── */}
            <AccordionSection title="Đổ bóng" icon="🌑" defaultOpen={false}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 8 }}>
                    {SHADOW_PRESETS.map(s => (
                        <button key={s.label} onClick={() => upd({ boxShadow: p.boxShadow === s.value ? "" : s.value })} style={{
                            padding: "8px 4px", borderRadius: 8, fontSize: 11, cursor: "pointer",
                            border: `1.5px solid ${p.boxShadow === s.value ? "#ff6b9d" : "#e5e7eb"}`,
                            background: p.boxShadow === s.value ? "#fdf2f8" : "#fff",
                            color: p.boxShadow === s.value ? "#ff6b9d" : "#374151",
                            boxShadow: s.value,
                        }}>{s.label}</button>
                    ))}
                </div>
                <button onClick={() => upd({ boxShadow: "" })} style={{
                    width: "100%", padding: "5px 0", borderRadius: 6, border: "1px solid #e5e7eb",
                    background: "#f9fafb", cursor: "pointer", fontSize: 11, color: "#9ca3af",
                }}>Tắt bóng</button>
            </AccordionSection>

            {/* ── Hiệu ứng chuyển động ── */}
            <AccordionSection title="Hiệu ứng chuyển động" icon="🎬" defaultOpen={false}>
                <Label>Xuất hiện</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
                    {(["none", "fadeIn", "slideUp", "slideDown", "slideLeft", "slideRight", "zoomIn", "bounceIn"] as const).map(val => (
                        <button key={val} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { animation: { ...el.animation, entrance: val, loop: el.animation?.loop ?? "none" } } })} style={{
                            padding: "6px 4px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                            border: `1.5px solid ${(el.animation?.entrance ?? "none") === val ? "#ff6b9d" : "#e5e7eb"}`,
                            background: (el.animation?.entrance ?? "none") === val ? "#fdf2f8" : "#fff",
                            color: (el.animation?.entrance ?? "none") === val ? "#ff6b9d" : "#374151",
                        }}>{({none:"Không",fadeIn:"Fade In",slideUp:"Slide Up",slideDown:"Slide ↓",slideLeft:"Slide ←",slideRight:"Slide →",zoomIn:"Zoom In",bounceIn:"Bounce"})[val]}</button>
                    ))}
                </div>
            </AccordionSection>

            {/* ── Chuyển động liên tục ── */}
            <AccordionSection title="Chuyển động liên tục" icon="🔄" defaultOpen={false}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {(["none", "pulse", "float", "shake"] as const).map(val => (
                        <button key={val} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { animation: { entrance: el.animation?.entrance ?? "none", loop: val } } })} style={{
                            padding: "6px 4px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                            border: `1.5px solid ${(el.animation?.loop ?? "none") === val ? "#ff6b9d" : "#e5e7eb"}`,
                            background: (el.animation?.loop ?? "none") === val ? "#fdf2f8" : "#fff",
                            color: (el.animation?.loop ?? "none") === val ? "#ff6b9d" : "#374151",
                        }}>{val === "none" ? "Không" : val === "pulse" ? "Nhịp tim" : val === "float" ? "Lơ lửng" : "Rung"}</button>
                    ))}
                </div>
            </AccordionSection>

            {/* ── Liên kết (Image) ── */}
            <AccordionSection title="Liên kết" icon="🔗" defaultOpen={false}>
                <Label>URL liên kết</Label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Link2 size={14} color="#9ca3af" />
                    <input type="url" placeholder="https://..."
                        value={(p as Record<string, unknown>).linkUrl as string ?? ""}
                        onChange={e => upd({ linkUrl: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none" }} />
                </div>
                <div style={{ marginTop: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                        <input type="checkbox" checked={(p as Record<string, unknown>).linkNewTab as boolean ?? true}
                            onChange={e => upd({ linkNewTab: e.target.checked })} style={{ width: 14, height: 14 }} />
                        Mở tab mới
                    </label>
                </div>
            </AccordionSection>

            {/* ── Cơ bản ── */}
            <AccordionSection title="Cơ bản" icon="⚙️" defaultOpen={true}>
                {/* Lock toggle */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <Label>Khóa phần tử</Label>
                    <button onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { locked: !el.locked } })} style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                        border: `1.5px solid ${el.locked ? "#ef4444" : "#e5e7eb"}`,
                        background: el.locked ? "#fef2f2" : "#fff",
                        color: el.locked ? "#ef4444" : "#6b7280", fontSize: 11, fontWeight: 600,
                    }}>
                        {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        {el.locked ? "Đã khóa" : "Mở khóa"}
                    </button>
                </div>
                {/* Size & Position */}
                <Label>Kích thước & Vị trí</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[
                        { label: "W", key: "width", value: el.width },
                        { label: "H", key: "height", value: el.height },
                        { label: "X", key: "x", value: el.x },
                        { label: "Y", key: "y", value: el.y },
                    ].map(({ label, key, value }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", width: 14 }}>{label}</span>
                            <input type="number" value={Math.round(value)}
                                onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { [key]: Number(e.target.value) } })}
                                style={{ flex: 1, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                    ))}
                </div>
                <Label>Trong suất</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <input type="range" min={0} max={100} value={Math.round((el.opacity ?? 1) * 100)}
                        onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Number(e.target.value) / 100 } })}
                        style={{ flex: 1 }} />
                    <input type="number" min={0} max={1} step={0.01} value={(el.opacity ?? 1).toFixed(2)}
                        onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })}
                        style={{ width: 56, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, textAlign: "right", outline: "none" }} />
                </div>
                {/* Sprint 22: Opacity quick presets */}
                <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
                    {[25, 50, 75, 100].map(v => (
                        <button key={v} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: v / 100 } })}
                            style={{ flex: 1, padding: "3px 0", fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", background: Math.round((el.opacity ?? 1) * 100) === v ? "#3b82f6" : "#fff", color: Math.round((el.opacity ?? 1) * 100) === v ? "#fff" : "#6b7280", cursor: "pointer", fontWeight: 600 }}>{v}%</button>
                    ))}
                </div>
                <Label>Xoay: {el.rotation ?? 0}°</Label>
                <input type="range" min={-180} max={180}
                    value={el.rotation ?? 0}
                    onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { rotation: Number(e.target.value) } })}
                    style={{ width: "100%", marginBottom: 4 }} />
                {/* Sprint 23: Rotation quick presets */}
                <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[0, 45, 90, 180, 270].map(v => (
                        <button key={v} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { rotation: v } })}
                            style={{ flex: 1, padding: "3px 0", fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", background: (el.rotation ?? 0) === v ? "#3b82f6" : "#fff", color: (el.rotation ?? 0) === v ? "#fff" : "#6b7280", cursor: "pointer", fontWeight: 600 }}>{v}°</button>
                    ))}
                </div>
            </AccordionSection>
        </div>
    );
}

// ══════════════════════════════════════════
// TEXT PANEL
// ══════════════════════════════════════════
function TextPanel({ el, dispatch, onShowFontPicker }: { el: CanvasElement; dispatch: (a: Action) => void; onShowFontPicker: () => void }) {
    const p = el.props;
    const upd = (changes: Record<string, unknown>) =>
        dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { props: { ...p, ...changes } } });
    const shadow = p.textShadow ?? { active: false, color: "rgba(0,0,0,0.4)", blur: 4, x: 2, y: 2 };

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Layer actions */}
            <div style={{ padding: "10px 12px 4px" }}>
                <LayerActions el={el} dispatch={dispatch} />
            </div>

            <div style={{ height: 1, background: "#f3f4f6" }} />

            {/* ── Typography ── */}
            <AccordionSection title="Phông chữ" icon="🔤" defaultOpen={true}>
                {/* Font Picker button */}
                <div style={{ marginBottom: 10 }}>
                    <Label>Font chữ</Label>
                    <button onClick={onShowFontPicker} style={{
                        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid #e5e7eb",
                        background: "#fff", cursor: "pointer",
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        fontFamily: p.fontFamily ?? "'Dancing Script', cursive", fontSize: 15, color: "#374151",
                    }}>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {(p.fontFamily ?? "Dancing Script").replace(/['"]/g, "").split(",")[0].trim()}
                        </span>
                        <ChevronDown size={13} color="#9ca3af" />
                    </button>
                </div>

                {/* Font size */}
                <div style={{ marginBottom: 10 }}>
                    <Label>Cỡ chữ</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <button onClick={() => upd({ fontSize: Math.max(8, (p.fontSize ?? 24) - 1) })}
                            style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#374151" }}>−</button>
                        <input type="number" min={8} max={120} value={p.fontSize ?? 24}
                            onChange={e => upd({ fontSize: Number(e.target.value) })}
                            style={{ flex: 1, textAlign: "center", padding: "6px 4px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 13, outline: "none" }} />
                        <button onClick={() => upd({ fontSize: Math.min(120, (p.fontSize ?? 24) + 1) })}
                            style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#374151" }}>+</button>
                    </div>
                </div>

                {/* B / I / U / S / Aa */}
                <div style={{ marginBottom: 10 }}>
                    <Label>Kiểu chữ</Label>
                    <div style={{ display: "flex", gap: 4 }}>
                        {[
                            { label: "B", key: "fontWeight", active: p.fontWeight === "bold", action: () => upd({ fontWeight: p.fontWeight === "bold" ? "normal" : "bold" }), bold: true },
                            { label: "I", key: "fontStyle", active: p.fontStyle === "italic", action: () => upd({ fontStyle: p.fontStyle === "italic" ? "normal" : "italic" }), italic: true },
                            { label: "U", key: "decoration", active: (p.textDecoration ?? "").includes("underline"), action: () => upd({ textDecoration: (p.textDecoration ?? "").includes("underline") ? "none" : "underline" }) },
                            { label: "S", key: "strike", active: (p.textDecoration ?? "").includes("line-through"), action: () => upd({ textDecoration: (p.textDecoration ?? "").includes("line-through") ? "none" : "line-through" }) },
                            { label: "Aa", key: "case", active: false, action: () => {
                                const cur = p.textTransform ?? "none";
                                upd({ textTransform: cur === "none" ? "uppercase" : cur === "uppercase" ? "capitalize" : "none" });
                            }},
                        ].map(btn => (
                            <button key={btn.label} onClick={btn.action} style={{
                                flex: 1, height: 30, borderRadius: 7, border: `1.5px solid ${btn.active ? "#ff6b9d" : "#e5e7eb"}`,
                                background: btn.active ? "#fdf2f8" : "#fff", cursor: "pointer",
                                fontSize: 12, fontWeight: btn.bold ? 800 : 400,
                                fontStyle: btn.italic ? "italic" : "normal",
                                color: btn.active ? "#ff6b9d" : "#374151",
                                textDecoration: btn.label === "U" ? "underline" : btn.label === "S" ? "line-through" : "none",
                            }}>{btn.label}</button>
                        ))}
                    </div>
                </div>

                {/* Alignment */}
                <div style={{ marginBottom: 10 }}>
                    <Label>Căn lề</Label>
                    <div style={{ display: "flex", gap: 4 }}>
                        {([
                            { icon: <AlignLeft size={13} />, value: "left" },
                            { icon: <AlignCenter size={13} />, value: "center" },
                            { icon: <AlignRight size={13} />, value: "right" },
                            { icon: <AlignJustify size={13} />, value: "justify" },
                        ] as const).map(btn => (
                            <button key={btn.value} onClick={() => upd({ textAlign: btn.value })} style={{
                                flex: 1, height: 30, borderRadius: 7, cursor: "pointer",
                                border: `1.5px solid ${(p.textAlign ?? "center") === btn.value ? "#ff6b9d" : "#e5e7eb"}`,
                                background: (p.textAlign ?? "center") === btn.value ? "#fdf2f8" : "#fff",
                                color: (p.textAlign ?? "center") === btn.value ? "#ff6b9d" : "#374151",
                                display: "flex", alignItems: "center", justifyContent: "center",
                            }}>{btn.icon}</button>
                        ))}
                    </div>
                </div>

                {/* Line height + Letter spacing side by side */}
                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                    <div style={{ flex: 1 }}>
                        <Label>Dòng: {p.lineHeight ?? 1.4}</Label>
                        <input type="range" min={0.8} max={3} step={0.1} value={p.lineHeight ?? 1.4}
                            onChange={e => upd({ lineHeight: Number(e.target.value) })} style={{ width: "100%" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Label>Cách: {p.letterSpacing ?? 0}px</Label>
                        <input type="range" min={-2} max={20} step={0.5} value={p.letterSpacing ?? 0}
                            onChange={e => upd({ letterSpacing: Number(e.target.value) })} style={{ width: "100%" }} />
                    </div>
                </div>
            </AccordionSection>

            {/* ── Màu chữ ── */}
            <AccordionSection title="Màu sắc" icon="🎨" defaultOpen={false}>
                <Label>Màu chữ</Label>
                <ColorRow value={p.color ?? "#831843"} onChange={c => upd({ color: c })} />
                {/* Gradient text presets */}
                <div style={{ marginTop: 8 }}>
                    <Label>Gradient chữ</Label>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {[
                            { label: "Hồng-Tím", value: "linear-gradient(135deg, #ff6b9d, #c084fc)" },
                            { label: "Vàng-Cam", value: "linear-gradient(135deg, #f59e0b, #ef4444)" },
                            { label: "Xanh-Lam", value: "linear-gradient(135deg, #06b6d4, #3b82f6)" },
                            { label: "Xanh-Tím", value: "linear-gradient(135deg, #10b981, #8b5cf6)" },
                            { label: "Vàng-Gold", value: "linear-gradient(135deg, #d4a574, #b8860b)" },
                            { label: "Hồng-Rose", value: "linear-gradient(135deg, #f472b6, #ec4899, #be185d)" },
                        ].map(g => (
                            <button key={g.label} title={g.label} onClick={() => upd({ color: g.value })} style={{
                                width: 28, height: 28, borderRadius: 7, border: `2px solid ${p.color === g.value ? "#ff6b9d" : "#e5e7eb"}`,
                                background: g.value, cursor: "pointer", padding: 0, flexShrink: 0,
                                boxShadow: p.color === g.value ? "0 0 0 2px rgba(255,107,157,0.3)" : "none",
                            }} />
                        ))}
                        {/* Reset to solid color */}
                        {typeof p.color === "string" && p.color.startsWith("linear-gradient") && (
                            <button onClick={() => upd({ color: "#831843" })} style={{
                                height: 28, padding: "0 8px", borderRadius: 7, border: "1px solid #e5e7eb",
                                background: "#fff", cursor: "pointer", fontSize: 9, color: "#9ca3af", fontWeight: 600,
                            }}>Reset</button>
                        )}
                    </div>
                    {/* Gradient angle slider */}
                    {typeof p.color === "string" && p.color.startsWith("linear-gradient") && (
                        <div style={{ marginTop: 6 }}>
                            <Label>Góc gradient: {(() => { const m = p.color.match(/linear-gradient\((\d+)deg/); return m ? m[1] : "135"; })()}°</Label>
                            <input type="range" min={0} max={360} step={15}
                                value={(() => { const m = (p.color as string).match(/linear-gradient\((\d+)deg/); return m ? Number(m[1]) : 135; })()}
                                onChange={e => {
                                    const angle = e.target.value;
                                    const newColor = (p.color as string).replace(/linear-gradient\(\d+deg/, `linear-gradient(${angle}deg`);
                                    upd({ color: newColor });
                                }}
                                style={{ width: "100%" }}
                            />
                        </div>
                    )}
                </div>
                <div style={{ marginTop: 10 }}>
                    <Label>Màu nền chữ</Label>
                    <ColorRow value={p.backgroundColor ?? "transparent"} onChange={c => upd({ backgroundColor: c })} />
                </div>
                <div style={{ marginTop: 10 }}>
                    <Label>Trong suất</Label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input type="range" min={0} max={100} value={Math.round((el.opacity ?? 1) * 100)}
                            onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Number(e.target.value) / 100 } })}
                            style={{ flex: 1 }} />
                        <input type="number" min={0} max={1} step={0.01} value={(el.opacity ?? 1).toFixed(2)}
                            onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })}
                            style={{ width: 56, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, textAlign: "right", outline: "none" }} />
                    </div>
                </div>
            </AccordionSection>

            {/* ── Khoảng đệm (Text) ── */}
            <AccordionSection title="Khoảng đệm" icon="📐" defaultOpen={false}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[
                        { label: "Trên", key: "paddingTop" },
                        { label: "Phải", key: "paddingRight" },
                        { label: "Dưới", key: "paddingBottom" },
                        { label: "Trái", key: "paddingLeft" },
                    ].map(({ label, key }) => (
                        <div key={key}>
                            <Label>{label}</Label>
                            <input type="number" min={0} max={100}
                                value={(p as Record<string, unknown>)[key] as number ?? 0}
                                onChange={e => upd({ [key]: Number(e.target.value) })}
                                style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                    ))}
                </div>
            </AccordionSection>

            {/* ── Đường viền (Text) ── */}
            <AccordionSection title="Đường viền" icon="🔲" defaultOpen={false}>
                <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                    <div style={{ flex: 1 }}>
                        <Label>Độ dày</Label>
                        <input type="number" min={0} max={20}
                            value={(p as Record<string, unknown>).borderWidth as number ?? 0}
                            onChange={e => upd({ borderWidth: Number(e.target.value) })}
                            style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <Label>Bo góc</Label>
                        <input type="number" min={0} max={200}
                            value={(p as Record<string, unknown>).borderRadius as number ?? 0}
                            onChange={e => upd({ borderRadius: Number(e.target.value) })}
                            style={{ width: "100%", padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", boxSizing: "border-box" }}
                        />
                    </div>
                </div>
                <Label>Kiểu viền</Label>
                <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
                    {(["solid", "dashed", "dotted"] as const).map(style => (
                        <button key={style} onClick={() => upd({ borderStyle: style })} style={{
                            flex: 1, padding: "5px 0", borderRadius: 6, fontSize: 11, cursor: "pointer",
                            border: `1.5px solid ${(p as Record<string, unknown>).borderStyle === style ? "#ff6b9d" : "#e5e7eb"}`,
                            background: (p as Record<string, unknown>).borderStyle === style ? "#fdf2f8" : "#fff",
                            color: (p as Record<string, unknown>).borderStyle === style ? "#ff6b9d" : "#374151",
                        }}>{style === "solid" ? "Liền" : style === "dashed" ? "Đứt" : "Chấm"}</button>
                    ))}
                </div>
                <Label>Màu viền</Label>
                <ColorRow value={(p as Record<string, unknown>).borderColor as string ?? "#000000"} onChange={c => upd({ borderColor: c })} />
            </AccordionSection>

            {/* ── Đổ bóng ── */}
            <AccordionSection title="Đổ bóng chữ" icon="🌑" defaultOpen={false}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <input type="checkbox" checked={shadow.active ?? false} onChange={e => upd({ textShadow: { ...shadow, active: e.target.checked } })} style={{ width: 16, height: 16 }} />
                    <span style={{ fontSize: 12, color: "#374151" }}>Bật bóng chữ</span>
                </div>
                {shadow.active && (
                    <>
                        <Label>Màu bóng</Label>
                        <ColorRow value={shadow.color ?? "rgba(0,0,0,0.4)"} onChange={c => upd({ textShadow: { ...shadow, color: c } })} />
                        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                            <div style={{ flex: 1 }}>
                                <Label>X: {shadow.x ?? 2}px</Label>
                                <input type="range" min={-20} max={20} value={shadow.x ?? 2}
                                    onChange={e => upd({ textShadow: { ...shadow, x: Number(e.target.value) } })} style={{ width: "100%" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Label>Y: {shadow.y ?? 2}px</Label>
                                <input type="range" min={-20} max={20} value={shadow.y ?? 2}
                                    onChange={e => upd({ textShadow: { ...shadow, y: Number(e.target.value) } })} style={{ width: "100%" }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <Label>Blur: {shadow.blur ?? 4}px</Label>
                                <input type="range" min={0} max={40} value={shadow.blur ?? 4}
                                    onChange={e => upd({ textShadow: { ...shadow, blur: Number(e.target.value) } })} style={{ width: "100%" }} />
                            </div>
                        </div>
                    </>
                )}
            </AccordionSection>

            {/* ── Hiệu ứng ── */}
            <AccordionSection title="Hiệu ứng chuyển động" icon="🎬" defaultOpen={false}>
                <Label>Xuất hiện</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, marginBottom: 10 }}>
                    {(["none", "fadeIn", "slideUp", "slideDown", "slideLeft", "slideRight", "zoomIn", "bounceIn"] as const).map(val => (
                        <button key={val} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { animation: { ...el.animation, entrance: val, loop: el.animation?.loop ?? "none" } } })} style={{
                            padding: "6px 4px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                            border: `1.5px solid ${(el.animation?.entrance ?? "none") === val ? "#ff6b9d" : "#e5e7eb"}`,
                            background: (el.animation?.entrance ?? "none") === val ? "#fdf2f8" : "#fff",
                            color: (el.animation?.entrance ?? "none") === val ? "#ff6b9d" : "#374151",
                        }}>{({none:"Không",fadeIn:"Fade In",slideUp:"Slide Up",slideDown:"Slide ↓",slideLeft:"Slide ←",slideRight:"Slide →",zoomIn:"Zoom In",bounceIn:"Bounce"})[val]}</button>
                    ))}
                </div>
                <Label>Liên tục</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                    {(["none", "pulse", "float", "shake"] as const).map(val => (
                        <button key={val} onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { animation: { entrance: el.animation?.entrance ?? "none", loop: val } } })} style={{
                            padding: "6px 4px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                            border: `1.5px solid ${(el.animation?.loop ?? "none") === val ? "#ff6b9d" : "#e5e7eb"}`,
                            background: (el.animation?.loop ?? "none") === val ? "#fdf2f8" : "#fff",
                            color: (el.animation?.loop ?? "none") === val ? "#ff6b9d" : "#374151",
                        }}>{val === "none" ? "Không" : val === "pulse" ? "Nhịp tim" : val === "float" ? "Lơ lửng" : "Rung"}</button>
                    ))}
                </div>
            </AccordionSection>

            {/* ── Liên kết (Text) ── */}
            <AccordionSection title="Liên kết" icon="🔗" defaultOpen={false}>
                <Label>URL liên kết</Label>
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <Link2 size={14} color="#9ca3af" />
                    <input type="url" placeholder="https://..."
                        value={(p as Record<string, unknown>).linkUrl as string ?? ""}
                        onChange={e => upd({ linkUrl: e.target.value })}
                        style={{ flex: 1, padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none" }} />
                </div>
                <div style={{ marginTop: 6 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#6b7280", cursor: "pointer" }}>
                        <input type="checkbox" checked={(p as Record<string, unknown>).linkNewTab as boolean ?? true}
                            onChange={e => upd({ linkNewTab: e.target.checked })} style={{ width: 14, height: 14 }} />
                        Mở tab mới
                    </label>
                </div>
            </AccordionSection>

            {/* ── Cơ bản (Text) ── */}
            <AccordionSection title="Cơ bản" icon="⚙️" defaultOpen={false}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <Label>Khóa phần tử</Label>
                    <button onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { locked: !el.locked } })} style={{
                        display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                        border: `1.5px solid ${el.locked ? "#ef4444" : "#e5e7eb"}`,
                        background: el.locked ? "#fef2f2" : "#fff",
                        color: el.locked ? "#ef4444" : "#6b7280", fontSize: 11, fontWeight: 600,
                    }}>
                        {el.locked ? <Lock size={12} /> : <Unlock size={12} />}
                        {el.locked ? "Đã khóa" : "Mở khóa"}
                    </button>
                </div>
                <Label>Kích thước & Vị trí</Label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 10 }}>
                    {[
                        { label: "W", key: "width", value: el.width },
                        { label: "H", key: "height", value: el.height },
                        { label: "X", key: "x", value: el.x },
                        { label: "Y", key: "y", value: el.y },
                    ].map(({ label, key, value }) => (
                        <div key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#9ca3af", width: 14 }}>{label}</span>
                            <input type="number" value={Math.round(value)}
                                onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { [key]: Number(e.target.value) } })}
                                style={{ flex: 1, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, outline: "none", boxSizing: "border-box" }}
                            />
                        </div>
                    ))}
                </div>
                <Label>Trong suất</Label>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <input type="range" min={0} max={100} value={Math.round((el.opacity ?? 1) * 100)}
                        onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Number(e.target.value) / 100 } })}
                        style={{ flex: 1 }} />
                    <input type="number" min={0} max={1} step={0.01} value={(el.opacity ?? 1).toFixed(2)}
                        onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })}
                        style={{ width: 56, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, textAlign: "right", outline: "none" }} />
                </div>
                <Label>Xoay: {el.rotation ?? 0}°</Label>
                <input type="range" min={-180} max={180}
                    value={el.rotation ?? 0}
                    onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { rotation: Number(e.target.value) } })}
                    style={{ width: "100%", marginBottom: 4 }} />
                <button onClick={() => dispatch({ type: "UPDATE_ELEMENT", id: el.id, changes: { rotation: 0 } })} style={{
                    width: "100%", padding: "4px 0", borderRadius: 6, border: "1px solid #e5e7eb",
                    background: "#f9fafb", cursor: "pointer", fontSize: 10, color: "#9ca3af",
                }}>Reset 0°</button>
            </AccordionSection>
        </div>
    );
}

// ══════════════════════════════════════════
// MAIN RIGHT PANEL
// ══════════════════════════════════════════
export function RightPanel({ selectedEl, allElements, dispatch, background, particleEffect, canvasWidth, onReplaceImage, onShowFontPicker, showFontPicker, onCloseFontPicker, onSelectElement }: RightPanelProps) {
    const BG_PRESETS = [
        { label: "Hồng nhạt", value: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)" },
        { label: "Be sang", value: "linear-gradient(135deg, #fefde8 0%, #fef3c7 100%)" },
        { label: "Xanh mint", value: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)" },
        { label: "Tím nhạt", value: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)" },
        { label: "Trắng", value: "#ffffff" },
        { label: "Kem", value: "#fdf8f0" },
        { label: "Champagne", value: "linear-gradient(135deg, #f9f3e3, #f0e6c4)" },
        { label: "Đen", value: "#111111" },
    ];

    return (
        <div style={{
            width: 320, background: "#fff",
            borderLeft: "1px solid #e5e7eb",
            flexShrink: 0, overflowY: "auto",
            display: "flex", flexDirection: "column",
        }}>
            {/* Header */}
            <div style={{ padding: "12px 16px 10px", borderBottom: "1px solid #f3f4f6", flexShrink: 0 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#374151", margin: 0, letterSpacing: 0.5 }}>
                    ✏️ Tuỳ chỉnh
                </p>
            </div>

            {/* No element selected — global panel */}
            {!selectedEl && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 8px" }}>Kích đúp vào văn bản để chỉnh sửa</p>

                        {/* Trạng thái — Cinelove parity */}
                        <div style={{ marginBottom: 14 }}>
                            <Label>Trạng thái</Label>
                            <select style={{
                                width: "100%", padding: "8px 12px", borderRadius: 8,
                                border: "1px solid #e5e7eb", background: "#fff",
                                fontSize: 13, color: "#374151", outline: "none", cursor: "pointer",
                            }}>
                                <option value="public">Công khai</option>
                                <option value="draft">Nháp</option>
                            </select>
                            <p style={{ fontSize: 10, color: "#9ca3af", margin: "4px 0 0" }}>
                                Chỉ khi ở trạng thái &quot;Công khai&quot;, trang mới có thể xem được từ URL.
                            </p>
                        </div>

                        {/* Social Preview — Cinelove parity */}
                        <div style={{ marginBottom: 14 }}>
                            <Label>Bản xem trước</Label>
                            <div style={{
                                border: "1px solid #e5e7eb", borderRadius: 10,
                                overflow: "hidden", background: "#f9fafb",
                            }}>
                                <div style={{ width: "100%", height: 100, background: "linear-gradient(135deg, #fce7f3, #fdf2f8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontSize: 28 }}>💕</span>
                                </div>
                                <div style={{ padding: "8px 10px" }}>
                                    <p style={{ fontSize: 12, fontWeight: 600, color: "#374151", margin: "0 0 2px" }}>Thiệp mời cưới</p>
                                    <p style={{ fontSize: 10, color: "#9ca3af", margin: 0 }}>Đây là cách trang sẽ hiển thị khi chia sẻ trên mạng xã hội.</p>
                                </div>
                            </div>
                        </div>

                        {/* Canvas info */}
                        <div style={{ padding: "10px 14px", borderRadius: 10, background: "#f9fafb", border: "1px solid #f3f4f6" }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: 0.8 }}>Thiệp</p>
                            <div style={{ display: "flex", gap: 4 }}>
                                {([
                                    { label: "📱 Mobile", w: 390, h: 844 },
                                    { label: "📱 Tablet", w: 500, h: 844 },
                                    { label: "🖥️ Desktop", w: 720, h: 1280 },
                                ] as const).map(sz => (
                                    <button key={sz.w} onClick={() => dispatch({ type: "SET_CANVAS_SIZE", width: sz.w, height: sz.h })}
                                        style={{
                                            flex: 1, padding: "6px 4px", borderRadius: 8,
                                            border: canvasWidth === sz.w ? "2px solid #ff6b9d" : "1px solid #e5e7eb",
                                            background: canvasWidth === sz.w ? "#fff0f6" : "#fff",
                                            cursor: "pointer", fontSize: 10, fontWeight: 600,
                                            color: canvasWidth === sz.w ? "#be185d" : "#6b7280",
                                            transition: "all 0.15s", textAlign: "center",
                                        }}
                                    >
                                        <div>{sz.label}</div>
                                        <div style={{ fontSize: 9, opacity: 0.7 }}>{sz.w}×{sz.h}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <AccordionSection title="Nền nhanh" icon="🖼️" defaultOpen={true}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                            {BG_PRESETS.map(bg => (
                                <button key={bg.label} title={bg.label}
                                    onClick={() => dispatch({ type: "SET_BACKGROUND", background: bg.value })}
                                    style={{
                                        width: "100%", aspectRatio: "1", borderRadius: 8, background: bg.value,
                                        border: `2px solid ${background === bg.value ? "#ff6b9d" : "transparent"}`,
                                        cursor: "pointer", padding: 0,
                                        boxShadow: "0 1px 4px rgba(0,0,0,.1)", transition: "border-color 0.15s",
                                    }}
                                />
                            ))}
                        </div>

                        {/* Sprint 55 G1: Background image upload — replaces CineLove bg with custom image */}
                        <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
                            <label style={{
                                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                background: "linear-gradient(135deg, #ff6b9d, #c084fc)", color: "#fff",
                                cursor: "pointer", textAlign: "center",
                                boxShadow: "0 2px 8px rgba(255,107,157,.25)",
                            }}>
                                📷 Thay ảnh nền
                                <input type="file" accept="image/*" style={{ display: "none" }}
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            const dataUrl = reader.result as string;
                                            dispatch({ type: "SET_BACKGROUND", background: `url(${dataUrl}) center/cover no-repeat` });
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = "";
                                    }}
                                />
                            </label>
                            {background.startsWith("url(") && (
                                <button
                                    onClick={() => dispatch({ type: "SET_BACKGROUND", background: "linear-gradient(180deg, #fce7f3 0%, #fdf2f8 30%, #fff 100%)" })}
                                    style={{
                                        padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                                        border: "1px solid #fecaca", background: "#fff5f5", color: "#ef4444",
                                        cursor: "pointer",
                                    }}
                                >🗑️ Xoá</button>
                            )}
                        </div>

                        {/* Custom bg color picker */}
                        <div style={{ marginTop: 8, display: "flex", gap: 6, alignItems: "center" }}>
                            <input type="color" value={background.startsWith("#") ? background : "#ffffff"}
                                onChange={e => dispatch({ type: "SET_BACKGROUND", background: e.target.value })}
                                style={{ width: 32, height: 28, borderRadius: 6, border: "1px solid #e5e7eb", cursor: "pointer", padding: 1 }} />
                            <input type="text" value={background} placeholder="#ffffff"
                                onChange={e => dispatch({ type: "SET_BACKGROUND", background: e.target.value })}
                                style={{ flex: 1, padding: "6px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 11, fontFamily: "monospace", outline: "none" }} />
                        </div>
                    </AccordionSection>

                    <AccordionSection title="Hiệu ứng hạt" icon="✨" defaultOpen={false}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                            {([
                                { label: "🌸 Hoa", effect: "petals" as ParticleEffect },
                                { label: "💕 Tim", effect: "hearts" as ParticleEffect },
                                { label: "✨ Bokeh", effect: "bokeh" as ParticleEffect },
                                { label: "❄️ Tuyết", effect: "snow" as ParticleEffect },
                            ]).map(fx => (
                                <button key={fx.effect}
                                    onClick={() => dispatch({ type: "SET_PARTICLE_EFFECT", effect: fx.effect === particleEffect ? "none" : fx.effect })}
                                    style={{
                                        padding: "8px 6px", borderRadius: 8, fontSize: 12,
                                        border: `1.5px solid ${particleEffect === fx.effect ? "#ff6b9d" : "#e5e7eb"}`,
                                        background: particleEffect === fx.effect ? "#fdf2f8" : "#fafafa",
                                        cursor: "pointer", color: "#374151",
                                        fontWeight: particleEffect === fx.effect ? 700 : 400,
                                    }}>{fx.label}</button>
                            ))}
                        </div>
                        {particleEffect !== "none" && (
                            <button onClick={() => dispatch({ type: "SET_PARTICLE_EFFECT", effect: "none" })} style={{
                                marginTop: 6, width: "100%", padding: "5px 0", borderRadius: 6,
                                border: "1px solid #e5e7eb", background: "#f9fafb",
                                cursor: "pointer", fontSize: 11, color: "#9ca3af",
                            }}>🚫 Tắt hiệu ứng</button>
                        )}
                    </AccordionSection>
                </div>
            )}

            {/* ── Layers Panel (always visible) ── */}
            <AccordionSection title="Lớp phần tử" icon="📋" defaultOpen={false}>
                <div style={{ maxHeight: 300, overflowY: "auto" }}>
                    {[...allElements].sort((a, b) => (b.zIndex ?? 0) - (a.zIndex ?? 0)).map(layerEl => (
                        <button key={layerEl.id} onClick={() => onSelectElement(layerEl.id)} style={{
                            width: "100%", display: "flex", alignItems: "center", gap: 8,
                            padding: "6px 8px", marginBottom: 2, borderRadius: 7, cursor: "pointer",
                            border: selectedEl?.id === layerEl.id ? "1.5px solid #ff6b9d" : "1px solid #e5e7eb",
                            background: selectedEl?.id === layerEl.id ? "#fdf2f8" : "#fff",
                            transition: "all 0.1s", textAlign: "left",
                        }}>
                            <span style={{ fontSize: 12, width: 18, textAlign: "center" }}>
                                {layerEl.type === "text" ? "T" : layerEl.type === "image" ? "🖼" : "⚙"}
                            </span>
                            <span style={{ flex: 1, fontSize: 11, color: "#374151", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {layerEl.type === "text" ? (layerEl.props?.text ?? "Text").slice(0, 20) : layerEl.type === "image" ? "Ảnh" : layerEl.props?.widgetType ?? "Widget"}
                            </span>
                            <span style={{ fontSize: 9, color: "#9ca3af" }}>z{layerEl.zIndex}</span>
                            {layerEl.locked && <span style={{ fontSize: 10 }}>🔒</span>}
                        </button>
                    ))}
                </div>
            </AccordionSection>

            {/* Image panel */}
            {selectedEl?.type === "image" && (
                <ImagePanel el={selectedEl} dispatch={dispatch} onReplaceImage={onReplaceImage} />
            )}

            {/* Text panel */}
            {selectedEl?.type === "text" && (
                <TextPanel el={selectedEl} dispatch={dispatch} onShowFontPicker={onShowFontPicker} />
            )}

            {/* Widget panel */}
            {selectedEl?.type === "widget" && (() => {
                const wp = selectedEl.props;
                const updW = (changes: Record<string, unknown>) =>
                    dispatch({ type: "UPDATE_ELEMENT", id: selectedEl.id, changes: { props: { ...wp, ...changes } } });

                return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                        {/* Layer actions */}
                        <div style={{ padding: "10px 12px 4px" }}>
                            <LayerActions el={selectedEl} dispatch={dispatch} />
                        </div>
                        <div style={{ height: 1, background: "#f3f4f6" }} />

                        <AccordionSection title="Cài đặt Widget" icon="⚙️" defaultOpen={true}>
                            <Label>Nhãn</Label>
                            <input type="text" value={wp.label ?? ""} onChange={e => updW({ label: e.target.value })}
                                style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />

                            {(wp.widgetType === "calendar" || wp.widgetType === "countdown") && (
                                <>
                                    <Label>Ngày cưới</Label>
                                    <input type="date" value={wp.targetDate ?? ""} onChange={e => updW({ targetDate: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                </>
                            )}

                            {wp.widgetType === "calendar" && (
                                <>
                                    <Label>Ngày âm lịch</Label>
                                    <input type="text" placeholder="Ví dụ: Mùng 8 tháng 12 năm Ất Tỵ"
                                        value={wp.lunarDate ?? ""} onChange={e => updW({ lunarDate: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                </>
                            )}

                            {wp.widgetType === "map" && (
                                <>
                                    <Label>Tên địa điểm</Label>
                                    <input type="text" value={wp.venueName ?? ""} onChange={e => updW({ venueName: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Địa chỉ</Label>
                                    <input type="text" value={wp.venueAddress ?? ""} onChange={e => updW({ venueAddress: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Link Google Maps</Label>
                                    <input type="url" value={wp.mapUrl ?? ""} onChange={e => updW({ mapUrl: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                                </>
                            )}

                            {wp.widgetType === "rsvp" && (
                                <>
                                    <Label>Tiêu đề</Label>
                                    <input type="text" value={wp.rsvpTitle ?? ""} onChange={e => updW({ rsvpTitle: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Phụ đề</Label>
                                    <input type="text" value={wp.rsvpSubtitle ?? ""} onChange={e => updW({ rsvpSubtitle: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Nút gửi</Label>
                                    <input type="text" value={wp.rsvpButtonText ?? ""} onChange={e => updW({ rsvpButtonText: e.target.value })}
                                        placeholder="Gửi xác nhận 💌"
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 12, boxSizing: "border-box" }} />
                                    <Label>Trường thông tin</Label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 4 }}>
                                        {[
                                            { key: "rsvpShowPhone", label: "📱 Số điện thoại" },
                                            { key: "rsvpShowGuestCount", label: "👥 Số người tham dự" },
                                            { key: "rsvpShowDietary", label: "🍽️ Chế độ ăn" },
                                            { key: "rsvpShowMessage", label: "💬 Lời nhắn" },
                                        ].map(field => (
                                            <label key={field.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#374151", cursor: "pointer" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={!!(wp as Record<string, unknown>)[field.key]}
                                                    onChange={e => updW({ [field.key]: e.target.checked })}
                                                    style={{ accentColor: "#ff6b9d", cursor: "pointer" }}
                                                />
                                                {field.label}
                                            </label>
                                        ))}
                                    </div>
                                </>
                            )}

                            {(wp.widgetType === "gift" || wp.widgetType === "qr") && (
                                <>
                                    <Label>Ngân hàng</Label>
                                    <input type="text" value={wp.bankName ?? ""} onChange={e => updW({ bankName: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Số tài khoản</Label>
                                    <input type="text" value={wp.accountNumber ?? ""} onChange={e => updW({ accountNumber: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />
                                    <Label>Tên chủ TK</Label>
                                    <input type="text" value={wp.accountName ?? ""} onChange={e => updW({ accountName: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                                </>
                            )}

                            {wp.widgetType === "youtube" && (
                                <>
                                    <Label>Link YouTube</Label>
                                    <input type="url" placeholder="https://www.youtube.com/watch?v=..." value={wp.youtubeUrl ?? ""} onChange={e => updW({ youtubeUrl: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                                </>
                            )}
                            {wp.widgetType === "call" && (
                                <>
                                    <Label>Số điện thoại</Label>
                                    <input type="tel" placeholder="0909 xxx xxx" value={wp.phoneNumber ?? ""} onChange={e => updW({ phoneNumber: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 6 }} />
                                </>
                            )}
                            {wp.widgetType === "album" && (
                                <>
                                    <Label>Tiêu đề Album</Label>
                                    <input type="text" placeholder="Khoảnh Khắc Hạnh Phúc" value={wp.title ?? ""} onChange={e => updW({ title: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box" }} />

                                    <Label>Chế độ hiển thị</Label>
                                    <select value={wp.layout ?? "grid"} onChange={e => updW({ layout: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", marginBottom: 8, boxSizing: "border-box", background: "#fff" }}>
                                        <option value="grid">🖼️ Lưới ảnh cổ điển (Grid)</option>
                                        <option value="carousel">🎠 Storytelling Carousel (Vuốt ngang)</option>
                                        <option value="parallax_3d">✨ Thẻ nghiêng 3D Parallax</option>
                                    </select>

                                    <Label>Ảnh album (URL, phân tách bằng dấu phẩy)</Label>
                                    <textarea placeholder="https://link1.jpg, https://link2.jpg" value={wp.albumImages ?? ""} onChange={e => updW({ albumImages: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", minHeight: 60, resize: "vertical" }} />
                                </>
                            )}
                            {wp.widgetType === "guestname" && (
                                <>
                                    <Label>Dòng chữ kính mời</Label>
                                    <input type="text" placeholder="Trân trọng kính mời" value={wp.guestNameLabel ?? ""} onChange={e => updW({ guestNameLabel: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
                                </>
                            )}
                            {wp.widgetType === "waxseal" && (
                                <>
                                    <Label>Chữ lồng Monogram (hoặc tên viết tắt)</Label>
                                    <input type="text" placeholder="K & T" value={wp.monogram ?? ""} onChange={e => updW({ monogram: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                                    
                                    <Label>Màu sắc chất liệu sáp</Label>
                                    <select value={wp.waxColor ?? "crimson"} onChange={e => updW({ waxColor: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }}>
                                        <option value="crimson">🔴 Royal Crimson Wax (Đỏ huyết dụ)</option>
                                        <option value="gold">🟡 Champagne Gold Foil (Vàng đồng ánh kim)</option>
                                        <option value="bronze">🟤 Antique Bronze (Đồng cổ điển)</option>
                                        <option value="emerald">🟢 Emerald Velvet (Xanh ngọc bích)</option>
                                        <option value="pearl">⚪ Pearl Ivory (Trắng ngọc trai)</option>
                                        <option value="roseGold">🌸 Rose Gold (Hồng ánh kim)</option>
                                    </select>

                                    <Label>Biểu tượng dập nổi</Label>
                                    <select value={wp.waxIcon ?? "none"} onChange={e => updW({ waxIcon: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }}>
                                        <option value="none">Chữ viết tắt Monogram</option>
                                        <option value="heart">❤️ Trái tim tình yêu</option>
                                        <option value="rose">🌹 Hoa hồng quý phái</option>
                                        <option value="rings">💍 Nhẫn cưới uyên ương</option>
                                        <option value="olive">🌿 Nhánh ô liu hoà bình</option>
                                        <option value="crown">👑 Vương miện hoàng gia</option>
                                        <option value="floral">🌸 Hoa trang trí</option>
                                    </select>
                                </>
                            )}
                            {wp.widgetType === "envelope" && (
                                <>
                                    <Label>Tên Chú rể</Label>
                                    <input type="text" placeholder="Hoàng Nam" value={wp.groomName ?? ""} onChange={e => updW({ groomName: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                                    
                                    <Label>Tên Cô dâu</Label>
                                    <input type="text" placeholder="Mai Linh" value={wp.brideName ?? ""} onChange={e => updW({ brideName: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box", marginBottom: 8 }} />
                                    
                                    <Label>Màu con dấu sáp</Label>
                                    <select value={wp.waxColor ?? "gold"} onChange={e => updW({ waxColor: e.target.value })}
                                        style={{ width: "100%", padding: "7px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }}>
                                        <option value="gold">🟡 Champagne Gold Foil</option>
                                        <option value="crimson">🔴 Royal Crimson Wax</option>
                                        <option value="bronze">🟤 Antique Bronze</option>
                                        <option value="emerald">🟢 Emerald Velvet</option>
                                        <option value="pearl">⚪ Pearl Ivory</option>
                                        <option value="roseGold">🌸 Rose Gold</option>
                                    </select>
                                </>
                            )}
                        </AccordionSection>

                        {/* Cơ bản */}
                        <AccordionSection title="Cơ bản" icon="⚙️" defaultOpen={false}>
                            <Label>Trong suất</Label>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                                <input type="range" min={0} max={100} value={Math.round((selectedEl.opacity ?? 1) * 100)}
                                    onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: selectedEl.id, changes: { opacity: Number(e.target.value) / 100 } })}
                                    style={{ flex: 1 }} />
                                <input type="number" min={0} max={1} step={0.01} value={(selectedEl.opacity ?? 1).toFixed(2)}
                                    onChange={e => dispatch({ type: "UPDATE_ELEMENT", id: selectedEl.id, changes: { opacity: Math.max(0, Math.min(1, Number(e.target.value))) } })}
                                    style={{ width: 56, padding: "5px 6px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, textAlign: "right", outline: "none" }} />
                            </div>
                        </AccordionSection>
                    </div>
                );
            })()}

            {/* Font Picker Modal rendered as portal sibling */}
            {showFontPicker && selectedEl?.type === "text" && (() => {
                const fp = selectedEl.props;
                return (
                    <FontPickerModal
                        currentFont={fp.fontFamily ?? "'Dancing Script', cursive"}
                        onSelect={(fontName) => {
                            const found = SYSTEM_FONTS.find(f => f.name === fontName);
                            let fontFamily = `'${fontName}', serif`;
                            if (found?.category === "Script") fontFamily = `'${fontName}', cursive`;
                            else if (found?.category === "Sans-serif") fontFamily = `'${fontName}', sans-serif`;
                            dispatch({ type: "UPDATE_ELEMENT", id: selectedEl.id, changes: { props: { ...fp, fontFamily } } });
                            onCloseFontPicker();
                        }}
                        onClose={onCloseFontPicker}
                    />
                );
            })()}
        </div>
    );
}
