"use client";

import { useRef, useCallback, useState } from "react";
import type { CanvasElement } from "./useCanvasReducer";

interface SelectionBoxProps {
    element: CanvasElement;
    zoom: number;
    canvasWidth?: number;
    onMove: (id: string, x: number, y: number) => void;
    onResize: (id: string, x: number, y: number, w: number, h: number) => void;
    onDelete: (id: string) => void;
    onDuplicate: (id: string) => void;
    onBringForward: (id: string) => void;
    onSendBackward: (id: string) => void;
    onDoubleClick?: () => void;
}

const HANDLES = [
    { id: "nw", cursor: "nw-resize", top: -6, left: -6 },
    { id: "n", cursor: "n-resize", top: -6, left: "50%", xOff: -6 },
    { id: "ne", cursor: "ne-resize", top: -6, right: -6 },
    { id: "e", cursor: "e-resize", top: "50%", right: -6, yOff: -6 },
    { id: "se", cursor: "se-resize", bottom: -6, right: -6 },
    { id: "s", cursor: "s-resize", bottom: -6, left: "50%", xOff: -6 },
    { id: "sw", cursor: "sw-resize", bottom: -6, left: -6 },
    { id: "w", cursor: "w-resize", top: "50%", left: -6, yOff: -6 },
];

export function SelectionBox({
    element, zoom, canvasWidth = 390, onMove, onResize, onDelete, onDuplicate, onBringForward, onSendBackward, onDoubleClick
}: SelectionBoxProps) {

    const scale = zoom / 100;
    const isDragging = useRef(false);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, elX: 0, elY: 0 });
    const resizeRef = useRef({ handle: "", startX: 0, startY: 0, origX: 0, origY: 0, origW: 0, origH: 0 });
    const [isSnappedCenter, setIsSnappedCenter] = useState(false);

    const handleMovePointerDown = useCallback((e: React.PointerEvent) => {
        if ((e.target as HTMLElement).dataset.handle) return;
        e.stopPropagation();
        isDragging.current = true;
        dragStart.current = {
            mouseX: e.clientX, mouseY: e.clientY,
            elX: element.x, elY: element.y,
        };
        const onMove_ = (ev: PointerEvent) => {
            if (!isDragging.current) return;
            const dx = (ev.clientX - dragStart.current.mouseX) / scale;
            const dy = (ev.clientY - dragStart.current.mouseY) / scale;
            let newX = Math.max(0, dragStart.current.elX + dx);
            const newY = Math.max(0, dragStart.current.elY + dy);

            // Magnetic snap to canvas center (195px for 390px canvas)
            const elCenter = newX + element.width / 2;
            const targetCenter = canvasWidth / 2;
            if (Math.abs(elCenter - targetCenter) < 6) {
                newX = targetCenter - element.width / 2;
                setIsSnappedCenter(true);
            } else {
                setIsSnappedCenter(false);
            }

            onMove(element.id, newX, newY);
        };
        const onUp = () => {
            isDragging.current = false;
            setIsSnappedCenter(false);
            window.removeEventListener("pointermove", onMove_);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove_);
        window.addEventListener("pointerup", onUp);
    }, [element.id, element.x, element.y, element.width, canvasWidth, onMove, scale]);

    const handleResizePointerDown = useCallback((e: React.PointerEvent, handleId: string) => {
        e.stopPropagation();
        e.preventDefault();
        resizeRef.current = {
            handle: handleId,
            startX: e.clientX, startY: e.clientY,
            origX: element.x, origY: element.y,
            origW: element.width, origH: element.height,
        };
        const onMove_ = (ev: PointerEvent) => {
            const { handle, startX, startY, origX, origY, origW, origH } = resizeRef.current;
            const dx = (ev.clientX - startX) / scale;
            const dy = (ev.clientY - startY) / scale;
            let x = origX, y = origY, w = origW, h = origH;
            if (handle.includes("e")) w = Math.max(40, origW + dx);
            if (handle.includes("s")) h = Math.max(20, origH + dy);
            if (handle.includes("w")) { w = Math.max(40, origW - dx); x = origX + origW - w; }
            if (handle.includes("n")) { h = Math.max(20, origH - dy); y = origY + origH - h; }
            onResize(element.id, x, y, w, h);
        };
        const onUp = () => {
            window.removeEventListener("pointermove", onMove_);
            window.removeEventListener("pointerup", onUp);
        };
        window.addEventListener("pointermove", onMove_);
        window.addEventListener("pointerup", onUp);
    }, [element, onResize, scale]);

    return (
        <div
            onPointerDown={handleMovePointerDown}
            onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
            style={{
                position: "absolute",
                left: element.x * scale,
                top: element.y * scale,
                width: element.width * scale,
                height: element.height * scale,
                border: isSnappedCenter ? "2px solid #ec4899" : "2px solid #3b82f6",
                cursor: "move",
                zIndex: element.zIndex * 10 + 999,
                userSelect: "none",
                touchAction: "none",
            }}
        >
            {/* Snap Guideline Indicator */}
            {isSnappedCenter && (
                <div
                    style={{
                        position: "absolute",
                        top: -999,
                        bottom: -999,
                        left: "50%",
                        width: 1,
                        background: "#ec4899",
                        pointerEvents: "none",
                        zIndex: 99999,
                    }}
                />
            )}

            {/* Resize handles with expanded touch hitboxes for mobile */}
            {HANDLES.map(h => (
                <div
                    key={h.id}
                    data-handle={h.id}
                    onPointerDown={(e) => handleResizePointerDown(e, h.id)}
                    style={{
                        position: "absolute",
                        width: 12, height: 12,
                        background: "#fff",
                        border: "2px solid #3b82f6",
                        borderRadius: 3,
                        cursor: h.cursor,
                        top: h.top !== undefined ? h.top : undefined,
                        bottom: (h as Record<string, unknown>).bottom !== undefined ? (h as Record<string, unknown>).bottom as number : undefined,
                        left: h.left !== undefined ? h.left : undefined,
                        right: (h as Record<string, unknown>).right !== undefined ? (h as Record<string, unknown>).right as number : undefined,
                        transform: `translate(${(h as Record<string, unknown>).xOff ? (h as Record<string, unknown>).xOff : 0}px, ${(h as Record<string, unknown>).yOff ? (h as Record<string, unknown>).yOff : 0}px)`,
                        zIndex: 9999,
                        touchAction: "none",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
                    }}
                >
                    {/* Mobile Touch Invisible Expander (32x32px hit area) */}
                    <div
                        data-handle={h.id}
                        style={{
                            position: "absolute",
                            top: -10,
                            left: -10,
                            width: 32,
                            height: 32,
                            pointerEvents: "auto",
                        }}
                    />
                </div>
            ))}

            {/* Floating toolbar */}
            <div style={{
                position: "absolute",
                top: -42,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(31, 41, 55, 0.95)",
                backdropFilter: "blur(4px)",
                borderRadius: 10,
                padding: "4px 8px",
                display: "flex",
                gap: 4,
                whiteSpace: "nowrap",
                boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                border: "1px solid rgba(255,255,255,0.1)",
                zIndex: 9999,
            }}>
                {[
                    { label: "⬆", title: "Lên trước", onClick: () => onBringForward(element.id) },
                    { label: "⬇", title: "Xuống sau", onClick: () => onSendBackward(element.id) },
                    { label: "⧉", title: "Nhân đôi", onClick: () => onDuplicate(element.id) },
                    { label: "✕", title: "Xóa", onClick: () => onDelete(element.id) },
                ].map(btn => (
                    <button
                        key={btn.label}
                        title={btn.title}
                        onPointerDown={(e) => { e.stopPropagation(); btn.onClick(); }}
                        style={{
                            width: 28, height: 28,
                            background: btn.label === "✕" ? "#ef4444" : "rgba(255,255,255,0.12)",
                            border: "none", borderRadius: 6,
                            color: "#fff", fontSize: 12,
                            cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "background 0.1s",
                        }}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>
        </div>
    );
}

