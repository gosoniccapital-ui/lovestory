"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, Sparkles } from "lucide-react";

export interface FontDefinition {
  name: string;
  label: string;
  category: "Calligraphy VIP" | "Script" | "Serif" | "Sans-serif" | "Display" | "Tiếng Việt";
  isTop10?: boolean;
  sample?: string;
}

// 10 Top Tier Calligraphy Google Fonts for Wedding Invitations + Complete Curated Library
export const SYSTEM_FONTS: FontDefinition[] = [
  // ── 10 FONT THƯ PHÁP & SANG TRỌNG ĐỈNH CAO (CineLove Parity Top 10) ──
  {
    name: "Great Vibes",
    label: "Great Vibes (Uốn lượn quý phái)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Hoàng Nam & Mai Linh",
  },
  {
    name: "Dancing Script",
    label: "Dancing Script (Thư pháp bay bổng)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Trân trọng kính mời",
  },
  {
    name: "Alex Brush",
    label: "Alex Brush (Mềm mại thanh lịch)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Save Our Date 2026",
  },
  {
    name: "Pinyon Script",
    label: "Pinyon Script (Quý tộc Hoàng gia)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Together Forever",
  },
  {
    name: "Allura",
    label: "Allura (Mảnh mai lãng mạn)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Ngày Chung Đôi",
  },
  {
    name: "Parisienne",
    label: "Parisienne (Cổ điển Paris)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Lễ Thành Hôn",
  },
  {
    name: "Petit Formal Script",
    label: "Petit Formal Script (Trang trọng)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "Vu Quy & Tân Hôn",
  },
  {
    name: "Cormorant Garamond",
    label: "Cormorant Garamond (Serif Haute Couture)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "WEDDING INVITATION",
  },
  {
    name: "Playfair Display",
    label: "Playfair Display (Vương giả hiện đại)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "THIỆP MỜI BÁO HỶ",
  },
  {
    name: "Cinzel Decorative",
    label: "Cinzel Decorative (Hoàng gia La Mã)",
    category: "Calligraphy VIP",
    isTop10: true,
    sample: "ROYAL WEDDING",
  },

  // ── Script — viết tay nghệ thuật ──
  { name: "Pacifico", label: "Pacifico", category: "Script" },
  { name: "Sacramento", label: "Sacramento", category: "Script" },
  { name: "Satisfy", label: "Satisfy", category: "Script" },
  { name: "Rouge Script", label: "Rouge Script", category: "Script" },
  { name: "Tangerine", label: "Tangerine", category: "Script" },
  { name: "Mr De Haviland", label: "Mr De Haviland", category: "Script" },
  { name: "Marck Script", label: "Marck Script", category: "Script" },
  { name: "Charm", label: "Charm", category: "Script" },
  { name: "Italianno", label: "Italianno", category: "Script" },
  { name: "Lovers Quarrel", label: "Lovers Quarrel", category: "Script" },
  { name: "Carattere", label: "Carattere", category: "Script" },

  // ── Serif — cổ điển, thanh lịch ──
  { name: "EB Garamond", label: "EB Garamond", category: "Serif" },
  { name: "Lora", label: "Lora", category: "Serif" },
  { name: "Libre Baskerville", label: "Libre Baskerville", category: "Serif" },
  { name: "Merriweather", label: "Merriweather", category: "Serif" },
  { name: "Georgia", label: "Georgia", category: "Serif" },
  { name: "Philosopher", label: "Philosopher", category: "Serif" },
  { name: "Crimson Text", label: "Crimson Text", category: "Serif" },
  { name: "Cormorant Infant", label: "Cormorant Infant", category: "Serif" },

  // ── Sans-serif — hiện đại, tối giản ──
  { name: "Inter", label: "Inter", category: "Sans-serif" },
  { name: "Be Vietnam Pro", label: "Be Vietnam Pro", category: "Sans-serif" },
  { name: "Poppins", label: "Poppins", category: "Sans-serif" },
  { name: "Montserrat", label: "Montserrat", category: "Sans-serif" },
  { name: "Raleway", label: "Raleway", category: "Sans-serif" },
  { name: "Nunito", label: "Nunito", category: "Sans-serif" },
  { name: "Roboto", label: "Roboto", category: "Sans-serif" },
  { name: "Josefin Sans", label: "Josefin Sans", category: "Sans-serif" },
  { name: "Quicksand", label: "Quicksand", category: "Sans-serif" },

  // ── Display — nổi bật, trang trí ──
  { name: "Cinzel", label: "Cinzel", category: "Display" },
  { name: "Uncial Antiqua", label: "Uncial Antiqua", category: "Display" },
  { name: "Abril Fatface", label: "Abril Fatface", category: "Display" },
  { name: "Lobster", label: "Lobster", category: "Display" },
  { name: "Cormorant Unicase", label: "Cormorant Unicase", category: "Display" },
  { name: "Playfair Display SC", label: "Playfair Display SC", category: "Display" },
  { name: "Bodoni Moda", label: "Bodoni Moda", category: "Display" },
  { name: "Tenor Sans", label: "Tenor Sans", category: "Display" },
  { name: "Antic Didone", label: "Antic Didone", category: "Display" },

  // ── Tiếng Việt — tối ưu dấu ──
  { name: "Spectral", label: "Spectral", category: "Tiếng Việt" },
  { name: "Vollkorn", label: "Vollkorn", category: "Tiếng Việt" },
  { name: "Source Serif 4", label: "Source Serif 4", category: "Tiếng Việt" },
  { name: "Noto Serif", label: "Noto Serif", category: "Tiếng Việt" },
];

const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=" +
  SYSTEM_FONTS.map((f) => encodeURIComponent(f.name).replace(/%20/g, "+")).join(
    "&family=",
  ) +
  "&display=swap";

interface FontPickerModalProps {
  currentFont: string;
  onSelect: (font: string) => void;
  onClose: () => void;
}

export function FontPickerModal({
  currentFont,
  onSelect,
  onClose,
}: FontPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("top10");
  const [previewText, setPreviewText] = useState("Hoàng Nam & Mai Linh");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!document.getElementById("gf-font-picker-link")) {
      const link = document.createElement("link");
      link.id = "gf-font-picker-link";
      link.rel = "stylesheet";
      link.href = FONT_IMPORT_URL;
      document.head.appendChild(link);
    }
    setTimeout(() => searchRef.current?.focus(), 100);
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return SYSTEM_FONTS.filter((f) => {
      const matchSearch =
        f.name.toLowerCase().includes(q) ||
        f.label.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      const matchCat =
        selectedCategory === "all"
          ? true
          : selectedCategory === "top10"
          ? !!f.isTop10
          : f.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 99998,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal Container */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 99999,
          width: "90%",
          maxWidth: 520,
          maxHeight: "85vh",
          background: "#fff",
          borderRadius: 20,
          boxShadow: "0 25px 80px rgba(0,0,0,0.3)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid #f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "linear-gradient(180deg, #fff 0%, #fafafa 100%)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "linear-gradient(135deg, #f59e0b, #d97706)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#111827",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Bảng Chọn Phông Chữ Cưới
              </h3>
              <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
                10 Font thư pháp & serif quý tộc phong cách CineLove
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: 6,
              borderRadius: 8,
              transition: "background 0.15s",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Live Preview Text Input */}
        <div
          style={{
            padding: "12px 20px",
            background: "#fffbeb",
            borderBottom: "1px solid #fef3c7",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: "#92400e",
              marginBottom: 4,
            }}
          >
            ✍️ Văn bản xem trước trực tiếp:
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Nhập tên cô dâu & chú rể để xem mẫu..."
            style={{
              width: "100%",
              padding: "8px 12px",
              border: "1px solid #fde68a",
              borderRadius: 8,
              fontSize: 13,
              background: "#fff",
              color: "#78350f",
              fontWeight: 600,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: "flex",
            gap: 6,
            padding: "10px 20px 4px",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {[
            { id: "top10", label: "✨ Top 10 Thư Pháp VIP" },
            { id: "all", label: "Tất cả" },
            { id: "Script", label: "Script Viết tay" },
            { id: "Serif", label: "Serif Cổ điển" },
            { id: "Display", label: "Display Sang trọng" },
            { id: "Sans-serif", label: "Hiện đại" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: "6px 12px",
                borderRadius: 20,
                border: "none",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
                background:
                  selectedCategory === cat.id
                    ? "linear-gradient(135deg, #d97706, #b45309)"
                    : "#f3f4f6",
                color: selectedCategory === cat.id ? "#fff" : "#4b5563",
                boxShadow:
                  selectedCategory === cat.id
                    ? "0 2px 8px rgba(217, 119, 6, 0.3)"
                    : "none",
                transition: "all 0.15s",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ padding: "8px 20px" }}>
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Tìm theo tên font..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px 8px 32px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
                color: "#374151",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Font List */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "4px 16px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          {filtered.map((font) => {
            const isSelected = currentFont === font.name;
            return (
              <button
                key={font.name}
                onClick={() => {
                  onSelect(font.name);
                  onClose();
                }}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  border: isSelected ? "2px solid #d97706" : "1px solid #f3f4f6",
                  borderRadius: 12,
                  cursor: "pointer",
                  background: isSelected
                    ? "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)"
                    : "#fff",
                  textAlign: "left",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(217, 119, 6, 0.15)"
                    : "0 1px 3px rgba(0,0,0,0.02)",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: isSelected ? "#92400e" : "#6b7280",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {font.label}
                  </span>
                  {font.isTop10 && (
                    <span
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        padding: "2px 8px",
                        borderRadius: 99,
                        background: "linear-gradient(135deg, #fef3c7, #fde68a)",
                        color: "#92400e",
                        border: "1px solid #fcd34d",
                      }}
                    >
                      ★ CineLove VIP
                    </span>
                  )}
                </div>

                {/* Live Font Render */}
                <div
                  style={{
                    fontSize: 26,
                    fontFamily: `'${font.name}', serif`,
                    color: isSelected ? "#78350f" : "#111827",
                    lineHeight: 1.3,
                    padding: "4px 0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {previewText || font.sample || "Hoàng Nam & Mai Linh"}
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "32px 0",
                color: "#9ca3af",
                fontSize: 13,
              }}
            >
              Không tìm thấy font nào phù hợp
            </div>
          )}
        </div>
      </div>
    </>
  );
}

