"use client";

import React, { useState } from "react";
import { panelLabelStyle } from "../editor-constants";
import type {
  EditorAction,
  CanvasElement,
  WidgetProps,
} from "../canvas-engine/types";
import { useSubscription } from "@/contexts/SubscriptionContext";
import UpgradeCTA from "@/components/UpgradeCTA";
import type { PlanFeatures, PlanId } from "@/config/plans";

interface PluginsTabProps {
  triggerAutosave: () => void;
  editorDispatch?: React.Dispatch<EditorAction>;
}

interface WidgetDef {
  label: string;
  desc: string;
  widgetType: WidgetProps["widgetType"];
  requiredFeature?: keyof PlanFeatures;
  requiredPlan?: PlanId;
}

const WIDGETS: WidgetDef[] = [
  {
    label: "⏱️ Đếm ngược",
    desc: "Live countdown đến ngày cưới",
    widgetType: "countdown",
  },
  {
    label: "📅 Lịch cưới",
    desc: "Lịch tháng đánh dấu ngày cưới",
    widgetType: "calendar",
  },
  {
    label: "📍 Bản đồ",
    desc: "Google Maps + nút chỉ đường",
    widgetType: "map",
  },
  { label: "💌 RSVP", desc: "Form xác nhận tham dự", widgetType: "rsvp" },
  {
    label: "📞 Nút gọi",
    desc: "Gọi điện / Zalo / SMS",
    widgetType: "callbutton",
  },
  {
    label: "📸 Album ảnh",
    desc: "Gallery ảnh cưới",
    widgetType: "album",
    requiredFeature: "albumWidget",
    requiredPlan: "basic",
  },
  {
    label: "🎥 Video YouTube",
    desc: "Nhúng video cưới",
    widgetType: "youtube",
    requiredFeature: "youtubeEmbed",
    requiredPlan: "basic",
  },
  {
    label: "🎁 QR Box",
    desc: "Mừng cưới qua QR ngân hàng",
    widgetType: "qrbox",
  },
  {
    label: "👤 Tên khách mời",
    desc: "Tự động điền tên khi chia sẻ",
    widgetType: "guestname",
  },
  {
    label: "📋 Form tuỳ chỉnh",
    desc: "Tạo form thông tin khách mời",
    widgetType: "formbuilder",
    requiredFeature: "customForms",
    requiredPlan: "premium",
  },
  {
    label: "💌 Phong bì thư",
    desc: "Hiệu ứng mở phong bì",
    widgetType: "envelope",
  },
  {
    label: "⚜️ Con dấu sáp 3D",
    desc: "Dấu sáp dập nổi Monogram tên dâu rể",
    widgetType: "waxseal",
  },
  {
    label: "🎵 nhạc vinyl",
    desc: "Vĩ đĩa quay + nhạc cười (V-POP, Wedding...)",
    widgetType: "music",
  },
];

export function PluginsTab({
  triggerAutosave,
  editorDispatch,
}: PluginsTabProps) {
  const { hasFeature } = useSubscription();
  const [lockedWidget, setLockedWidget] = useState<WidgetDef | null>(null);

  function addWidget(widgetType: WidgetProps["widgetType"]) {
    if (!editorDispatch) return;
    const element: CanvasElement = {
       
      id: `widget-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "widget",
      top: 100,
      left: 50,
      width: 300,
      height: 200,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      zIndex: 1,
      locked: false,
      visible: true,
      opacity: 1,
      borderRadius: 12,
      border: { width: 0, color: "transparent", style: "solid" },
      shadow: null,
      entrance: null,
      continuous: null,
      props: { widgetType, config: {} },
    };
    editorDispatch({ type: "SNAPSHOT" });
    editorDispatch({ type: "ADD_ELEMENT", element });
    triggerAutosave();
  }

  function handleWidgetClick(widget: WidgetDef) {
    if (widget.requiredFeature && !hasFeature(widget.requiredFeature)) {
      setLockedWidget(widget);
      return;
    }
    addWidget(widget.widgetType);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={panelLabelStyle}>Thêm tiện ích</p>

      {lockedWidget && lockedWidget.requiredPlan && (
        <div style={{ marginBottom: 4 }}>
          <UpgradeCTA
            feature={lockedWidget.label}
            requiredPlan={lockedWidget.requiredPlan}
            compact
          />
          <button
            onClick={() => setLockedWidget(null)}
            style={{
              marginTop: 4,
              fontSize: 11,
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            Ẩn
          </button>
        </div>
      )}

      {WIDGETS.map((widget) => {
        const isLocked =
          !!widget.requiredFeature && !hasFeature(widget.requiredFeature);

        return (
          <button
            key={widget.label}
            onClick={() => handleWidgetClick(widget)}
            style={{
              position: "relative",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              background: "#fff",
              cursor: "pointer",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              transition: "all 0.15s",
              opacity: isLocked ? 0.5 : 1,
            }}
          >
            {isLocked && (
              <span
                style={{
                  position: "absolute",
                  top: 8,
                  right: 10,
                  fontSize: 14,
                }}
                aria-hidden="true"
              >
                🔒
              </span>
            )}
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#374151",
              }}
            >
              {widget.label}
            </span>
            <span style={{ fontSize: 11, color: "#9ca3af" }}>
              {widget.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
