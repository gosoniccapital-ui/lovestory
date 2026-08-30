"use client";
import { useRef, useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import { useEditorContext } from "./useEditorState";
import { LayersPanel } from "./LayersPanel";
import { HistoryPanel } from "./HistoryPanel";
import { PremiumFeaturesPanel } from "./PremiumFeaturesPanel";
import { ProjectSettingsPanel } from "./ProjectSettingsPanel";
import type { TextProps, ImageProps, WidgetProps } from "./types";
import { ColorPicker } from "./ColorPicker";
import { VIETNAM_BANKS } from "./vietnam-banks";

/** Only allow safe URL schemes for image src */
function isValidImageUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return true; // empty is ok (clearing)
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:image/")
  );
}

/** Parse number safely — returns fallback if NaN */
function safeNumber(value: string, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const FONT_FAMILIES = [
  { label: "Dancing Script", value: "'Dancing Script', cursive" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
  { label: "Great Vibes", value: "'Great Vibes', cursive" },
  { label: "Inter", value: "'Inter', sans-serif" },
  { label: "Roboto", value: "'Roboto', sans-serif" },
  { label: "Montserrat", value: "'Montserrat', sans-serif" },
  { label: "Lora", value: "'Lora', serif" },
];

const ENTRANCE_ANIMATIONS = [
  { id: "none", label: "Không" },
  { id: "fadeIn", label: "Fade In" },
  { id: "slideUp", label: "Slide Up" },
  { id: "slideLeft", label: "Slide Left" },
  { id: "slideRight", label: "Slide Right" },
  { id: "scaleIn", label: "Scale In" },
  { id: "bounceIn", label: "Bounce In" },
  { id: "flipIn", label: "Flip In" },
];

const LOOP_ANIMATIONS = [
  { id: "none", label: "Không" },
  { id: "float", label: "Float (lên xuống)" },
  { id: "pulse", label: "Pulse (nhịp đập)" },
  { id: "shake", label: "Shake (rung)" },
  { id: "spin", label: "Spin (xoay)" },
  { id: "bounce", label: "Bounce (nảy)" },
];

interface CanvasRightPanelProps {
  projectCategory: string;
  setProjectCategory: (v: string) => void;
  projectStatus: string;
  setProjectStatus: (v: string) => void;
  removeWatermark: boolean;
  setRemoveWatermark: (v: boolean) => void;
  autoScroll: boolean;
  setAutoScroll: (v: boolean) => void;
  scrollSpeed: number;
  setScrollSpeed: (v: number) => void;
  qrBank: string;
  setQrBank: (v: string) => void;
  triggerAutosave: () => void;
}

export function CanvasRightPanel(props: CanvasRightPanelProps) {
  const { state, dispatch, selectedElement: el } = useEditorContext();
  // Preserve ref before the early-return guard so closures can see it
  const selectedEl = el ?? null;
  const params = useParams<{ id: string }>();
  const imageUploadRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  if (!el) {
    return (
      <div>
        <ProjectSettingsPanel
          category={props.projectCategory}
          setCategory={(v) => {
            props.setProjectCategory(v);
            props.triggerAutosave();
          }}
          status={props.projectStatus}
          setStatus={(v) => {
            props.setProjectStatus(v);
            props.triggerAutosave();
          }}
        />
        <PremiumFeaturesPanel
          removeWatermark={props.removeWatermark}
          setRemoveWatermark={(v) => {
            props.setRemoveWatermark(v);
            props.triggerAutosave();
          }}
          autoScroll={props.autoScroll}
          setAutoScroll={(v) => {
            props.setAutoScroll(v);
            props.triggerAutosave();
          }}
          scrollSpeed={props.scrollSpeed}
          setScrollSpeed={(v) => {
            props.setScrollSpeed(v);
            props.triggerAutosave();
          }}
          qrBank={props.qrBank}
          setQrBank={(v) => {
            props.setQrBank(v);
            props.triggerAutosave();
          }}
          selectedElementId={selectedEl?.id}
          selectedElementType={selectedEl?.type}
          onApplySuggestion={(suggestionText) => {
            if (selectedEl && selectedEl.type === "text") {
              dispatch({ type: "UPDATE_PROPS", id: selectedEl.id, props: { text: suggestionText } });
              props.triggerAutosave();
            }
          }}
        />
        <LayersPanel />
        <HistoryPanel />
      </div>
    );
  }

  const isText = el.type === "text";
  const isImage = el.type === "image" || el.type === "sticker";
  const isWidget = el.type === "widget";
  const textProps = isText ? (el.props as TextProps) : null;
  const imageProps = isImage ? (el.props as ImageProps) : null;
  const widgetProps = isWidget ? (el.props as WidgetProps) : null;
  const isQrBox = widgetProps?.widgetType === "qrbox";
  const isCountdown = widgetProps?.widgetType === "countdown";
  const isRsvp = widgetProps?.widgetType === "rsvp";
  const isMap = widgetProps?.widgetType === "map";
  const isCall = widgetProps?.widgetType === "callbutton";
  const isCalendar = widgetProps?.widgetType === "calendar";
  const isMusic = widgetProps?.widgetType === "music";
  const isAlbum = widgetProps?.widgetType === "album";

  const updateProp = (props: Record<string, unknown>) => {
    dispatch({ type: "UPDATE_PROPS", id: el.id, props });
  };

  const updateElement = (patch: Record<string, unknown>) => {
    dispatch({ type: "UPDATE_ELEMENT", id: el.id, patch });
  };

  const handleImageReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ALLOWED = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!ALLOWED.includes(file.type)) {
      alert("Chỉ hỗ trợ JPEG, PNG, GIF, WebP.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File quá lớn. Giới hạn 10MB.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", params.id);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        updateProp({ src: data.url });
        props.triggerAutosave();
      }
    } catch {
      alert("Upload thất bại. Vui lòng thử lại.");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Element tag */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            background: "#3b82f6",
            color: "#fff",
            fontSize: 10,
            padding: "3px 10px",
            borderRadius: 4,
            fontWeight: 600,
          }}
        >
          {el.type.charAt(0).toUpperCase() + el.type.slice(1)}
        </span>
        <span style={{ fontSize: 10, color: "#9ca3af" }}>
          ID: {el.id.slice(0, 8)}
        </span>
        <button
          onClick={() => {
            dispatch({ type: "SNAPSHOT" });
            dispatch({ type: "DELETE_ELEMENT", id: el.id });
          }}
          style={{
            marginLeft: "auto",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            color: "#dc2626",
            padding: "2px 6px",
          }}
          title="Xóa phần tử"
        >
          🗑️
        </button>
      </div>

      {/* ── Text Properties ── */}
      {isText && textProps && (
        <PanelSection title="Văn bản" icon="🔤">
          {/* Font Family */}
          <label style={labelStyle}>Font</label>
          <select
            value={textProps.fontFamily}
            onChange={(e) => updateProp({ fontFamily: e.target.value })}
            style={selectStyle}
          >
            {FONT_FAMILIES.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>

          {/* Font Size + Weight */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Cỡ chữ</label>
              <input
                type="number"
                value={textProps.fontSize}
                onChange={(e) =>
                  updateProp({
                    fontSize: safeNumber(e.target.value, textProps.fontSize),
                  })
                }
                min={8}
                max={200}
                step={1}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Đậm</label>
              <select
                value={textProps.fontWeight}
                onChange={(e) => updateProp({ fontWeight: e.target.value })}
                style={selectStyle}
              >
                <option value="normal">Thường</option>
                <option value="bold">Đậm</option>
                <option value="100">100</option>
                <option value="300">300</option>
                <option value="500">500</option>
                <option value="700">700</option>
                <option value="900">900</option>
              </select>
            </div>
          </div>

          {/* Font Style */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kiểu chữ</label>
              <select
                value={textProps.fontStyle}
                onChange={(e) => updateProp({ fontStyle: e.target.value })}
                style={selectStyle}
              >
                <option value="normal">Thường</option>
                <option value="italic">Nghiêng</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Căn chỉnh</label>
              <select
                value={textProps.textAlign}
                onChange={(e) => updateProp({ textAlign: e.target.value })}
                style={selectStyle}
              >
                <option value="left">Trái</option>
                <option value="center">Giữa</option>
                <option value="right">Phải</option>
                <option value="justify">Đều</option>
              </select>
            </div>
          </div>

          {/* Color */}
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>Màu chữ</label>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <ColorPicker
                value={textProps.color}
                onChange={(color) => updateProp({ color })}
              />
              <span
                style={{
                  fontSize: 11,
                  color: "#6b7280",
                  fontFamily: "monospace",
                }}
              >
                {textProps.color}
              </span>
            </div>
          </div>

          {/* Line Height + Letter Spacing */}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Chiều cao dòng</label>
              <input
                type="number"
                value={textProps.lineHeight}
                onChange={(e) =>
                  updateProp({
                    lineHeight: safeNumber(
                      e.target.value,
                      textProps.lineHeight,
                    ),
                  })
                }
                min={0.5}
                max={5}
                step={0.1}
                style={inputStyle}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Khoảng cách chữ</label>
              <input
                type="number"
                value={textProps.letterSpacing}
                onChange={(e) =>
                  updateProp({
                    letterSpacing: safeNumber(
                      e.target.value,
                      textProps.letterSpacing,
                    ),
                  })
                }
                min={-5}
                max={50}
                step={0.5}
                style={inputStyle}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Image Properties ── */}
      {isImage && imageProps && (
        <PanelSection title="Hình ảnh" icon="🖼️">
          {/* Upload button */}
          <input
            ref={imageUploadRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleImageReplace}
            style={{ display: "none" }}
          />
          <button
            onClick={() => imageUploadRef.current?.click()}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "10px 0",
              marginBottom: 10,
              border: "2px dashed #d1d5db",
              borderRadius: 8,
              background: uploading ? "#f3f4f6" : "#fafafa",
              color: uploading ? "#9ca3af" : "#6b7280",
              fontSize: 13,
              fontWeight: 600,
              cursor: uploading ? "wait" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {uploading ? "Đang tải lên..." : "Tải ảnh lên"}
          </button>

          <label style={labelStyle}>URL hình ảnh</label>
          <input
            type="text"
            value={imageProps.src}
            onChange={(e) => {
              const url = e.target.value;
              if (isValidImageUrl(url)) {
                updateProp({ src: url });
              }
            }}
            style={inputStyle}
            placeholder="https://..."
          />
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Kiểu hiển thị</label>
              <select
                value={imageProps.objectFit}
                onChange={(e) => updateProp({ objectFit: e.target.value })}
                style={selectStyle}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Bo góc</label>
              <input
                type="number"
                value={el.borderRadius}
                onChange={(e) =>
                  updateElement({
                    borderRadius: safeNumber(e.target.value, el.borderRadius),
                  })
                }
                min={0}
                max={999}
                step={1}
                style={inputStyle}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Position & Size ── */}
      <PanelSection title="Vị trí & Kích thước" icon="📐">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <div>
            <label style={labelStyle}>X (left)</label>
            <input
              type="number"
              value={Math.round(el.left)}
              onChange={(e) =>
                updateElement({ left: safeNumber(e.target.value, el.left) })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Y (top)</label>
            <input
              type="number"
              value={Math.round(el.top)}
              onChange={(e) =>
                updateElement({ top: safeNumber(e.target.value, el.top) })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Rộng</label>
            <input
              type="number"
              value={Math.round(el.width)}
              onChange={(e) =>
                updateElement({ width: safeNumber(e.target.value, el.width) })
              }
              min={10}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Cao</label>
            <input
              type={el.height === "auto" ? "text" : "number"}
              value={
                el.height === "auto" ? "auto" : Math.round(el.height as number)
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "auto") {
                  updateElement({ height: "auto" });
                } else {
                  const n = safeNumber(
                    v,
                    typeof el.height === "number" ? el.height : 100,
                  );
                  updateElement({ height: n });
                }
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Xoay (°)</label>
            <input
              type="number"
              value={Math.round(el.rotation)}
              onChange={(e) =>
                updateElement({
                  rotation: safeNumber(e.target.value, el.rotation),
                })
              }
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Lớp (z)</label>
            <input
              type="number"
              value={el.zIndex}
              onChange={(e) =>
                updateElement({ zIndex: safeNumber(e.target.value, el.zIndex) })
              }
              min={0}
              style={inputStyle}
            />
          </div>
        </div>
      </PanelSection>

      {/* ── Opacity ── */}
      <PanelSection title="Độ trong suốt" icon="💧">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={el.opacity}
            onChange={(e) => updateElement({ opacity: Number(e.target.value) })}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: 11, color: "#6b7280", minWidth: 35 }}>
            {Math.round(el.opacity * 100)}%
          </span>
        </div>
      </PanelSection>

      {/* ── Entrance Animation ── */}
      <PanelSection title="Hiệu ứng chuyển động" icon="🎬">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {ENTRANCE_ANIMATIONS.map((a) => {
            const isActive = (el.entrance?.type ?? "none") === a.id;
            return (
              <button
                key={a.id}
                onClick={() => {
                  dispatch({ type: "SNAPSHOT" });
                  updateElement({
                    entrance:
                      a.id === "none"
                        ? null
                        : { type: a.id, duration: 600, delay: 0 },
                  });
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: isActive ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                  background: isActive ? "#eff6ff" : "#fff",
                  cursor: "pointer",
                  fontSize: 11,
                  color: isActive ? "#1d4ed8" : "#374151",
                  textAlign: "left" as const,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </PanelSection>

      {/* ── Loop Animation ── */}
      <PanelSection title="Chuyển động liên tục" icon="🔄">
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {LOOP_ANIMATIONS.map((a) => {
            const isActive = (el.continuous?.type ?? "none") === a.id;
            return (
              <button
                key={a.id}
                onClick={() => {
                  dispatch({ type: "SNAPSHOT" });
                  updateElement({
                    continuous:
                      a.id === "none" ? null : { type: a.id, duration: 2000 },
                  });
                }}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: isActive ? "2px solid #ff6b9d" : "1px solid #e5e7eb",
                  background: isActive ? "#fdf2f8" : "#fff",
                  cursor: "pointer",
                  fontSize: 11,
                  color: isActive ? "#be185d" : "#374151",
                  textAlign: "left" as const,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {a.label}
              </button>
            );
          })}
        </div>
      </PanelSection>

      {/* ── Border ── */}
      <PanelSection title="Viền" icon="🔲">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <div>
            <label style={labelStyle}>Độ dày</label>
            <input
              type="number"
              value={el.border.width}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                updateElement({
                  border: {
                    ...el.border,
                    width: safeNumber(e.target.value, el.border.width),
                  },
                });
              }}
              min={0}
              max={20}
              step={1}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Kiểu</label>
            <select
              value={el.border.style}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                updateElement({
                  border: { ...el.border, style: e.target.value },
                });
              }}
              style={selectStyle}
            >
              <option value="solid">Nét liền</option>
              <option value="dashed">Nét đứt</option>
              <option value="dotted">Chấm</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={labelStyle}>Màu viền</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ColorPicker
              value={el.border.color}
              onChange={(color) => {
                dispatch({ type: "SNAPSHOT" });
                updateElement({
                  border: { ...el.border, color },
                });
              }}
            />
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              {el.border.color}
            </span>
          </div>
        </div>
      </PanelSection>

      {/* ── Shadow ── */}
      <PanelSection title="Đổ bóng" icon="🌑">
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <div>
            <label style={labelStyle}>X offset</label>
            <input
              type="number"
              value={el.shadow?.offsetX ?? 0}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                const s = el.shadow ?? {
                  offsetX: 0,
                  offsetY: 4,
                  blur: 8,
                  spread: 0,
                  color: "rgba(0,0,0,0.15)",
                };
                updateElement({
                  shadow: {
                    ...s,
                    offsetX: safeNumber(e.target.value, s.offsetX),
                  },
                });
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Y offset</label>
            <input
              type="number"
              value={el.shadow?.offsetY ?? 0}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                const s = el.shadow ?? {
                  offsetX: 0,
                  offsetY: 4,
                  blur: 8,
                  spread: 0,
                  color: "rgba(0,0,0,0.15)",
                };
                updateElement({
                  shadow: {
                    ...s,
                    offsetY: safeNumber(e.target.value, s.offsetY),
                  },
                });
              }}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Blur</label>
            <input
              type="number"
              value={el.shadow?.blur ?? 0}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                const s = el.shadow ?? {
                  offsetX: 0,
                  offsetY: 4,
                  blur: 8,
                  spread: 0,
                  color: "rgba(0,0,0,0.15)",
                };
                updateElement({
                  shadow: { ...s, blur: safeNumber(e.target.value, s.blur) },
                });
              }}
              min={0}
              step={1}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Spread</label>
            <input
              type="number"
              value={el.shadow?.spread ?? 0}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                const s = el.shadow ?? {
                  offsetX: 0,
                  offsetY: 4,
                  blur: 8,
                  spread: 0,
                  color: "rgba(0,0,0,0.15)",
                };
                updateElement({
                  shadow: {
                    ...s,
                    spread: safeNumber(e.target.value, s.spread),
                  },
                });
              }}
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ marginTop: 8 }}>
          <label style={labelStyle}>Màu bóng</label>
          <input
            type="text"
            value={el.shadow?.color ?? "rgba(0,0,0,0.15)"}
            onChange={(e) => {
              dispatch({ type: "SNAPSHOT" });
              const s = el.shadow ?? {
                offsetX: 0,
                offsetY: 4,
                blur: 8,
                spread: 0,
                color: "rgba(0,0,0,0.15)",
              };
              updateElement({ shadow: { ...s, color: e.target.value } });
            }}
            style={inputStyle}
            placeholder="rgba(0,0,0,0.15)"
          />
        </div>
        {el.shadow && (
          <button
            onClick={() => {
              dispatch({ type: "SNAPSHOT" });
              updateElement({ shadow: null });
            }}
            style={{
              marginTop: 8,
              padding: "4px 10px",
              fontSize: 11,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              background: "#fff",
              cursor: "pointer",
              color: "#6b7280",
            }}
          >
            Xóa bóng
          </button>
        )}
      </PanelSection>

      {/* ── Background Color (text only) ── */}
      {isText && textProps && (
        <PanelSection title="Nền văn bản" icon="🎨">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <ColorPicker
              value={textProps.backgroundColor || "#ffffff"}
              onChange={(color) => updateProp({ backgroundColor: color })}
              showOpacity
            />
            <span
              style={{
                fontSize: 11,
                color: "#6b7280",
                fontFamily: "monospace",
              }}
            >
              {textProps.backgroundColor || "transparent"}
            </span>
          </div>
          {textProps.backgroundColor && (
            <button
              onClick={() => updateProp({ backgroundColor: "" })}
              style={{
                marginTop: 6,
                padding: "4px 10px",
                fontSize: 11,
                border: "1px solid #e5e7eb",
                borderRadius: 6,
                background: "#fff",
                cursor: "pointer",
                color: "#6b7280",
              }}
            >
              Xóa nền
            </button>
          )}
        </PanelSection>
      )}

      {/* ── QR Box Config ── */}
      {isQrBox && widgetProps && (
        <PanelSection title="QR Chuyển khoản" icon="📱">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Ngân hàng</label>
              <select
                value={String(widgetProps.config.bankBin ?? "")}
                onChange={(e) => {
                  const bank = VIETNAM_BANKS.find(
                    (b) => b.bin === e.target.value,
                  );
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        bankBin: e.target.value,
                        bankName: bank?.name ?? "",
                      },
                    },
                  });
                }}
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  background: "#fff",
                }}
              >
                <option value="">-- Chọn ngân hàng --</option>
                {VIETNAM_BANKS.map((b) => (
                  <option key={b.bin} value={b.bin}>
                    {b.name} ({b.shortName})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Số tài khoản</label>
              <input
                type="text"
                value={String(widgetProps.config.accountNumber ?? "")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        accountNumber: e.target.value,
                      },
                    },
                  });
                }}
                placeholder="VD: 1234567890"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Tên tài khoản</label>
              <input
                type="text"
                value={String(widgetProps.config.accountName ?? "")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        accountName: e.target.value,
                      },
                    },
                  });
                }}
                placeholder="NGUYEN VAN A"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Số tiền (tùy chọn)</label>
              <input
                type="text"
                value={String(widgetProps.config.amount ?? "")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        amount: e.target.value,
                      },
                    },
                  });
                }}
                placeholder="500000"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
            <div>
              <label style={labelStyle}>Nội dung chuyển khoản</label>
              <input
                type="text"
                value={String(widgetProps.config.note ?? "")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        note: e.target.value,
                      },
                    },
                  });
                }}
                placeholder="Mung cuoi"
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 6,
                  border: "1px solid #e5e7eb",
                  fontSize: 12,
                  boxSizing: "border-box" as const,
                }}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Countdown Config ── */}
      {isCountdown && widgetProps && (
        <PanelSection title="Cài đặt đếm ngược" icon="⏱️">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Ngày cưới</label>
              <input
                type="date"
                value={String(widgetProps.config.targetDate ?? "")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, targetDate: e.target.value } } });
                  props.triggerAutosave();
                }}
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Tiêu đề</label>
              <input
                type="text"
                value={String(widgetProps.config.label ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, label: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="ĐẾM NGƯỢC NGÀY CƯỚI"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phong cách</label>
              <select
                value={String(widgetProps.config.style ?? "pink")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, style: e.target.value } } });
                  props.triggerAutosave();
                }}
                style={selectStyle}
              >
                <option value="pink">Hồng lãng mạn</option>
                <option value="gold">Vàng sang trọng</option>
                <option value="dark">Tối huyền bí</option>
                <option value="minimal">Tối giản trắng</option>
              </select>
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Calendar Config ── */}
      {isCalendar && widgetProps && (
        <PanelSection title="Cài đặt lịch" icon="📅">
          <div>
            <label style={labelStyle}>Ngày cưới</label>
            <input
              type="date"
              value={String(widgetProps.config.targetDate ?? "")}
              onChange={(e) => {
                dispatch({ type: "SNAPSHOT" });
                dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, targetDate: e.target.value } } });
                props.triggerAutosave();
              }}
              style={inputStyle}
            />
          </div>
          <div style={{ marginTop: 8 }}>
            <label style={labelStyle}>Ngày âm lịch (tùy chọn)</label>
            <input
              type="text"
              value={String(widgetProps.config.lunarDate ?? "")}
              onChange={(e) => {
                dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, lunarDate: e.target.value } } });
                props.triggerAutosave();
              }}
              placeholder="VD: Ngày 15 tháng 4 âm lịch"
              style={inputStyle}
            />
          </div>
        </PanelSection>
      )}

      {/* ── RSVP Config ── */}
      {isRsvp && widgetProps && (
        <PanelSection title="Cài đặt RSVP" icon="💌">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Tiêu đề</label>
              <input
                type="text"
                value={String(widgetProps.config.rsvpTitle ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, rsvpTitle: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Xác nhận tham dự"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Mô tả</label>
              <input
                type="text"
                value={String(widgetProps.config.rsvpSubtitle ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, rsvpSubtitle: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Vui lòng xác nhận sự hiện diện"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Text nút gửi</label>
              <input
                type="text"
                value={String(widgetProps.config.rsvpButtonText ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, rsvpButtonText: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Gửi xác nhận 💌"
                style={inputStyle}
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={labelStyle}>Trường tùy chọn</label>
              {[
                { key: "rsvpShowPhone", label: "📞 Số điện thoại" },
                { key: "rsvpShowGuestCount", label: "👥 Số người" },
                { key: "rsvpShowDietary", label: "🍽️ Chế độ ăn" },
                { key: "rsvpShowMessage", label: "✍️ Lời nhắn" },
              ].map(({ key, label: fieldLabel }) => (
                <label key={key} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 11, color: "#374151" }}>
                  <input
                    type="checkbox"
                    checked={!!widgetProps.config[key as keyof typeof widgetProps.config]}
                    onChange={(e) => {
                      dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, [key]: e.target.checked } } });
                      props.triggerAutosave();
                    }}
                  />
                  {fieldLabel}
                </label>
              ))}
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Map Config ── */}
      {isMap && widgetProps && (
        <PanelSection title="Cài đặt bản đồ" icon="📍">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Tên địa điểm</label>
              <input
                type="text"
                value={String(widgetProps.config.venueName ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, venueName: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Nhà Hàng Tiệc Cưới"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Địa chỉ</label>
              <input
                type="text"
                value={String(widgetProps.config.venueAddress ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, venueAddress: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="123 Đường ABC, Quận 1, TP.HCM"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Link Google Maps</label>
              <input
                type="url"
                value={String(widgetProps.config.mapUrl ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, mapUrl: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="https://maps.google.com/..."
                style={inputStyle}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Call Button Config ── */}
      {isCall && widgetProps && (
        <PanelSection title="Nút liên hệ" icon="📞">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Tiêu đề</label>
              <input
                type="text"
                value={String(widgetProps.config.label ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, label: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Liên hệ cô/chú rể"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Số điện thoại</label>
              <input
                type="tel"
                value={String(widgetProps.config.phoneNumber ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, phoneNumber: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="0909 xxx xxx"
                style={inputStyle}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Music Config ── */}
      {isMusic && widgetProps && (
        <PanelSection title="Cài đặt nhạc vinyl" icon="🎵">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Tên bài hát</label>
              <input
                type="text"
                value={String(widgetProps.config.musicTitle ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, musicTitle: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Bài hát tặng em"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Ca sĩ / Nhạc sĩ</label>
              <input
                type="text"
                value={String(widgetProps.config.musicArtist ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, musicArtist: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Mỹ Tâm, Đen Vâu..."
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Thể loại</label>
              <select
                value={String(widgetProps.config.musicGenre ?? "wedding")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, musicGenre: e.target.value } } });
                  props.triggerAutosave();
                }}
                style={selectStyle}
              >
                <option value="wedding">💍 Wedding</option>
                <option value="vpop">🎤 V-POP</option>
                <option value="international">🌍 International</option>
                <option value="lofi">☕ Lo-Fi</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Link YouTube (tùy chọn)</label>
              <input
                type="url"
                value={String(widgetProps.config.youtubeUrl ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, youtubeUrl: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="https://youtube.com/watch?v=..."
                style={inputStyle}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── Album Config (Grid, Carousel, 3D Parallax) ── */}
      {isAlbum && widgetProps && (
        <PanelSection title="Cài đặt Album ảnh cưới" icon="📸">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <label style={labelStyle}>Tiêu đề Album</label>
              <input
                type="text"
                value={String(widgetProps.config.title ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, title: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Khoảnh Khắc Hạnh Phúc"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phụ đề / Câu chuyện</label>
              <input
                type="text"
                value={String(widgetProps.config.subtitle ?? "")}
                onChange={(e) => {
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, subtitle: e.target.value } } });
                  props.triggerAutosave();
                }}
                placeholder="Câu chuyện tình yêu của chúng mình"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Chế độ hiển thị</label>
              <select
                value={String(widgetProps.config.layout ?? "grid")}
                onChange={(e) => {
                  dispatch({ type: "SNAPSHOT" });
                  dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, layout: e.target.value } } });
                  props.triggerAutosave();
                }}
                style={selectStyle}
              >
                <option value="grid">🖼️ Lưới ảnh cổ điển (Grid)</option>
                <option value="carousel">🎠 Storytelling Carousel (Vuốt ngang)</option>
                <option value="parallax_3d">✨ Thẻ nghiêng 3D Parallax</option>
              </select>
            </div>
            {widgetProps.config.layout !== "carousel" && (
              <div>
                <label style={labelStyle}>Số cột</label>
                <select
                  value={String(widgetProps.config.columns ?? 2)}
                  onChange={(e) => {
                    dispatch({ type: "UPDATE_PROPS", id: el.id, props: { config: { ...widgetProps.config, columns: Number(e.target.value) } } });
                    props.triggerAutosave();
                  }}
                  style={selectStyle}
                >
                  <option value="1">1 cột (Ảnh to)</option>
                  <option value="2">2 cột (Tiêu chuẩn)</option>
                  <option value="3">3 cột (Masonry gọn)</option>
                </select>
              </div>
            )}
            <div>
              <label style={labelStyle}>Danh sách link ảnh (phân cách bằng dấu phẩy)</label>
              <textarea
                value={
                  Array.isArray(widgetProps.config.photos)
                    ? (widgetProps.config.photos as unknown[])
                        .map((p) => (typeof p === "string" ? p : (p as { url?: string })?.url || ""))
                        .join(", ")
                    : String(widgetProps.config.albumImages ?? "")
                }
                onChange={(e) => {
                  const urls = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                  dispatch({
                    type: "UPDATE_PROPS",
                    id: el.id,
                    props: {
                      config: {
                        ...widgetProps.config,
                        photos: urls,
                        albumImages: e.target.value,
                      },
                    },
                  });
                  props.triggerAutosave();
                }}
                placeholder="https://link-anh-1.jpg, https://link-anh-2.jpg"
                style={{
                  ...inputStyle,
                  minHeight: 70,
                  resize: "vertical" as const,
                }}
              />
            </div>
          </div>
        </PanelSection>
      )}

      {/* ── AI Text Suggestions (text elements only) ── */}
      {isText && (
        <AiSuggestSection
          elementId={el.id}
          onApply={(text) => {
            updateProp({ text });
            props.triggerAutosave();
          }}
        />
      )}

      {/* ── Lock ── */}
      <PanelSection title="Khóa" icon="🔒">
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            fontSize: 12,
            color: "#374151",
          }}
        >
          <input
            type="checkbox"
            checked={el.locked}
            onChange={(e) => updateElement({ locked: e.target.checked })}
          />
          Khóa vị trí (không cho kéo)
        </label>
      </PanelSection>
    </div>
  );
}

/** AI Text Suggestion section (renders inside text element panel) */
function AiSuggestSection({
  elementId,
  onApply,
}: {
  elementId: string;
  onApply: (text: string) => void;
}) {
  const [suggestType, setSuggestType] = useState<"invitation" | "vow" | "description">("invitation");
  const [groomName, setGroomName] = useState("");
  const [brideName, setBrideName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedIdx, setAppliedIdx] = useState<number | null>(null);

  // Reset when element changes
  useEffect(() => {
    setSuggestions([]);
    setError(null);
  }, [elementId]);

  async function generate() {
    if (!groomName.trim() || !brideName.trim()) {
      setError("Nhập tên cô dâu & chú rể.");
      return;
    }
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setAppliedIdx(null);
    try {
      const res = await fetch("/api/ai/text-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: suggestType, groomName: groomName.trim(), brideName: brideName.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Lỗi. Thử lại."); return; }
      setSuggestions(data.suggestions || []);
    } catch { setError("Không kết nối được."); }
    finally { setLoading(false); }
  }

  return (
    <PanelSection title="Gợi ý AI" icon="✨">
      {/* Type select */}
      <label style={labelStyle}>Loại nội dung</label>
      <select
        value={suggestType}
        onChange={(e) => { setSuggestType(e.target.value as "invitation" | "vow" | "description"); setSuggestions([]); }}
        style={selectStyle}
      >
        <option value="invitation">💌 Lời mời</option>
        <option value="vow">💍 Lời thề</option>
        <option value="description">📖 Mô tả</option>
      </select>

      {/* Names */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 8 }}>
        <div>
          <label style={labelStyle}>Chú rể</label>
          <input type="text" value={groomName} onChange={(e) => setGroomName(e.target.value)}
            placeholder="Minh" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
        <div>
          <label style={labelStyle}>Cô dâu</label>
          <input type="text" value={brideName} onChange={(e) => setBrideName(e.target.value)}
            placeholder="Lan" style={{ ...inputStyle, width: "100%", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={generate} disabled={loading}
        style={{
          width: "100%", marginTop: 10, padding: "8px 0",
          borderRadius: 8, border: "none",
          background: loading ? "#f3f4f6" : "linear-gradient(135deg, #ff6b9d, #c084fc)",
          color: loading ? "#9ca3af" : "#fff",
          fontSize: 12, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "🤖 Đang tạo..." : "🪄 Tạo gợi ý"}
      </button>

      {error && <p style={{ fontSize: 11, color: "#ef4444", margin: "6px 0 0" }}>⚠️ {error}</p>}

      {/* Suggestion cards */}
      {suggestions.map((s, i) => (
        <div key={i} style={{
          marginTop: 8, background: "#fafafa", border: "1px solid #e5e7eb",
          borderRadius: 8, padding: "8px 10px",
        }}>
          <p style={{ fontSize: 11, color: "#374151", margin: "0 0 6px", lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{s}</p>
          <button
            onClick={() => { onApply(s); setAppliedIdx(i); setTimeout(() => setAppliedIdx(null), 2000); }}
            style={{
              padding: "3px 10px", borderRadius: 6, border: "none",
              background: appliedIdx === i ? "#10b981" : "linear-gradient(135deg, #ff6b9d, #c084fc)",
              color: "#fff", fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}
          >
            {appliedIdx === i ? "✓ Đã dùng" : "Dùng"}
          </button>
        </div>
      ))}
    </PanelSection>
  );
}

/** Collapsible panel section */
function PanelSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{ borderTop: "1px solid #f0f0f0", paddingTop: 10, marginTop: 10 }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          width: "100%",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 11,
          fontWeight: 600,
          color: "#374151",
          padding: 0,
          marginBottom: open ? 8 : 0,
        }}
      >
        <span>{icon}</span>
        <span>{title}</span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: "#9ca3af" }}>
          {open ? "▼" : "▶"}
        </span>
      </button>
      {open && children}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 600,
  color: "#6b7280",
  display: "block",
  marginBottom: 4,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  fontSize: 12,
  boxSizing: "border-box",
  background: "#fff",
};

const selectStyle: React.CSSProperties = {
  width: "100%",
  padding: "6px 8px",
  borderRadius: 6,
  border: "1px solid #e5e7eb",
  fontSize: 12,
  boxSizing: "border-box",
  background: "#fff",
};
