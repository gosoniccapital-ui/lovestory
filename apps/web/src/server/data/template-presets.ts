/**
 * Per-template unique element presets for ALL 75 Cinelove templates.
 * Sprint 63: 6 STRUCTURALLY UNIQUE layouts (not just color variations)
 * Each family has different element positions, section orders, photo layouts, and decorative patterns
 */

export type TemplateTier = "basic" | "premium";

export type TemplateElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  zIndex: number;
  locked: boolean;
  animation: { entrance: string; loop: string };
  props: Record<string, unknown>;
};

/** Helper: text element */
function txt(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  text: string,
  o: {
    size?: number;
    font?: string;
    color?: string;
    weight?: string;
    italic?: boolean;
    align?: "left" | "center" | "right";
    opacity?: number;
    zIndex?: number;
    entrance?: string;
    lineHeight?: number;
    rotation?: number;
    locked?: boolean;
  } = {},
): TemplateElement {
  return {
    id,
    type: "text",
    x,
    y,
    width: w,
    height: h,
    rotation: o.rotation ?? 0,
    opacity: o.opacity ?? 1,
    zIndex: o.zIndex ?? 5,
    locked: o.locked ?? false,
    animation: { entrance: o.entrance ?? "fadeIn", loop: "none" },
    props: {
      text,
      fontSize: o.size ?? 14,
      fontFamily: o.font ?? "'Playfair Display', serif",
      fontWeight: o.weight ?? "normal",
      fontStyle: o.italic ? "italic" : "normal",
      color: o.color ?? "#831843",
      textAlign: o.align ?? "center",
      lineHeight: o.lineHeight ?? 1.4,
    },
  };
}

/** Helper: image placeholder element */
function img(
  id: string,
  x: number,
  y: number,
  w: number,
  h: number,
  o: {
    radius?: number;
    borderColor?: string;
    borderWidth?: number;
    rotation?: number;
    zIndex?: number;
    src?: string;
    locked?: boolean;
    opacity?: number;
  } = {},
): TemplateElement {
  const PLACEHOLDERS: Record<string, string> = {
    "img-main": "/placeholder-couple.png",
    "img-groom": "/placeholder-groom.png",
    "img-bride": "/placeholder-bride.png",
    "img-couple2": "/placeholder-couple.png",
    "img-gallery1": "/placeholder-couple.png",
    "img-gallery2": "/placeholder-groom.png",
    "img-gallery3": "/placeholder-bride.png",
    "img-gallery4": "/placeholder-couple.png",
  };
  return {
    id,
    type: "image",
    x,
    y,
    width: w,
    height: h,
    rotation: o.rotation ?? 0,
    opacity: o.opacity ?? 1,
    zIndex: o.zIndex ?? 1,
    locked: o.locked ?? false,
    animation: { entrance: "fadeIn", loop: "none" },
    props: {
      src: o.src ?? PLACEHOLDERS[id] ?? "/placeholder-couple.png",
      objectFit: "cover",
      borderRadius: o.radius ?? 8,
      borderWidth: o.borderWidth ?? 2,
      borderColor: o.borderColor ?? "#f9a8d4",
      opacity: o.opacity ?? 1,
    },
  };
}

/** Helper: widget element (countdown, calendar, rsvp, map, qrbox, etc.) */
function wgt(
  id: string,
  type: string,
  x: number,
  y: number,
  w: number,
  h: number,
  props: Record<string, unknown>,
  zIndex = 5,
): TemplateElement {
  return {
    id,
    type,
    x,
    y,
    width: w,
    height: h,
    rotation: 0,
    opacity: 1,
    zIndex,
    locked: false,
    animation: { entrance: "fadeIn", loop: "none" },
    props,
  };
}
// LAYOUT A: ROMANTIC — Full-bleed hero, centered names, side-by-side portraits
// Section flow: Hero → Deco → Invite/Names → Family columns → Portraits row → Date block → Events → Gallery grid → Quote → Venue
// ═══════════════════════════════════════════
function makeRomanticPreset(
  accent: string,
  text: string,
  deco: string,
  font: string,
  decoText: string,
): TemplateElement[] {
  return [
    // ── Hero photo — full-width, large, premium feel ──
    img("img-main", 0, 0, 390, 480, {
      radius: 0,
      borderColor: "transparent",
      borderWidth: 0,
    }),

    // ── Decorative divider ──
    txt("txt-deco1", 20, 500, 350, 28, decoText, {
      size: 14,
      font: "'Georgia', serif",
      color: deco,
      opacity: 0.4,
      zIndex: 4,
      locked: true,
    }),

    // ── Ceremony label ──
    txt("txt-ceremony", 20, 540, 350, 36, "Lễ Thành Hôn", {
      size: 20,
      font: "'Cormorant Garamond', serif",
      color: deco,
      italic: true,
      zIndex: 2,
    }),

    // ── Invitation text ──
    txt("txt-invite", 20, 590, 350, 36, "Trân trọng kính mời", {
      size: 16,
      font,
      color: text,
      italic: true,
    }),

    // ── Names — CineLove uses VERY large script ──
    txt("txt-names", 10, 640, 370, 150, "Tên Chú Rể\nand\nTên Cô Dâu", {
      size: 48,
      font: "'Dancing Script', cursive",
      weight: "bold",
      italic: true,
      color: text,
      lineHeight: 1.0,
    }),

    // ── Decorative divider 2 ──
    txt("txt-deco2", 20, 810, 350, 24, "─────── ✿ ───────", {
      size: 11,
      font: "'Georgia', serif",
      color: deco,
      opacity: 0.3,
      locked: true,
    }),

    // ── Family text ──
    txt(
      "txt-family",
      20,
      850,
      350,
      70,
      "Cùng gia đình hai bên\ntrân trọng kính mời quý khách\ntới dự buổi lễ Vũ Quy",
      {
        size: 15,
        font: "'Lora', serif",
        color: text,
        italic: true,
        opacity: 0.9,
        lineHeight: 1.6,
      },
    ),

    // ── Nhà Trai / Nhà Gái ──
    txt("txt-nhatrai-label", 20, 950, 170, 32, "NHÀ TRAI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-nhatrai",
      20,
      985,
      170,
      80,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Lora', serif",
        color: text,
        opacity: 0.85,
        lineHeight: 1.9,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 950, 170, 32, "NHÀ GÁI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-nhagai",
      200,
      985,
      170,
      80,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Lora', serif",
        color: text,
        opacity: 0.85,
        lineHeight: 1.9,
        align: "left",
      },
    ),

    // ── Decorative divider 3 ──
    txt(
      "txt-deco3",
      20,
      1090,
      350,
      24,
      "· · · · · · · · · · · · · · · · · · · · · · · · · ·",
      {
        size: 10,
        font: "'Georgia', serif",
        color: deco,
        opacity: 0.25,
        locked: true,
      },
    ),

    // ── Groom/Bride individual photos ──
    img("img-groom", 40, 1130, 140, 190, {
      radius: 16,
      borderColor: deco,
      rotation: -3,
      zIndex: 2,
    }),
    img("img-bride", 210, 1130, 140, 190, {
      radius: 16,
      borderColor: deco,
      rotation: 3,
      zIndex: 3,
    }),
    txt("name-groom", 40, 1330, 140, 32, "Chú Rể", {
      size: 18,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: text,
    }),
    txt("name-bride", 210, 1330, 140, 32, "Cô Dâu", {
      size: 18,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: text,
    }),

    // ── Styled Date Block — CineLove-style centered date ──
    txt(
      "txt-date",
      20,
      1400,
      350,
      40,
      "THÁNG 05                              NĂM 2026",
      {
        size: 16,
        font: "'Cormorant Garamond', serif",
        weight: "bold",
        color: text,
        lineHeight: 1.4,
      },
    ),
    txt("txt-date-day", 135, 1440, 120, 80, "28", {
      size: 64,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: accent,
    }),
    txt("txt-time", 20, 1530, 350, 30, "Lúc 10:00 sáng · Thứ Bảy", {
      size: 15,
      font: "'Lora', serif",
      color: text,
      italic: true,
      opacity: 0.8,
    }),

    // ── Decorative divider 4 ──
    txt("txt-deco4", 20, 1510, 350, 24, decoText, {
      size: 12,
      font: "'Georgia', serif",
      color: deco,
      opacity: 0.3,
      locked: true,
    }),

    // ── Events ──
    txt("txt-event1-label", 20, 1555, 170, 28, "LỄ VŨ QUY", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-event1",
      20,
      1585,
      170,
      60,
      "08:00 Sáng\nTư gia Nhà Gái\nĐịa chỉ Nhà Gái",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: text,
        opacity: 0.8,
        lineHeight: 1.7,
        align: "left",
      },
    ),
    txt("txt-event2-label", 200, 1555, 170, 28, "TIỆC CƯỚI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-event2",
      200,
      1585,
      170,
      60,
      "17:00 Chiều\nNhà Hàng ABC\nĐịa chỉ Nhà Hàng",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: text,
        opacity: 0.8,
        lineHeight: 1.7,
        align: "left",
      },
    ),

    // ── Gallery — spacious ──
    img("img-couple2", 30, 1680, 330, 220, {
      radius: 12,
      borderColor: accent,
      borderWidth: 1,
    }),
    img("img-gallery1", 30, 1920, 160, 150, { radius: 10, borderColor: deco }),
    img("img-gallery2", 200, 1920, 160, 150, { radius: 10, borderColor: deco }),
    img("img-gallery3", 30, 2085, 160, 150, { radius: 10, borderColor: deco }),
    img("img-gallery4", 200, 2085, 160, 150, { radius: 10, borderColor: deco }),

    // ── Quote ──
    txt(
      "txt-quote",
      30,
      2270,
      330,
      80,
      "Yeu la hanh phuc khi duoc o ben nhau,\nla niem vui moi ngay.",
      {
        size: 16,
        font: "'Lora', serif",
        color: text,
        italic: true,
        opacity: 0.9,
        lineHeight: 1.6,
      },
    ),

    // ── Venue ──
    txt(
      "txt-venue",
      20,
      2380,
      350,
      70,
      "Nhà Hàng ABC\nĐịa chỉ nhà hàng tiệc cưới\nQuận, Thành phố",
      {
        size: 14,
        font: "'Inter', sans-serif",
        color: text,
        opacity: 0.9,
        lineHeight: 1.6,
      },
    ),

    // ── Bottom ornament ──
    txt("txt-deco5", 20, 2470, 350, 28, decoText, {
      size: 14,
      font: "'Georgia', serif",
      color: deco,
      opacity: 0.3,
      locked: true,
    }),
  ];
}

// ═══════════════════════════════════════════
// LAYOUT B: LUXURY — Dark bg, gold accents, large centered names on top, hero below
// Section flow: Big Names → Invitation → Hero photo → Date/Time centered → Family → Single large couple photo → Events stacked → Quote → Venue
// ═══════════════════════════════════════════
function makeLuxuryPreset(
  gold: string,
  light: string,
  midDeco: string,
): TemplateElement[] {
  return [
    txt("txt-ceremony", 20, 30, 350, 36, "WEDDING INVITATION", {
      size: 14,
      font: "'Cormorant Garamond', serif",
      color: gold,
      weight: "bold",
      zIndex: 2,
    }),
    txt("txt-names", 10, 80, 370, 120, "Tên Chú Rể\n&\nTên Cô Dâu", {
      size: 42,
      font: "'Playfair Display', serif",
      weight: "bold",
      italic: true,
      color: light,
      lineHeight: 1.1,
    }),
    txt("txt-deco1", 20, 210, 350, 28, midDeco, {
      size: 13,
      font: "'Georgia', serif",
      color: gold,
      opacity: 0.5,
      locked: true,
    }),
    txt("txt-invite", 20, 250, 350, 32, "TRÂN TRỌNG KÍNH MỜI", {
      size: 13,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: gold,
    }),
    txt(
      "txt-family",
      20,
      290,
      350,
      50,
      "Cùng gia đình hai bên\ntrân trọng kính mời quý khách",
      {
        size: 14,
        font: "'Lora', serif",
        color: light,
        italic: true,
        opacity: 0.85,
      },
    ),
    img("img-main", 40, 360, 310, 350, {
      radius: 8,
      borderColor: gold,
      borderWidth: 2,
    }),
    txt("txt-date", 20, 730, 350, 60, "Chủ Nhật, 28 · 05 · 2026", {
      size: 30,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: light,
    }),
    txt("txt-time", 20, 795, 350, 30, "Lúc 10:00 sáng", {
      size: 16,
      font: "'Lora', serif",
      color: gold,
      italic: true,
      opacity: 0.85,
    }),
    txt("txt-nhatrai-label", 20, 850, 170, 28, "NHÀ TRAI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: gold,
    }),
    txt(
      "txt-nhatrai",
      20,
      880,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Lora', serif",
        color: light,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 850, 170, 28, "NHÀ GÁI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: gold,
    }),
    txt(
      "txt-nhagai",
      200,
      880,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Lora', serif",
        color: light,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    img("img-groom", 40, 970, 140, 180, {
      radius: 6,
      borderColor: gold,
      zIndex: 2,
    }),
    img("img-bride", 210, 970, 140, 180, {
      radius: 6,
      borderColor: gold,
      zIndex: 3,
    }),
    txt("name-groom", 40, 1160, 140, 32, "Chú Rể", {
      size: 16,
      font: "'Playfair Display', serif",
      weight: "bold",
      italic: true,
      color: light,
    }),
    txt("name-bride", 210, 1160, 140, 32, "Cô Dâu", {
      size: 16,
      font: "'Playfair Display', serif",
      weight: "bold",
      italic: true,
      color: light,
    }),
    txt("txt-event1-label", 20, 1220, 350, 24, "LỄ VŨ QUY", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: gold,
    }),
    txt(
      "txt-event1",
      20,
      1245,
      350,
      40,
      "08:00 Sáng · Tư gia Nhà Gái · Địa chỉ Nhà Gái",
      { size: 11, font: "'Inter', sans-serif", color: light, opacity: 0.8 },
    ),
    txt("txt-event2-label", 20, 1295, 350, 24, "TIỆC CƯỚI", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: gold,
    }),
    txt(
      "txt-event2",
      20,
      1320,
      350,
      40,
      "17:00 Chiều · Nhà Hàng ABC · Địa chỉ Nhà Hàng",
      { size: 11, font: "'Inter', sans-serif", color: light, opacity: 0.8 },
    ),
    img("img-couple2", 20, 1380, 350, 250, {
      radius: 8,
      borderColor: gold,
      borderWidth: 1,
    }),
    img("img-gallery1", 20, 1650, 110, 120, { radius: 6, borderColor: gold }),
    img("img-gallery2", 140, 1650, 110, 120, { radius: 6, borderColor: gold }),
    img("img-gallery3", 260, 1650, 110, 120, { radius: 6, borderColor: gold }),
    img("img-gallery4", 80, 1780, 230, 150, { radius: 6, borderColor: gold }),
    txt(
      "txt-quote",
      30,
      1960,
      330,
      70,
      "Every love story is beautiful,\nbut ours is my favorite.",
      {
        size: 16,
        font: "'Playfair Display', serif",
        color: light,
        italic: true,
        opacity: 0.9,
      },
    ),
    txt(
      "txt-venue",
      20,
      2050,
      350,
      60,
      "Nhà Hàng\nĐịa chỉ nhà hàng tiệc cưới\nQuận, Thành phố",
      { size: 14, font: "'Inter', sans-serif", color: light, opacity: 0.85 },
    ),
  ];
}

// ═══════════════════════════════════════════
// LAYOUT C: CLASSIC — Elegant symmetry, hero + names interleaved, full-width gallery
// Section flow: Ceremony label → Names → Deco → Invite text → Hero → Date circle → Family → Portraits stacked → Events → Wide gallery → Quote → Venue
// ═══════════════════════════════════════════
function makeClassicPreset(
  heading: string,
  body: string,
  deco: string,
): TemplateElement[] {
  return [
    txt("txt-ceremony", 20, 20, 350, 40, "Lễ Vũ Quy", {
      size: 22,
      font: "'Cormorant Garamond', serif",
      color: heading,
      italic: true,
    }),
    txt("txt-names", 10, 70, 370, 120, "Tên Chú Rể\n&\nTên Cô Dâu", {
      size: 48,
      font: "'Playfair Display', serif",
      weight: "bold",
      color: heading,
      lineHeight: 1.1,
    }),
    txt("txt-deco1", 20, 175, 350, 24, "─── ♥ ───", {
      size: 12,
      font: "'Georgia', serif",
      color: deco,
      opacity: 0.4,
      locked: true,
    }),
    txt("txt-invite", 20, 210, 350, 32, "Trân trọng kính mời", {
      size: 16,
      font: "'Cormorant Garamond', serif",
      color: body,
      italic: true,
    }),
    txt(
      "txt-family",
      20,
      250,
      350,
      50,
      "Cùng gia đình hai bên\ntrân trọng kính mời quý khách",
      {
        size: 14,
        font: "'Lora', serif",
        color: body,
        italic: true,
        opacity: 0.85,
      },
    ),
    img("img-main", 50, 320, 290, 340, {
      radius: 4,
      borderColor: deco,
      borderWidth: 1,
    }),
    txt("txt-date", 20, 680, 350, 60, "Chủ Nhật, 28 · 05 · 2026", {
      size: 26,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: heading,
    }),
    txt("txt-time", 20, 745, 350, 30, "Lúc 10:00 sáng", {
      size: 16,
      font: "'Lora', serif",
      color: body,
      italic: true,
      opacity: 0.8,
    }),
    txt("txt-nhatrai-label", 20, 800, 170, 28, "NHÀ TRAI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: heading,
    }),
    txt(
      "txt-nhatrai",
      20,
      830,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Lora', serif",
        color: body,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 800, 170, 28, "NHÀ GÁI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: heading,
    }),
    txt(
      "txt-nhagai",
      200,
      830,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Lora', serif",
        color: body,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    img("img-groom", 80, 920, 230, 160, {
      radius: 4,
      borderColor: deco,
      borderWidth: 1,
      zIndex: 2,
    }),
    img("img-bride", 80, 1090, 230, 160, {
      radius: 4,
      borderColor: deco,
      borderWidth: 1,
      zIndex: 3,
    }),
    txt("name-groom", 80, 1260, 230, 32, "Chú Rể", {
      size: 16,
      font: "'Playfair Display', serif",
      weight: "bold",
      color: heading,
    }),
    txt("name-bride", 80, 1090, 230, 32, "Cô Dâu", {
      size: 16,
      font: "'Playfair Display', serif",
      weight: "bold",
      color: heading,
      opacity: 0,
    }),
    txt("txt-event1-label", 20, 1310, 170, 24, "LỄ VŨ QUY", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: heading,
    }),
    txt(
      "txt-event1",
      20,
      1335,
      170,
      50,
      "08:00 Sáng\nTư gia Nhà Gái\nĐịa chỉ Nhà Gái",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: body,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    txt("txt-event2-label", 200, 1310, 170, 24, "TIỆC CƯỚI", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: heading,
    }),
    txt(
      "txt-event2",
      200,
      1335,
      170,
      50,
      "17:00 Chiều\nNhà Hàng ABC\nĐịa chỉ Nhà Hàng",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: body,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    img("img-couple2", 20, 1410, 350, 200, {
      radius: 4,
      borderColor: deco,
      borderWidth: 1,
    }),
    img("img-gallery1", 20, 1630, 170, 140, { radius: 4, borderColor: deco }),
    img("img-gallery2", 200, 1630, 170, 140, { radius: 4, borderColor: deco }),
    img("img-gallery3", 20, 1780, 170, 140, { radius: 4, borderColor: deco }),
    img("img-gallery4", 200, 1780, 170, 140, { radius: 4, borderColor: deco }),
    txt(
      "txt-quote",
      30,
      1940,
      330,
      50,
      "Yêu là hạnh phúc khi được ở bên nhau.",
      {
        size: 15,
        font: "'Lora', serif",
        color: body,
        italic: true,
        opacity: 0.85,
      },
    ),
    txt(
      "txt-venue",
      20,
      2010,
      350,
      60,
      "Nhà Hàng\nĐịa chỉ nhà hàng tiệc cưới\nQuận, Thành phố",
      { size: 14, font: "'Inter', sans-serif", color: body, opacity: 0.85 },
    ),
  ];
}

// ═══════════════════════════════════════════
// LAYOUT D: TRADITIONAL — Red/gold, xi/double happiness, hero-first with large date
// Section flow: Hero fullwidth → Xi decoration → Bold Names → Large Date block → Family columns → Portraits with tilted frames → Events → Gallery mosaic → Quote → Venue
// ═══════════════════════════════════════════
function makeTraditionalPreset(
  red: string,
  dark: string,
  gold: string,
): TemplateElement[] {
  return [
    img("img-main", 20, 15, 350, 360, {
      radius: 12,
      borderColor: gold,
      borderWidth: 3,
    }),
    txt("txt-deco1", 20, 390, 350, 30, "═══════  囍  ═══════", {
      size: 14,
      font: "'Georgia', serif",
      color: red,
      opacity: 0.75,
      locked: true,
      weight: "bold",
    }),
    txt("txt-ceremony", 20, 425, 350, 36, "Lễ Thành Hôn", {
      size: 22,
      font: "'Dancing Script', cursive",
      color: red,
      weight: "bold",
    }),
    txt("txt-invite", 20, 465, 350, 32, "Trân Trọng Kính Mời", {
      size: 17,
      font: "'Playfair Display', serif",
      weight: "bold",
      color: red,
    }),
    txt("txt-names", 10, 505, 370, 100, "Tên Chú Rể\n&\nTên Cô Dâu", {
      size: 38,
      font: "'Dancing Script', cursive",
      weight: "bold",
      italic: true,
      color: dark,
      lineHeight: 1.15,
    }),
    txt("txt-date", 60, 620, 270, 80, "28\nTHÁNG 05 · 2026", {
      size: 48,
      font: "'Playfair Display', serif",
      weight: "bold",
      color: dark,
      lineHeight: 0.9,
    }),
    txt("txt-time", 20, 710, 350, 30, "Lúc 10:00 sáng", {
      size: 16,
      font: "'Lora', serif",
      color: red,
      italic: true,
      opacity: 0.85,
    }),
    txt(
      "txt-family",
      20,
      755,
      350,
      50,
      "Cùng gia đình hai bên\ntrân trọng kính mời quý khách",
      {
        size: 14,
        font: "'Lora', serif",
        color: dark,
        italic: true,
        opacity: 0.9,
      },
    ),
    txt("txt-nhatrai-label", 20, 825, 170, 28, "NHÀ TRAI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: red,
    }),
    txt(
      "txt-nhatrai",
      20,
      855,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Lora', serif",
        color: dark,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 825, 170, 28, "NHÀ GÁI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: red,
    }),
    txt(
      "txt-nhagai",
      200,
      855,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Lora', serif",
        color: dark,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    img("img-groom", 40, 945, 140, 180, {
      radius: 10,
      borderColor: gold,
      rotation: -2,
      zIndex: 2,
    }),
    img("img-bride", 210, 945, 140, 180, {
      radius: 10,
      borderColor: gold,
      rotation: 2,
      zIndex: 3,
    }),
    txt("name-groom", 40, 1135, 140, 32, "Chú Rể", {
      size: 16,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: dark,
    }),
    txt("name-bride", 210, 1135, 140, 32, "Cô Dâu", {
      size: 16,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: dark,
    }),
    txt("txt-event1-label", 20, 1190, 170, 24, "LỄ VŨ QUY", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: red,
    }),
    txt(
      "txt-event1",
      20,
      1215,
      170,
      50,
      "08:00 Sáng\nTư gia Nhà Gái\nĐịa chỉ Nhà Gái",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: dark,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    txt("txt-event2-label", 200, 1190, 170, 24, "TIỆC CƯỚI", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: red,
    }),
    txt(
      "txt-event2",
      200,
      1215,
      170,
      50,
      "17:00 Chiều\nNhà Hàng ABC\nĐịa chỉ Nhà Hàng",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: dark,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    img("img-couple2", 30, 1290, 330, 220, {
      radius: 12,
      borderColor: gold,
      borderWidth: 2,
    }),
    img("img-gallery1", 20, 1530, 170, 150, { radius: 10, borderColor: gold }),
    img("img-gallery2", 200, 1530, 170, 150, { radius: 10, borderColor: gold }),
    img("img-gallery3", 20, 1690, 170, 150, { radius: 10, borderColor: gold }),
    img("img-gallery4", 200, 1690, 170, 150, { radius: 10, borderColor: gold }),
    txt("txt-quote", 25, 1860, 340, 50, "Tình yêu là cùng nhìn về một hướng.", {
      size: 16,
      font: "'Dancing Script', cursive",
      color: red,
      italic: true,
      opacity: 0.9,
    }),
    txt(
      "txt-venue",
      20,
      1930,
      350,
      60,
      "Nhà Hàng\nĐịa chỉ nhà hàng tiệc cưới\nQuận, Thành phố",
      { size: 14, font: "'Inter', sans-serif", color: dark, opacity: 0.9 },
    ),
  ];
}

// ═══════════════════════════════════════════
// LAYOUT E: NATURE — Organic flow, full-width photos alternating with text blocks
// Section flow: SAVE THE DATE header → Names → Hero full-width → Invite text → Stacked portraits → Date → Family → Events → Gallery 3-column → Quote → Venue
// ═══════════════════════════════════════════
function makeNaturePreset(
  accent: string,
  heading: string,
  leaf: string,
): TemplateElement[] {
  return [
    txt("txt-ceremony", 20, 20, 350, 32, "SAVE THE DATE", {
      size: 14,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
      opacity: 0.7,
    }),
    txt("txt-names", 10, 60, 370, 100, "Tên Chú Rể\n&\nTên Cô Dâu", {
      size: 34,
      font: "'Dancing Script', cursive",
      weight: "bold",
      italic: true,
      color: heading,
      lineHeight: 1.15,
    }),
    txt("txt-deco1", 20, 170, 350, 24, "─── 🌿 ───", {
      size: 14,
      font: "'Georgia', serif",
      color: leaf,
      opacity: 0.55,
      locked: true,
    }),
    img("img-main", 0, 210, 390, 300, {
      radius: 0,
      borderColor: "transparent",
      borderWidth: 0,
    }),
    txt("txt-invite", 20, 530, 350, 32, "Trân trọng kính mời", {
      size: 15,
      font: "'Cormorant Garamond', serif",
      color: heading,
      italic: true,
    }),
    txt(
      "txt-family",
      20,
      570,
      350,
      50,
      "Cùng gia đình hai bên\nân hạnh kính mời quý khách",
      { size: 13, font: "'Lora', serif", color: heading, italic: true },
    ),
    img("img-groom", 30, 640, 160, 200, {
      radius: 20,
      borderColor: accent,
      borderWidth: 2,
      zIndex: 2,
    }),
    img("img-bride", 200, 640, 160, 200, {
      radius: 20,
      borderColor: accent,
      borderWidth: 2,
      zIndex: 3,
    }),
    txt("name-groom", 30, 850, 160, 32, "Chú Rể", {
      size: 16,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: heading,
    }),
    txt("name-bride", 200, 850, 160, 32, "Cô Dâu", {
      size: 16,
      font: "'Dancing Script', cursive",
      weight: "bold",
      color: heading,
    }),
    txt("txt-date", 20, 910, 350, 60, "Chủ Nhật, 28 · 05 · 2026", {
      size: 24,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: heading,
    }),
    txt("txt-time", 20, 975, 350, 30, "Lúc 10:00 sáng", {
      size: 15,
      font: "'Lora', serif",
      color: heading,
      italic: true,
    }),
    txt("txt-nhatrai-label", 20, 1030, 170, 28, "NHÀ TRAI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-nhatrai",
      20,
      1060,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Lora', serif",
        color: heading,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 1030, 170, 28, "NHÀ GÁI", {
      size: 13,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-nhagai",
      200,
      1060,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Lora', serif",
        color: heading,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-event1-label", 20, 1155, 170, 24, "LỄ VŨ QUY", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-event1",
      20,
      1180,
      170,
      50,
      "08:00 Sáng\nTư gia Nhà Gái\nĐịa chỉ Nhà Gái",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: heading,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    txt("txt-event2-label", 200, 1155, 170, 24, "TIỆC CƯỚI", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: accent,
    }),
    txt(
      "txt-event2",
      200,
      1180,
      170,
      50,
      "17:00 Chiều\nNhà Hàng ABC\nĐịa chỉ Nhà Hàng",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: heading,
        opacity: 0.8,
        lineHeight: 1.6,
        align: "left",
      },
    ),
    img("img-couple2", 0, 1260, 390, 220, {
      radius: 0,
      borderColor: "transparent",
      borderWidth: 0,
    }),
    img("img-gallery1", 20, 1500, 115, 130, {
      radius: 12,
      borderColor: accent,
    }),
    img("img-gallery2", 140, 1500, 115, 130, {
      radius: 12,
      borderColor: accent,
    }),
    img("img-gallery3", 260, 1500, 115, 130, {
      radius: 12,
      borderColor: accent,
    }),
    img("img-gallery4", 80, 1640, 230, 150, {
      radius: 12,
      borderColor: accent,
    }),
    txt("txt-quote", 30, 1810, 330, 50, "Tình yêu là hành trình đẹp nhất.", {
      size: 15,
      font: "'Lora', serif",
      color: heading,
      italic: true,
      opacity: 0.9,
    }),
    txt(
      "txt-venue",
      20,
      1880,
      350,
      60,
      "📍 Nhà Hàng\nĐịa chỉ nhà hàng tiệc cưới\nQuận, Thành phố",
      { size: 12, font: "'Inter', sans-serif", color: heading, opacity: 0.9 },
    ),
  ];
}

// ═══════════════════════════════════════════
// LAYOUT F: MODERN MINIMAL — Geometric, B&W, sans-serif, asymmetric layout
// Section flow: Date on top → GETTING MARRIED → Names → Hero offset → Family minimal → Portraits centered → Events minimal → Gallery single row → Venue
// ═══════════════════════════════════════════
function makeModernPreset(
  dark: string,
  mid: string,
  line: string,
): TemplateElement[] {
  return [
    txt("txt-date", 20, 20, 350, 50, "28 . 05 . 2026", {
      size: 32,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt("txt-ceremony", 20, 75, 350, 28, "WE'RE GETTING MARRIED", {
      size: 11,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: mid,
      opacity: 0.7,
    }),
    txt("txt-deco1", 20, 108, 350, 20, "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬", {
      size: 10,
      font: "'Inter', sans-serif",
      color: line,
      opacity: 0.3,
      locked: true,
    }),
    txt("txt-names", 10, 140, 370, 100, "Tên Chú Rể\n&\nTên Cô Dâu", {
      size: 36,
      font: "'Cormorant Garamond', serif",
      weight: "bold",
      color: dark,
      lineHeight: 1.15,
    }),
    txt(
      "txt-invite",
      20,
      250,
      350,
      32,
      "REQUEST THE PLEASURE OF YOUR COMPANY",
      {
        size: 10,
        font: "'Inter', sans-serif",
        weight: "bold",
        color: mid,
        opacity: 0.6,
      },
    ),
    img("img-main", 60, 300, 270, 320, {
      radius: 0,
      borderColor: dark,
      borderWidth: 2,
    }),
    txt("txt-time", 20, 640, 350, 24, "10:00 AM", {
      size: 14,
      font: "'Inter', sans-serif",
      color: mid,
      opacity: 0.7,
    }),
    txt(
      "txt-family",
      20,
      680,
      350,
      40,
      "Cùng gia đình hai bên\nân hạnh kính mời quý khách",
      { size: 13, font: "'Inter', sans-serif", color: mid },
    ),
    txt("txt-nhatrai-label", 20, 740, 170, 28, "NHÀ TRAI", {
      size: 11,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt(
      "txt-nhatrai",
      20,
      770,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon trai: Tên Chú Rể",
      {
        size: 12,
        font: "'Inter', sans-serif",
        color: mid,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    txt("txt-nhagai-label", 200, 740, 170, 28, "NHÀ GÁI", {
      size: 11,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt(
      "txt-nhagai",
      200,
      770,
      170,
      70,
      "Ông: Họ tên cha\nBà: Họ tên mẹ\nCon gái: Tên Cô Dâu",
      {
        size: 12,
        font: "'Inter', sans-serif",
        color: mid,
        opacity: 0.85,
        lineHeight: 1.8,
        align: "left",
      },
    ),
    img("img-groom", 50, 860, 140, 170, {
      radius: 0,
      borderColor: dark,
      borderWidth: 1,
      zIndex: 2,
    }),
    img("img-bride", 200, 860, 140, 170, {
      radius: 0,
      borderColor: dark,
      borderWidth: 1,
      zIndex: 3,
    }),
    txt("name-groom", 50, 1040, 140, 28, "MINH ANH", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt("name-bride", 200, 1040, 140, 28, "THUỲ LINH", {
      size: 12,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt("txt-event1-label", 20, 1090, 350, 24, "CEREMONY & RECEPTION", {
      size: 11,
      font: "'Inter', sans-serif",
      weight: "bold",
      color: dark,
    }),
    txt(
      "txt-event1",
      20,
      1115,
      350,
      40,
      "08:00 AM — Lễ Vũ Quy — Tư gia Nhà Gái",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: mid,
        opacity: 0.8,
        align: "left",
      },
    ),
    txt("txt-event2-label", 20, 1160, 350, 0, "", {
      size: 1,
      font: "'Inter', sans-serif",
      color: "transparent",
    }),
    txt(
      "txt-event2",
      20,
      1165,
      350,
      40,
      "05:00 PM — Tiệc Cưới — Nhà Hàng ABC",
      {
        size: 11,
        font: "'Inter', sans-serif",
        color: mid,
        opacity: 0.8,
        align: "left",
      },
    ),
    img("img-couple2", 40, 1230, 310, 200, {
      radius: 0,
      borderColor: dark,
      borderWidth: 1,
    }),
    img("img-gallery1", 20, 1450, 85, 100, { radius: 0, borderColor: line }),
    img("img-gallery2", 115, 1450, 85, 100, { radius: 0, borderColor: line }),
    img("img-gallery3", 210, 1450, 85, 100, { radius: 0, borderColor: line }),
    img("img-gallery4", 305, 1450, 80, 100, { radius: 0, borderColor: line }),
    txt(
      "txt-quote",
      20,
      1570,
      350,
      40,
      "Minimalism is the art of living with less but feeling more.",
      { size: 13, font: "'Inter', sans-serif", color: mid, italic: true },
    ),
    txt(
      "txt-venue",
      20,
      1630,
      350,
      50,
      "Diamond Palace — 123 Nguyễn Huệ, Q1, TP.HCM",
      { size: 11, font: "'Inter', sans-serif", color: mid, opacity: 0.75 },
    ),
  ];
}

// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// CINELOVE TEMPLATE 53 — Exact Replica (scraped from live CineLove editor)
// Canvas: 500→390px (scale 0.78) · BG: #f8f3eb (cream)
// Fonts: Mallong→Cormorant Garamond, RetroSignature→Great Vibes, Carlytte→Sacramento, Quicksand, Montserrat
// Colors: #4870A3 (blue) · #343432 (dark) · #4B5320 (olive)
// ═══════════════════════════════════════════
function makeCineLove53(): TemplateElement[] {
  const blue = "#4870A3";
  const dark = "#343432";
  const olive = "#4B5320";
  const cream = "rgba(72,112,163,0.08)";
  const mallong = "'Cormorant Garamond', serif";
  const retro = "'Great Vibes', cursive";
  const carly = "'Sacramento', cursive";
  const quick = "'Quicksand', sans-serif";
  const mont = "'Montserrat', sans-serif";

  // Demo images
  const heroImg =
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80";
  const coupleImg =
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&w=600&q=80";
  const albumImg1 =
    "https://images.unsplash.com/photo-1620023419992-12f5aee300ed?auto=format&fit=crop&w=600&q=80";
  const albumImg2 =
    "https://images.unsplash.com/photo-1529634597503-139d3726fed5?auto=format&fit=crop&w=600&q=80";
  const albumImg3 =
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=600&q=80";

  // Decorative transparent PNGs from CineLove assets
  const iconRings =
    "https://assets.cinelove.me/resources/flowchartIcons/3ienjp2nrx4h47t1yh3xzv.png";
  const iconCamera =
    "https://assets.cinelove.me/resources/flowchartIcons/1u64lvcg56egyde7h8rkwr.png";
  const iconWine =
    "https://assets.cinelove.me/resources/flowchartIcons/7ojrsz5b157xyl3xo134g.png";
  const iconCalendarHeart =
    "https://assets.cinelove.me/assets/plugins/calen_heart_1.png";
  const iconDresscode =
    "https://assets.cinelove.me/resources/flowchartIcons/zyryqj33inoq811jkpand.png";
  const waxSeal = "https://assets.cinelove.me/assets/plugins/wax-seal.webp";

  // Abstract floral overlay
  const floralTop =
    "https://images.unsplash.com/photo-1557004413-5cb2b55f1107?auto=format&fit=crop&w=800&q=80"; // Using unsplash for floral abstract if needed

  return [
    // ── Header ──
    txt("txt-le-cuoi", 20, 20, 350, 40, "Lễ Cưới", {
      size: 33,
      font: retro,
      color: olive,
      weight: "bold",
    }),

    // ── Hero Photo ──
    img("img-main", 0, 80, 390, 260, {
      radius: 0,
      borderColor: "transparent",
      borderWidth: 0,
      src: heroImg,
    }),

    // ── Couple portrait ──
    img("img-couple", 95, 330, 200, 140, {
      radius: 6,
      borderColor: cream,
      borderWidth: 0,
      src: coupleImg,
    }),

    // ── Family Info ──
    txt("txt-nhatrai-label", 20, 510, 170, 22, "NHÀ TRAI", {
      size: 15,
      font: mallong,
      weight: "bold",
      color: dark,
      align: "right",
    }),
    txt("txt-nhagai-label", 200, 510, 170, 22, "NHÀ GÁI", {
      size: 15,
      font: mallong,
      weight: "bold",
      color: dark,
      align: "left",
    }),
    txt("txt-bo-trai", 20, 540, 170, 20, "Bố : Tuấn Kiệt", {
      size: 14,
      font: mont,
      color: dark,
      align: "right",
    }),
    txt("txt-me-trai", 20, 565, 170, 20, "Mẹ : Diễm My", {
      size: 14,
      font: mont,
      color: dark,
      align: "right",
    }),
    txt("txt-bo-gai", 200, 540, 170, 20, "Bố : Quốc Phong", {
      size: 14,
      font: mont,
      color: dark,
      align: "left",
    }),
    txt("txt-me-gai", 200, 565, 170, 20, "Mẹ : Hoàng Yến", {
      size: 14,
      font: mont,
      color: dark,
      align: "left",
    }),
    txt("txt-diachi-trai", 20, 595, 170, 18, "Hà Nội", {
      size: 12,
      font: mont,
      color: dark,
      opacity: 0.7,
      align: "right",
    }),
    txt("txt-diachi-gai", 200, 595, 170, 18, "Ninh Bình", {
      size: 12,
      font: mont,
      color: dark,
      opacity: 0.7,
      align: "left",
    }),

    // ── Couple Names ──
    txt("txt-name-groom", 10, 660, 200, 78, "Tuấn Minh", {
      size: 46,
      font: mallong,
      weight: "bold",
      color: blue,
      align: "center",
    }),
    txt("txt-and", 155, 700, 80, 60, "and", {
      size: 56,
      font: retro,
      color: olive,
      align: "center",
    }),
    txt("txt-name-bride", 180, 750, 200, 78, "Mai Trang", {
      size: 46,
      font: mallong,
      weight: "bold",
      color: blue,
      align: "center",
    }),

    // Wax Seal Decoration
    img("img-wax-seal", 180, 810, 30, 30, { src: waxSeal, locked: true }),

    // ── Invitation ──
    txt("txt-invite", 20, 855, 350, 35, "Trân trọng mời Bạn", {
      size: 20,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt("txt-invite2", 20, 895, 350, 44, "Dự  Lễ Vu Quy", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: blue,
    }),

    // ── Event 1 (Vu Quy) ──
    txt("txt-vuquy-time", 20, 960, 350, 44, "Vào 08:00, Thứ Bảy", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt("txt-vuquy-date-left", 10, 1010, 140, 40, "Tháng 02", {
      size: 23,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt("txt-vuquy-day", 135, 990, 120, 86, "28", {
      size: 69,
      font: quick,
      weight: "bold",
      color: blue,
      align: "center",
    }),
    txt("txt-vuquy-date-right", 245, 1010, 140, 40, "năm 2026", {
      size: 23,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt(
      "txt-vuquy-lunar",
      20,
      1085,
      350,
      23,
      "(Tức ngày 8 tháng 12 năm Ất Tỵ)",
      { size: 13, font: mallong, weight: "bold", color: dark },
    ),
    txt("txt-vuquy-venue", 20, 1120, 350, 44, "tư gia nhà Gái", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: blue,
    }),
    txt("txt-vuquy-addr", 20, 1165, 350, 23, "Hà Nội", {
      size: 13,
      font: mallong,
      weight: "bold",
      color: dark,
    }),

    // ── Event 2 (Tiec) ──
    txt("txt-tiec-invite", 20, 1220, 350, 44, "Dự  Bữa Tiệc Thân Mật", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: blue,
    }),
    txt("txt-tiec-time", 20, 1280, 350, 44, "Vào 17:30, Thứ Bảy", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt("txt-tiec-date-left", 10, 1330, 140, 40, "Tháng 02", {
      size: 23,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt("txt-tiec-day", 135, 1315, 120, 86, "28", {
      size: 69,
      font: quick,
      weight: "bold",
      color: blue,
      align: "center",
    }),
    txt("txt-tiec-date-right", 245, 1330, 140, 40, "năm 2026", {
      size: 23,
      font: mallong,
      weight: "bold",
      color: dark,
    }),
    txt(
      "txt-tiec-lunar",
      20,
      1405,
      350,
      23,
      "(Tức ngày 8 tháng 12 năm Ất Tỵ)",
      { size: 13, font: mallong, weight: "bold", color: dark },
    ),
    txt("txt-tiec-venue", 20, 1440, 350, 44, "nhà hàng sen vàng", {
      size: 26,
      font: mallong,
      weight: "bold",
      color: blue,
    }),
    txt("txt-tiec-addr", 20, 1485, 350, 23, "Quốc Oai - Hà Nội", {
      size: 13,
      font: mallong,
      weight: "bold",
      color: dark,
    }),

    // ── Timeline (With Graphic Icons) ──
    txt("txt-timeline-title", 20, 1540, 350, 73, "Timeline", {
      size: 66,
      font: retro,
      color: olive,
    }),

    img("img-icon-rings", 25, 1630, 70, 70, { src: iconRings, locked: true }),
    img("img-icon-camera", 160, 1630, 70, 70, {
      src: iconCamera,
      locked: true,
    }),
    img("img-icon-wine", 295, 1630, 70, 70, { src: iconWine, locked: true }),

    txt("txt-tl-time1", 10, 1710, 100, 26, "08:00", {
      size: 18,
      font: quick,
      weight: "500",
      color: dark,
    }),
    txt("txt-tl-event1", 10, 1735, 100, 20, "Lễ thành hôn", {
      size: 14,
      font: quick,
      weight: "500",
      color: dark,
    }),

    txt("txt-tl-time2", 145, 1710, 100, 26, "10:30", {
      size: 18,
      font: quick,
      weight: "500",
      color: dark,
    }),
    txt("txt-tl-event2", 145, 1735, 100, 20, "Checkin", {
      size: 14,
      font: quick,
      weight: "500",
      color: dark,
    }),

    txt("txt-tl-time3", 280, 1710, 100, 26, "11:00", {
      size: 18,
      font: quick,
      weight: "500",
      color: dark,
    }),
    txt("txt-tl-event3", 280, 1735, 100, 20, "Khai tiệc", {
      size: 14,
      font: quick,
      weight: "500",
      color: dark,
    }),

    // ── Dresscode ──
    txt("txt-dresscode-title", 20, 1820, 350, 73, "Dresscode", {
      size: 66,
      font: retro,
      color: olive,
    }),
    txt(
      "txt-dresscode-desc",
      40,
      1900,
      310,
      40,
      "Trang phục khuyến nghị tham dự",
      { size: 14, font: quick, color: dark },
    ),
    img("img-icon-dresscode", 145, 1940, 100, 110, {
      src: iconDresscode,
      locked: true,
    }),
    txt("txt-dresscode-colors", 40, 2060, 310, 30, "🔵 ⚪ 🔘", {
      size: 24,
      font: quick,
      color: dark,
    }),

    // ── Couple Cards ──
    txt("txt-groom-label", 20, 2120, 160, 27, "Chú rể", {
      size: 25,
      font: carly,
      color: dark,
    }),
    txt("txt-bride-label", 210, 2120, 160, 27, "Cô dâu", {
      size: 25,
      font: carly,
      color: dark,
    }),
    txt("txt-groom-name2", 20, 2155, 160, 42, "Tuấn Minh", {
      size: 25,
      font: mallong,
      weight: "bold",
      color: blue,
    }),
    txt("txt-bride-name2", 210, 2155, 160, 42, "Mai Trang", {
      size: 25,
      font: mallong,
      weight: "bold",
      color: blue,
    }),
    txt("txt-groom-dob", 20, 2200, 160, 27, "16.01.2000", {
      size: 20,
      font: carly,
      color: blue,
    }),
    txt("txt-bride-dob", 210, 2200, 160, 27, "28.01.2002", {
      size: 20,
      font: carly,
      color: blue,
    }),

    // ── Story ──
    txt("txt-story-title", 20, 2260, 350, 56, "Chuyện kể rằng.....", {
      size: 57,
      font: retro,
      color: dark,
    }),
    txt(
      "txt-story1",
      30,
      2330,
      330,
      100,
      "Chúng mình gặp nhau từ những ngày còn ngồi học chung ở cấp 3. Khi ấy chúng mình chỉ là hai đứa trẻ hay cười đùa, nhưng số phận đã gieo duyên.",
      { size: 14, font: quick, color: olive, lineHeight: 1.8, align: "left" },
    ),
    txt(
      "txt-story2",
      30,
      2430,
      330,
      70,
      "Và hôm nay, chúng mình quyết định viết tiếp câu chuyện ấy bằng một lời hứa trọn đời.",
      { size: 14, font: quick, color: olive, lineHeight: 1.8, align: "left" },
    ),

    // ── Advanced Calendar (with Heart) ──
    txt("txt-cal-title", 20, 2520, 350, 40, "Tháng 2", {
      size: 34,
      font: retro,
      color: blue,
    }),
    txt(
      "txt-cal-grid",
      40,
      2570,
      310,
      200,
      "2  3  4  5  6  7  8\\n9 10 11 12 13 14 15\\n16 17 18 19 20 21 22\\n23 24 25 26 27 28 29",
      { size: 16, font: "monospace", color: dark, lineHeight: 2 },
    ),
    img("img-icon-heart", 260, 2695, 25, 25, {
      src: iconCalendarHeart,
      opacity: 0.8,
      locked: true,
    }), // Hovering over 28

    // ── Countdown Widget ──
    {
      id: "plugin-countdown",
      type: "countdown",
      x: 20,
      y: 2520,
      width: 350,
      height: 120,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        targetDate: "2026-01-28",
        label: "Ngày trọng đại",
        accentColor: blue,
        theme: "elegant",
      },
    },

    // ── Calendar Widget ──
    {
      id: "plugin-calendar",
      type: "calendar",
      x: 20,
      y: 2660,
      width: 350,
      height: 280,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        selectedDate: "2026-01-28",
        accentColor: blue,
        highlightColor: "#f9a8d4",
      },
    },

    // ── Map Widget ──
    {
      id: "plugin-map",
      type: "map",
      x: 20,
      y: 2960,
      width: 350,
      height: 200,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        address: "Nhà hàng Sen Vàng, Quốc Oai, Hà Nội",
        mapUrl: "https://maps.app.goo.gl/Wd7CAj6d3scKH5pV6",
        label: "Nhà hàng Sen Vàng",
      },
    },

    // ── Photo Album ──
    {
      id: "plugin-album",
      type: "album",
      x: 20,
      y: 3180,
      width: 350,
      height: 300,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        images: [
          { src: albumImg1, alt: "Ảnh 1" },
          { src: albumImg2, alt: "Ảnh 2" },
          { src: albumImg3, alt: "Ảnh 3" },
          { src: coupleImg, alt: "Ảnh 4" },
          { src: heroImg, alt: "Ảnh 5" },
        ],
        columns: 3,
        gap: 8,
      },
    },

    // ── RSVP Form ──
    {
      id: "plugin-rsvp",
      type: "rsvp",
      x: 20,
      y: 3500,
      width: 350,
      height: 300,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        title: "Xác nhận tham dự",
        nameLabel: "Họ và Tên",
        submitLabel: "Gửi xác nhận",
        accentColor: blue,
      },
    },

    // ── QR Bank Box ──
    {
      id: "plugin-qrbox",
      type: "qrbox",
      x: 20,
      y: 3820,
      width: 350,
      height: 300,
      rotation: 0,
      opacity: 1,
      zIndex: 5,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        groomName: "TUAN MINH",
        groomBank: "MB BANK",
        groomAccount: "12345678",
        brideName: "MAI TRANG",
        brideBank: "VIETCOMBANK",
        brideAccount: "87654321",
      },
    },

    // ── Envelope Widget ──
    {
      id: "plugin-envelope",
      type: "envelope",
      x: 0,
      y: 0,
      width: 390,
      height: 300,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      locked: false,
      animation: { entrance: "fadeIn", loop: "none" },
      props: {
        flapImage: "",
        backdropOpacity: 0.8,
        preventScrollUntilOpen: true,
      },
    },

    // ── Thank You + Footer ──
    txt("txt-thankyou-title", 20, 4140, 350, 50, "Thankyou!", {
      size: 46,
      font: retro,
      color: olive,
    }),
    txt(
      "txt-thankyou-body",
      30,
      4200,
      330,
      90,
      "Cảm ơn Bạn đã dành thời gian cho thiệp mời! Sự hiện diện của Bạn chính là món quà ý nghĩa nhất, khiến ngày vui thêm phần trọn vẹn.",
      { size: 14, font: quick, color: dark, lineHeight: 1.8, align: "center" },
    ),

    img("img-wax-seal2", 180, 4310, 30, 30, { src: waxSeal, locked: true }),
    txt("txt-footer", 100, 4350, 190, 20, "designed by lovestory.vn", {
      size: 10,
      font: mont,
      color: dark,
      opacity: 0.4,
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════════
// TOP 20 UNIQUE BESPOKE WEDDING TEMPLATE BUILDERS (CineLove Parity 90%+)
// ═══════════════════════════════════════════════════════════════════

/** 1. Thiệp Cưới 42 — Rose Garden Romance (Top 1 • 38.2k views) */
function makeThiepCuoi42(): TemplateElement[] {
  const rose = "#be185d";
  const dark = "#831843";
  const soft = "#fda4af";
  return [
    txt("txt-header-label", 20, 25, 350, 30, "SAVE THE DATE", { size: 13, font: "'Cinzel', serif", color: rose, weight: "600", opacity: 0.8 }),
    img("img-main", 20, 65, 350, 440, { radius: 18, borderWidth: 3, borderColor: soft, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-ceremony", 20, 520, 350, 32, "Lễ Thành Hôn", { size: 22, font: "'Cormorant Garamond', serif", italic: true, color: rose }),
    txt("txt-names", 10, 560, 370, 110, "Tuấn Minh\n&\nMai Lan", { size: 44, font: "'Dancing Script', cursive", weight: "bold", color: dark, lineHeight: 1.15 }),
    txt("txt-deco1", 20, 680, 350, 24, "❀ ──────── ❀", { size: 13, font: "'Georgia', serif", color: soft, locked: true }),
    txt("txt-family", 20, 715, 350, 60, "Trân trọng kính mời quý khách\ntới dự bữa tiệc chung vui cùng gia đình chúng tôi", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    txt("txt-nhatrai-label", 20, 790, 170, 26, "NHÀ TRAI", { size: 13, font: "'Inter', sans-serif", weight: "bold", color: rose }),
    txt("txt-nhatrai", 20, 820, 170, 70, "Ông: Nguyễn Văn A\nBà: Trần Thị B\nCon trai: Tuấn Minh", { size: 12, font: "'Lora', serif", color: dark, lineHeight: 1.8, align: "left" }),
    txt("txt-nhagai-label", 200, 790, 170, 26, "NHÀ GÁI", { size: 13, font: "'Inter', sans-serif", weight: "bold", color: rose }),
    txt("txt-nhagai", 200, 820, 170, 70, "Ông: Lê Văn C\nBà: Phạm Thị D\nCon gái: Mai Lan", { size: 12, font: "'Lora', serif", color: dark, lineHeight: 1.8, align: "left" }),
    img("img-groom", 35, 910, 150, 200, { radius: 14, rotation: -3, borderColor: soft, zIndex: 2 }),
    img("img-bride", 205, 910, 150, 200, { radius: 14, rotation: 3, borderColor: soft, zIndex: 3 }),
    txt("name-groom", 35, 1120, 150, 28, "Tuấn Minh", { size: 18, font: "'Dancing Script', cursive", weight: "bold", color: dark }),
    txt("name-bride", 205, 1120, 150, 28, "Mai Lan", { size: 18, font: "'Dancing Script', cursive", weight: "bold", color: dark }),
    txt("txt-date-header", 20, 1165, 350, 30, "THÁNG 05 · NĂM 2026", { size: 15, font: "'Cormorant Garamond', serif", weight: "bold", color: dark }),
    txt("txt-date-day", 135, 1195, 120, 75, "28", { size: 64, font: "'Cormorant Garamond', serif", weight: "bold", color: rose }),
    txt("txt-date-time", 20, 1275, 350, 28, "17:00 · Thứ Bảy", { size: 15, font: "'Lora', serif", italic: true, color: dark }),
    wgt("plugin-countdown", "countdown", 20, 1320, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC NGÀY CƯỚI", accentColor: rose }),
    wgt("plugin-calendar", "calendar", 20, 1450, 350, 240, { selectedDate: "2026-05-28", accentColor: rose }),
    txt("txt-timeline-title", 20, 1710, 350, 40, "Chương Trình Tiệc Cưới", { size: 24, font: "'Dancing Script', cursive", weight: "bold", color: rose }),
    txt("txt-tl1", 20, 1760, 110, 50, "16:30\nĐón khách", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.5 }),
    txt("txt-tl2", 140, 1760, 110, 50, "17:00\nLễ thành hôn", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.5 }),
    txt("txt-tl3", 260, 1760, 110, 50, "18:00\nKhai tiệc", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.5 }),
    txt("txt-quote", 30, 1830, 330, 70, '"Tình yêu giống như một đoá hồng — cần được chăm sóc mỗi ngày để nở rộ rực rỡ."', { size: 15, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.7 }),
    img("img-gallery1", 25, 1920, 165, 160, { radius: 10, borderColor: soft }),
    img("img-gallery2", 200, 1920, 165, 160, { radius: 10, borderColor: soft }),
    img("img-gallery3", 25, 2095, 165, 160, { radius: 10, borderColor: soft }),
    img("img-gallery4", 200, 2095, 165, 160, { radius: 10, borderColor: soft }),
    wgt("plugin-map", "map", 20, 2280, 350, 200, { address: "Diamond Palace, 123 Nguyễn Huệ, Quận 1, TP.HCM", label: "Trung tâm Tiệc cưới Diamond Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 2500, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Gửi phản hồi", accentColor: rose }),
    wgt("plugin-qrbox", "qrbox", 20, 2800, 350, 280, { groomName: "TUAN MINH", groomBank: "VIETCOMBANK", groomAccount: "0123456789", brideName: "MAI LAN", brideBank: "MB BANK", brideAccount: "9876543210" }),
    txt("txt-footer-thanks", 20, 3100, 350, 50, "Cảm ơn bạn đã đến chung vui cùng chúng tôi 🌹", { size: 20, font: "'Dancing Script', cursive", weight: "bold", color: rose }),
  ];
}

/** 2. Thiệp Cưới 39 — Classic Champagne Cream & Harmony (Top 2 • 23.3k views) */
function makeThiepCuoi39(): TemplateElement[] {
  const gold = "#92400e";
  const dark = "#78350f";
  const accent = "#b45309";
  return [
    txt("txt-top-callout", 20, 30, 350, 30, "L Ễ   V U   Q U Y", { size: 14, font: "'Cinzel', serif", color: accent, weight: "bold" }),
    txt("txt-names", 10, 70, 370, 110, "Tuấn Minh\n&\nMai Lan", { size: 42, font: "'Playfair Display', serif", weight: "bold", italic: true, color: dark, lineHeight: 1.15 }),
    txt("txt-deco1", 20, 190, 350, 24, "~ ♥ ~", { size: 14, font: "'Georgia', serif", color: accent, opacity: 0.6, locked: true }),
    img("img-main", 30, 225, 330, 420, { radius: 100, borderWidth: 2, borderColor: accent, src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&fit=crop" }),
    txt("txt-invite", 20, 665, 350, 32, "Trân trọng kính mời", { size: 17, font: "'Cormorant Garamond', serif", italic: true, color: gold }),
    txt("txt-family", 20, 700, 350, 55, "Quý khách đến dự bữa tiệc thân mật\nmừng ngày hạnh phúc của hai con", { size: 14, font: "'Lora', serif", color: dark, lineHeight: 1.6 }),
    txt("txt-nhatrai-label", 20, 770, 170, 24, "ĐẠI DIỆN NHÀ TRAI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: accent }),
    txt("txt-nhatrai", 20, 798, 170, 65, "Ông: Nguyễn Văn A\nBà: Trần Thị B", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    txt("txt-nhagai-label", 200, 770, 170, 24, "ĐẠI DIỆN NHÀ GÁI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: accent }),
    txt("txt-nhagai", 200, 798, 170, 65, "Ông: Lê Văn C\nBà: Phạm Thị D", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    txt("txt-date", 20, 880, 350, 45, "Thứ Bảy, 28 Tháng 05 Năm 2026", { size: 20, font: "'Cormorant Garamond', serif", weight: "bold", color: dark }),
    txt("txt-time", 20, 925, 350, 28, "Đón khách: 17:00 · Khai tiệc: 18:00", { size: 14, font: "'Lora', serif", italic: true, color: gold }),
    img("img-groom", 40, 970, 140, 180, { radius: 70, borderColor: accent }),
    img("img-bride", 210, 970, 140, 180, { radius: 70, borderColor: accent }),
    txt("name-groom", 40, 1160, 140, 26, "Chú Rể Tuấn Minh", { size: 14, font: "'Playfair Display', serif", weight: "bold", color: dark }),
    txt("name-bride", 210, 1160, 140, 26, "Cô Dâu Mai Lan", { size: 14, font: "'Playfair Display', serif", weight: "bold", color: dark }),
    wgt("plugin-countdown", "countdown", 20, 1210, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC NGÀY TRỌNG ĐẠI", accentColor: accent }),
    wgt("plugin-calendar", "calendar", 20, 1340, 350, 240, { selectedDate: "2026-05-28", accentColor: accent }),
    img("img-couple2", 20, 1600, 350, 240, { radius: 12, borderColor: accent, borderWidth: 1 }),
    txt("txt-quote", 30, 1860, 330, 60, '"Bên nhau là khởi đầu, gắn bó là tiến bước, cùng nhau là hạnh phúc trọn đời."', { size: 15, font: "'Cormorant Garamond', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-map", "map", 20, 1940, 350, 200, { address: "Grand Palace, 142/18 Cộng Hòa, Q. Tân Bình, TP.HCM", label: "Trung Tâm Tiệc Cưới Grand Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 2160, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: accent }),
    wgt("plugin-qrbox", "qrbox", 20, 2460, 350, 280, { groomName: "NGUYEN TUAN MINH", groomBank: "BIDV", groomAccount: "123456789", brideName: "LE MAI LAN", brideBank: "TCB", brideAccount: "987654321" }),
    txt("txt-footer", 20, 2760, 350, 40, "Sự hiện diện của quý vị là niềm vinh hạnh lớn của chúng tôi", { size: 14, font: "'Cormorant Garamond', serif", italic: true, color: gold }),
  ];
}

/** 3. Thiệp Cưới 46 — Modern Trend Lavender & Violet (Top 3 • 22.5k views) */
function makeThiepCuoi46(): TemplateElement[] {
  const purple = "#6d28d9";
  const deep = "#4c1d95";
  const light = "#c4b5fd";
  return [
    txt("txt-header", 20, 30, 350, 30, "W E D D I N G   C E L E B R A T I O N", { size: 12, font: "'Cinzel', serif", color: purple, weight: "bold", opacity: 0.8 }),
    img("img-main", 20, 70, 350, 420, { radius: 24, borderWidth: 2, borderColor: light, src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&fit=crop" }),
    txt("txt-names", 10, 510, 370, 100, "Tuấn Minh\n&\nMai Lan", { size: 40, font: "'Playfair Display', serif", weight: "bold", color: deep, lineHeight: 1.2 }),
    txt("txt-date-badge", 95, 620, 200, 36, "28 . 05 . 2026", { size: 18, font: "'Inter', sans-serif", weight: "bold", color: purple }),
    txt("txt-invite", 20, 670, 350, 60, "Trân trọng kính mời quý khách đến tham dự buổi tiệc cưới\ncủa chúng tôi tại Star Palace", { size: 14, font: "'Inter', sans-serif", color: deep, lineHeight: 1.6 }),
    img("img-gallery1", 20, 750, 110, 150, { radius: 10, borderColor: light }),
    img("img-gallery2", 140, 750, 110, 150, { radius: 10, borderColor: light }),
    img("img-gallery3", 260, 750, 110, 150, { radius: 10, borderColor: light }),
    txt("txt-sched-title", 20, 920, 350, 30, "Lịch Trình Sự Kiện", { size: 18, font: "'Playfair Display', serif", weight: "bold", color: deep }),
    txt("txt-sched1", 20, 960, 110, 45, "17:00\nĐón Khách", { size: 13, font: "'Inter', sans-serif", color: deep }),
    txt("txt-sched2", 140, 960, 110, 45, "18:00\nLễ Cưới", { size: 13, font: "'Inter', sans-serif", color: deep }),
    txt("txt-sched3", 260, 960, 110, 45, "19:00\nDạ Tiệc", { size: 13, font: "'Inter', sans-serif", color: deep }),
    wgt("plugin-countdown", "countdown", 20, 1025, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN TO OUR BIG DAY", accentColor: purple }),
    wgt("plugin-calendar", "calendar", 20, 1150, 350, 240, { selectedDate: "2026-05-28", accentColor: purple }),
    wgt("plugin-map", "map", 20, 1410, 350, 200, { address: "Star Palace, 123 Lê Lợi, Q.1, TP.HCM", label: "Trung tâm Hội nghị Tiệc cưới Star Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 1630, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Gửi xác nhận", accentColor: purple }),
    wgt("plugin-qrbox", "qrbox", 20, 1930, 350, 280, { groomName: "TUAN MINH", groomBank: "TPBANK", groomAccount: "000123456", brideName: "MAI LAN", brideBank: "MBBANK", brideAccount: "999876543" }),
    txt("txt-footer", 20, 2230, 350, 40, "Thank you for being part of our special day ✨", { size: 16, font: "'Dancing Script', cursive", color: purple }),
  ];
}

/** 4. Thiệp Cưới 38 — Soft Pastel Coral Floral (Top 4 • 21.9k views) */
function makeThiepCuoi38(): TemplateElement[] {
  const coral = "#e11d48";
  const dark = "#9f1239";
  const soft = "#fda4af";
  return [
    txt("txt-top-deco", 20, 25, 350, 30, "❀ ── SAVE OUR DATE ── ❀", { size: 13, font: "'Lora', serif", color: coral, opacity: 0.9 }),
    txt("txt-names", 10, 65, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 44, font: "'Great Vibes', cursive", color: dark, lineHeight: 1.1 }),
    img("img-main", 30, 175, 330, 400, { radius: 16, borderColor: soft, borderWidth: 3, src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&fit=crop" }),
    txt("txt-ceremony", 20, 595, 350, 32, "LỄ THÀNH HÔN", { size: 20, font: "'Cormorant Garamond', serif", weight: "bold", color: coral }),
    txt("txt-date", 20, 635, 350, 30, "28 Tháng 05 Năm 2026", { size: 18, font: "'Lora', serif", color: dark }),
    txt("txt-invite", 20, 675, 350, 55, "Thân mời bạn cùng gia đình đến chung vui\ntrong ngày trọng đại nhất cuộc đời chúng tôi", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.6 }),
    txt("txt-nhatrai-label", 20, 745, 170, 24, "NHÀ TRAI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: coral }),
    txt("txt-nhatrai", 20, 772, 170, 60, "Nguyễn Văn A\nTrần Thị B", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.6, align: "left" }),
    txt("txt-nhagai-label", 200, 745, 170, 24, "NHÀ GÁI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: coral }),
    txt("txt-nhagai", 200, 772, 170, 60, "Lê Văn C\nPhạm Thị D", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.6, align: "left" }),
    img("img-gallery1", 20, 850, 170, 160, { radius: 12, borderColor: soft }),
    img("img-gallery2", 200, 850, 170, 160, { radius: 12, borderColor: soft }),
    wgt("plugin-countdown", "countdown", 20, 1030, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC NGÀY CƯỚI", accentColor: coral }),
    wgt("plugin-calendar", "calendar", 20, 1160, 350, 240, { selectedDate: "2026-05-28", accentColor: coral }),
    wgt("plugin-map", "map", 20, 1420, 350, 200, { address: "White Palace, 194 Hoàng Văn Thụ, Phú Nhuận, TP.HCM", label: "Trung tâm White Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 1640, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: coral }),
    wgt("plugin-qrbox", "qrbox", 20, 1940, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "11223344", brideName: "MAI LAN", brideBank: "ACB", brideAccount: "55667788" }),
    txt("txt-footer", 20, 2240, 350, 40, "Cảm ơn bạn đã luôn đồng hành cùng chúng mình 🌸", { size: 18, font: "'Great Vibes', cursive", color: coral }),
  ];
}

/** 5. Thiệp Cưới 36 — Classic Royal Heritage Burgundy & Gold (Top 5 • 20.1k views) */
function makeThiepCuoi36(): TemplateElement[] {
  const gold = "#b45309";
  const royal = "#701a75";
  const dark = "#4a044e";
  return [
    txt("txt-monogram", 145, 25, 100, 40, "M & L", { size: 24, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-header", 20, 70, 350, 25, "ROYAL WEDDING INVITATION", { size: 12, font: "'Cinzel', serif", color: gold, weight: "bold" }),
    txt("txt-names", 10, 100, 370, 110, "Tuấn Minh\n&\nMai Lan", { size: 44, font: "'Playfair Display', serif", weight: "bold", color: royal, lineHeight: 1.15 }),
    img("img-main", 30, 220, 330, 420, { radius: 8, borderWidth: 3, borderColor: gold, src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&fit=crop" }),
    txt("txt-ceremony", 20, 660, 350, 35, "LỄ THÀNH HÔN", { size: 22, font: "'Cormorant Garamond', serif", weight: "bold", color: gold }),
    txt("txt-date", 20, 700, 350, 30, "Thứ Bảy, ngày 28 tháng 05 năm 2026", { size: 16, font: "'Playfair Display', serif", color: dark }),
    txt("txt-invite", 20, 740, 350, 50, "Trân trọng kính mời quý khách tới tham dự lễ cưới hoàng gia", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    txt("txt-nhatrai-label", 20, 805, 170, 24, "NHÀ TRAI", { size: 13, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-nhatrai", 20, 832, 170, 60, "Ông: Nguyễn Văn A\nBà: Trần Thị B", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    txt("txt-nhagai-label", 200, 805, 170, 24, "NHÀ GÁI", { size: 13, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-nhagai", 200, 832, 170, 60, "Ông: Lê Văn C\nBà: Phạm Thị D", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    wgt("plugin-countdown", "countdown", 20, 910, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: gold }),
    wgt("plugin-calendar", "calendar", 20, 1040, 350, 240, { selectedDate: "2026-05-28", accentColor: gold }),
    wgt("plugin-map", "map", 20, 1300, 350, 200, { address: "The Reverie Saigon, 22-36 Nguyễn Huệ, Q.1, TP.HCM", label: "Khách sạn The Reverie Saigon" }),
    wgt("plugin-rsvp", "rsvp", 20, 1520, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: gold }),
    wgt("plugin-qrbox", "qrbox", 20, 1820, 350, 280, { groomName: "TUAN MINH", groomBank: "VIETCOMBANK", groomAccount: "9988776655", brideName: "MAI LAN", brideBank: "TECHCOMBANK", brideAccount: "1122334455" }),
    txt("txt-footer", 20, 2120, 350, 40, "Sự hiện diện của quý khách là niềm vinh dự của gia đình chúng tôi", { size: 14, font: "'Playfair Display', serif", italic: true, color: gold }),
  ];
}

/** 6. Thiệp Cưới 44 — Midnight Gold Luxury Dark (Top 6 • 16.3k views • Premium) */
function makeThiepCuoi44(): TemplateElement[] {
  const gold = "#f59e0b";
  const lightGold = "#fef3c7";
  return [
    txt("txt-header", 20, 30, 350, 25, "THE WEDDING OF", { size: 13, font: "'Cinzel', serif", color: gold, weight: "bold", opacity: 0.9 }),
    txt("txt-names", 10, 65, 370, 110, "Tuấn Minh\n&\nMai Lan", { size: 44, font: "'Dancing Script', cursive", weight: "bold", color: lightGold, lineHeight: 1.15 }),
    img("img-main", 25, 185, 340, 420, { radius: 12, borderWidth: 2, borderColor: gold, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-date", 20, 625, 350, 35, "28 · MAY · 2026", { size: 22, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-time", 20, 665, 350, 25, "SATURDAY AT 5:00 PM", { size: 13, font: "'Inter', sans-serif", color: lightGold, opacity: 0.8 }),
    txt("txt-invite", 20, 705, 350, 50, "Trân trọng kính mời quý khách tham dự đêm tiệc tình yêu", { size: 14, font: "'Cormorant Garamond', serif", italic: true, color: lightGold, lineHeight: 1.6 }),
    img("img-gallery1", 20, 770, 165, 160, { radius: 8, borderColor: gold }),
    img("img-gallery2", 205, 770, 165, 160, { radius: 8, borderColor: gold }),
    wgt("plugin-countdown", "countdown", 20, 950, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN TO CELEBRATION", accentColor: gold }),
    wgt("plugin-calendar", "calendar", 20, 1080, 350, 240, { selectedDate: "2026-05-28", accentColor: gold }),
    wgt("plugin-map", "map", 20, 1340, 350, 200, { address: "Park Hyatt Saigon, 2 Lam Sơn, Q.1, TP.HCM", label: "Khách Sạn Park Hyatt Saigon" }),
    wgt("plugin-rsvp", "rsvp", 20, 1560, 350, 280, { title: "RSVP", submitLabel: "Xác Nhận Tham Dự", accentColor: gold }),
    wgt("plugin-qrbox", "qrbox", 20, 1860, 350, 280, { groomName: "TUAN MINH", groomBank: "MBBANK", groomAccount: "09090909", brideName: "MAI LAN", brideBank: "VCB", brideAccount: "08080808" }),
    txt("txt-footer", 20, 2160, 350, 40, "Thank you for sharing this magical night with us 🌙", { size: 18, font: "'Dancing Script', cursive", color: gold }),
  ];
}

/** 7. Thiệp Cưới 40 — Minimalist Monogram Chic (Top 7 • 16.1k views) */
function makeThiepCuoi40(): TemplateElement[] {
  const dark = "#1f2937";
  const gray = "#4b5563";
  return [
    txt("txt-monogram", 145, 30, 100, 35, "T · M", { size: 20, font: "'Cinzel', serif", weight: "bold", color: dark }),
    txt("txt-header", 20, 70, 350, 25, "WEDDING INVITATION", { size: 12, font: "'Inter', sans-serif", color: gray, opacity: 0.8 }),
    img("img-main", 20, 105, 350, 280, { radius: 8, borderWidth: 1, borderColor: "#e5e7eb", src: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&fit=crop" }),
    txt("txt-names", 10, 400, 370, 80, "Tuấn Minh & Mai Lan", { size: 32, font: "'Playfair Display', serif", weight: "bold", color: dark }),
    txt("txt-date", 20, 485, 350, 30, "28 Tháng 05 Năm 2026", { size: 16, font: "'Inter', sans-serif", weight: "600", color: dark }),
    txt("txt-invite", 20, 525, 350, 50, "Kính mời quý vị cùng tới chung vui trong ngày hạnh phúc của chúng tôi", { size: 13, font: "'Inter', sans-serif", color: gray, lineHeight: 1.6 }),
    img("img-gallery1", 20, 590, 350, 220, { radius: 6, borderColor: "#e5e7eb" }),
    wgt("plugin-countdown", "countdown", 20, 830, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: dark }),
    wgt("plugin-calendar", "calendar", 20, 960, 350, 240, { selectedDate: "2026-05-28", accentColor: dark }),
    wgt("plugin-map", "map", 20, 1220, 350, 200, { address: "GEM Center, 8 Nguyễn Bỉnh Khiêm, Đa Kao, Q.1, TP.HCM", label: "GEM Center" }),
    wgt("plugin-rsvp", "rsvp", 20, 1440, 350, 280, { title: "Xác Nhận", submitLabel: "Xác Nhận Tham Dự", accentColor: dark }),
    wgt("plugin-qrbox", "qrbox", 20, 1740, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "12345", brideName: "MAI LAN", brideBank: "TCB", brideAccount: "67890" }),
    txt("txt-footer", 20, 2040, 350, 30, "With love & gratitude", { size: 14, font: "'Lora', serif", italic: true, color: gray }),
  ];
}

/** 8. Thiệp Cưới 16 — Botanical Garden Greenery (Top 8 • 14.8k views) */
function makeThiepCuoi16(): TemplateElement[] {
  const emerald = "#065f46";
  const sage = "#059669";
  const dark = "#064e3b";
  return [
    txt("txt-deco-top", 20, 25, 350, 30, "🌿 TOGETHER WITH NATURE 🌿", { size: 12, font: "'Cormorant Garamond', serif", color: sage, weight: "bold" }),
    txt("txt-names", 10, 65, 370, 100, "Tuấn Minh\n&\nMai Lan", { size: 42, font: "'Cormorant Garamond', serif", weight: "bold", italic: true, color: dark, lineHeight: 1.15 }),
    img("img-main", 25, 175, 340, 420, { radius: 20, borderWidth: 2, borderColor: sage, src: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&fit=crop" }),
    txt("txt-ceremony", 20, 610, 350, 32, "LỄ THÀNH HÔN NGOÀI TRỜI", { size: 18, font: "'Cinzel', serif", weight: "600", color: emerald }),
    txt("txt-date", 20, 650, 350, 30, "Thứ Bảy, 28 . 05 . 2026", { size: 16, font: "'Lora', serif", color: dark }),
    txt("txt-invite", 20, 690, 350, 50, "Trân trọng kính mời quý khách tham dự bữa tiệc vườn lãng mạn", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 760, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC", accentColor: emerald }),
    wgt("plugin-calendar", "calendar", 20, 890, 350, 240, { selectedDate: "2026-05-28", accentColor: emerald }),
    img("img-gallery1", 20, 1150, 165, 170, { radius: 12, borderColor: sage }),
    img("img-gallery2", 205, 1150, 165, 170, { radius: 12, borderColor: sage }),
    wgt("plugin-map", "map", 20, 1340, 350, 200, { address: "Villa Song Saigon, 197/2 Nguyễn Văn Hưởng, Thảo Điền, TP. Thủ Đức", label: "Villa Song Saigon" }),
    wgt("plugin-rsvp", "rsvp", 20, 1560, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: emerald }),
    wgt("plugin-qrbox", "qrbox", 20, 1860, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "11112222", brideName: "MAI LAN", brideBank: "MBBANK", brideAccount: "33334444" }),
    txt("txt-footer", 20, 2160, 350, 40, "Thank you for joining our garden love story 🌿", { size: 16, font: "'Cormorant Garamond', serif", italic: true, color: emerald }),
  ];
}

/** 9. Thiệp Cưới 47 — Velvet Crimson & Gold Luxury (Top 9 • 14.7k views • Premium) */
function makeThiepCuoi47(): TemplateElement[] {
  const crimson = "#881337";
  const gold = "#fbbf24";
  const dark = "#4c0519";
  return [
    txt("txt-header", 20, 25, 350, 30, "L Ễ   T H À N H   H Ô N", { size: 14, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-names", 10, 65, 370, 110, "Tuấn Minh\n&\nMai Lan", { size: 44, font: "'Playfair Display', serif", weight: "bold", italic: true, color: crimson, lineHeight: 1.15 }),
    img("img-main", 30, 185, 330, 420, { radius: 100, borderWidth: 3, borderColor: gold, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-date", 20, 620, 350, 35, "28 Tháng 05 Năm 2026", { size: 20, font: "'Playfair Display', serif", weight: "bold", color: crimson }),
    txt("txt-lunar", 20, 660, 350, 25, "(Tức ngày 13 tháng 04 năm Bính Ngọ)", { size: 13, font: "'Lora', serif", italic: true, color: dark }),
    txt("txt-invite", 20, 695, 350, 50, "Kính mời quý quan khách tới dự bữa tiệc rượu mừng hạnh phúc", { size: 14, font: "'Lora', serif", color: dark, lineHeight: 1.6 }),
    txt("txt-nhatrai-label", 20, 760, 170, 24, "NHÀ TRAI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: gold }),
    txt("txt-nhatrai", 20, 788, 170, 60, "Nguyễn Văn A\nTrần Thị B", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    txt("txt-nhagai-label", 200, 760, 170, 24, "NHÀ GÁI", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: gold }),
    txt("txt-nhagai", 200, 788, 170, 60, "Lê Văn C\nPhạm Thị D", { size: 13, font: "'Lora', serif", color: dark, lineHeight: 1.7, align: "left" }),
    wgt("plugin-countdown", "countdown", 20, 865, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC NGÀY CƯỚI", accentColor: crimson }),
    wgt("plugin-calendar", "calendar", 20, 995, 350, 240, { selectedDate: "2026-05-28", accentColor: crimson }),
    wgt("plugin-map", "map", 20, 1255, 350, 200, { address: "Adora Center, 431 Hoàng Văn Thụ, Tân Bình, TP.HCM", label: "Trung Tâm Hội Nghị The Adora Center" }),
    wgt("plugin-rsvp", "rsvp", 20, 1475, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Gửi Phản Hồi", accentColor: crimson }),
    wgt("plugin-qrbox", "qrbox", 20, 1775, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "1234567890", brideName: "MAI LAN", brideBank: "TCB", brideAccount: "0987654321" }),
    txt("txt-footer", 20, 2075, 350, 40, "Rất hân hạnh được đón tiếp quý khách! 🌹", { size: 18, font: "'Playfair Display', serif", italic: true, color: crimson }),
  ];
}

/** 10. Thiệp Cưới 48 — Editorial High-Fashion Magazine (Top 10 • 13.4k views) */
function makeThiepCuoi48(): TemplateElement[] {
  const dark = "#18181b";
  const gray = "#71717a";
  return [
    txt("txt-mag-header", 20, 20, 350, 25, "VOGUE WEDDING EDITION · ISSUE 2026", { size: 11, font: "'Inter', sans-serif", weight: "bold", color: gray }),
    txt("txt-mag-title", 10, 48, 370, 65, "THE WEDDING", { size: 48, font: "'Playfair Display', serif", weight: "900", color: dark }),
    img("img-main", 0, 120, 390, 460, { radius: 0, src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&fit=crop" }),
    txt("txt-cover-names", 20, 595, 350, 40, "TUAN MINH  &  MAI LAN", { size: 22, font: "'Cinzel', serif", weight: "bold", color: dark }),
    txt("txt-cover-date", 20, 640, 350, 25, "MAY 28, 2026 · HO CHI MINH CITY", { size: 13, font: "'Inter', sans-serif", color: gray }),
    txt("txt-story", 25, 680, 340, 75, '"Một câu chuyện tình yêu hiện đại, tinh tế và đầy đam mê được ghi dấu bằng một đám cưới mang phong cách thời trang độc bản."', { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.7 }),
    img("img-gallery1", 20, 770, 170, 210, { radius: 4 }),
    img("img-gallery2", 200, 770, 170, 210, { radius: 4 }),
    wgt("plugin-countdown", "countdown", 20, 1000, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: dark }),
    wgt("plugin-calendar", "calendar", 20, 1130, 350, 240, { selectedDate: "2026-05-28", accentColor: dark }),
    wgt("plugin-map", "map", 20, 1390, 350, 200, { address: "Mia Resort Saigon, 2-4 Đường 10, An Phú, TP. Thủ Đức", label: "Mia Resort Saigon" }),
    wgt("plugin-rsvp", "rsvp", 20, 1610, 350, 280, { title: "RSVP", submitLabel: "CONFIRM ATTENDANCE", accentColor: dark }),
    wgt("plugin-qrbox", "qrbox", 20, 1910, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "88889999", brideName: "MAI LAN", brideBank: "MBBANK", brideAccount: "11110000" }),
    txt("txt-footer", 20, 2210, 350, 30, "SPECIAL THANKS TO ALL OUR LOVED ONES", { size: 11, font: "'Inter', sans-serif", weight: "bold", color: gray }),
  ];
}

/** 11. Thiệp Cưới 19 — Serene Dusty Blue & Pearl (Top 11 • 12.2k views) */
function makeThiepCuoi19(): TemplateElement[] {
  const blue = "#1e40af";
  const dark = "#1e3a8a";
  const soft = "#bfdbfe";
  return [
    txt("txt-header", 20, 25, 350, 25, "WEDDING INVITATION", { size: 12, font: "'Cinzel', serif", color: blue, weight: "bold" }),
    txt("txt-names", 10, 60, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 42, font: "'Playfair Display', serif", weight: "bold", color: dark, lineHeight: 1.15 }),
    img("img-main", 25, 175, 340, 420, { radius: 16, borderWidth: 2, borderColor: soft, src: "https://images.unsplash.com/photo-1620023419992-12f5aee300ed?w=800&fit=crop" }),
    txt("txt-date", 20, 615, 350, 35, "28 Tháng 05 Năm 2026", { size: 20, font: "'Cormorant Garamond', serif", weight: "bold", color: blue }),
    txt("txt-invite", 20, 655, 350, 50, "Kính mời quý khách tới tham dự tiệc cưới ngập tràn sắc xanh bình yên", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 720, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: blue }),
    wgt("plugin-calendar", "calendar", 20, 850, 350, 240, { selectedDate: "2026-05-28", accentColor: blue }),
    wgt("plugin-map", "map", 20, 1110, 350, 200, { address: "Riverside Palace, 360D Bến Vân Đồn, Q.4, TP.HCM", label: "Riverside Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 1330, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: blue }),
    wgt("plugin-qrbox", "qrbox", 20, 1630, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "112233", brideName: "MAI LAN", brideBank: "ACB", brideAccount: "445566" }),
    txt("txt-footer", 20, 1930, 350, 35, "Thank you for your love and blessing 💙", { size: 16, font: "'Dancing Script', cursive", color: blue }),
  ];
}

/** 12. Thiệp Cưới Tone Xanh — Fresh Mint Sage & Eucalyptus (Top 12 • 10.2k views) */
function makeThiepCuoiToneXanh(): TemplateElement[] {
  const mint = "#047857";
  const dark = "#064e3b";
  const soft = "#a7f3d0";
  return [
    txt("txt-header", 20, 25, 350, 25, "L Ễ   T H À N H   H Ô N", { size: 13, font: "'Cinzel', serif", color: mint, weight: "bold" }),
    txt("txt-names", 10, 60, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 40, font: "'Dancing Script', cursive", weight: "bold", color: dark, lineHeight: 1.15 }),
    img("img-main", 30, 175, 330, 420, { radius: 100, borderWidth: 2, borderColor: soft, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-date", 20, 615, 350, 30, "28 · 05 · 2026", { size: 22, font: "'Playfair Display', serif", weight: "bold", color: mint }),
    txt("txt-invite", 20, 655, 350, 50, "Trân trọng kính mời quý khách tham dự tiệc cưới thân mật tone xanh thanh mát", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 720, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: mint }),
    wgt("plugin-calendar", "calendar", 20, 850, 350, 240, { selectedDate: "2026-05-28", accentColor: mint }),
    wgt("plugin-map", "map", 20, 1110, 350, 200, { address: "Thảo Điền Village, 189-197/1 Nguyễn Văn Hưởng, TP. Thủ Đức", label: "Thảo Điền Village" }),
    wgt("plugin-rsvp", "rsvp", 20, 1330, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Gửi Xác Nhận", accentColor: mint }),
    wgt("plugin-qrbox", "qrbox", 20, 1630, 350, 280, { groomName: "TUAN MINH", groomBank: "MBBANK", groomAccount: "123123", brideName: "MAI LAN", brideBank: "VCB", brideAccount: "456456" }),
    txt("txt-footer", 20, 1930, 350, 35, "Hân hạnh được đón tiếp quý khách 🌿", { size: 16, font: "'Dancing Script', cursive", color: mint }),
  ];
}

/** 13. Thiệp Cưới 2 — Golden Sparkle & Glamour (Top 13 • 9.6k views • Premium) */
function makeThiepCuoi2(): TemplateElement[] {
  const gold = "#d97706";
  const dark = "#78350f";
  return [
    txt("txt-header", 20, 25, 350, 25, "✨ CELEBRATION OF LOVE ✨", { size: 13, font: "'Cinzel', serif", color: gold, weight: "bold" }),
    txt("txt-names", 10, 60, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 44, font: "'Great Vibes', cursive", color: dark, lineHeight: 1.15 }),
    img("img-main", 25, 175, 340, 420, { radius: 12, borderWidth: 3, borderColor: gold, src: "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&fit=crop" }),
    txt("txt-date", 20, 615, 350, 35, "28 . 05 . 2026", { size: 22, font: "'Playfair Display', serif", weight: "bold", color: gold }),
    txt("txt-invite", 20, 655, 350, 50, "Kính mời quý quan khách tới dự đêm tiệc ánh kim rực rỡ", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 720, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: gold }),
    wgt("plugin-calendar", "calendar", 20, 850, 350, 240, { selectedDate: "2026-05-28", accentColor: gold }),
    wgt("plugin-map", "map", 20, 1110, 350, 200, { address: "Sheraton Saigon Hotel, 88 Đồng Khởi, Q.1, TP.HCM", label: "Khách Sạn Sheraton Saigon" }),
    wgt("plugin-rsvp", "rsvp", 20, 1330, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: gold }),
    wgt("plugin-qrbox", "qrbox", 20, 1630, 350, 280, { groomName: "TUAN MINH", groomBank: "TCB", groomAccount: "9999", brideName: "MAI LAN", brideBank: "VCB", brideAccount: "8888" }),
    txt("txt-footer", 20, 1930, 350, 35, "Thank you for celebrating with us ✨", { size: 16, font: "'Great Vibes', cursive", color: gold }),
  ];
}

/** 14. Thiệp Cưới 4 — CineLove Bespoke 04: Vintage Film & Nostalgic Romance (Top Bespoke • Sepia Retro) */
function makeThiepCuoi4(): TemplateElement[] {
  const sepia = "#78350f";
  const warmGold = "#b45309";
  const cream = "#fef3c7";
  const darkCharcoal = "#292524";
  return [
    txt("txt-header", 20, 20, 350, 25, "MEMOIR NOSTALGIE • 1990s FILM EDITION", { size: 11, font: "'Courier Prime', monospace", color: warmGold, weight: "bold" }),
    txt("txt-names", 10, 50, 370, 95, "Tuấn Minh\n& Mai Lan", { size: 42, font: "'Playfair Display', serif", italic: true, color: sepia, lineHeight: 1.12 }),
    img("img-main", 25, 155, 340, 380, { radius: 8, borderWidth: 6, borderColor: "#ffffff", rotation: -1.5, src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-postage", 270, 510, 90, 40, "AIR MAIL\nPOSTAGE", { size: 10, font: "'Courier Prime', monospace", color: warmGold, weight: "bold" }),
    txt("txt-date", 20, 560, 350, 30, "✦ 28 · 05 · 2026 ✦", { size: 18, font: "'Lora', serif", weight: "bold", color: sepia }),
    txt("txt-invite", 20, 598, 350, 45, "Thước phim thời gian lưu giữ từng khoảnh khắc ngọt ngào nhất của đôi ta", { size: 13, font: "'Lora', serif", italic: true, color: darkCharcoal, lineHeight: 1.5 }),
    wgt("plugin-voice", "voice-narration", 20, 655, 350, 160, {
      title: "🎙️ Lời Dẫn Thiệp Cưới Vintage",
      groomName: "Tuấn Minh",
      brideName: "Mai Lan",
      weddingDate: "28/05/2026",
      venue: "Trung Tâm Tiệc Cưới Vintage Hall",
      accentColor: warmGold,
      script: "Kính chào quý vị khách quý. Đây là cuốn phim tình yêu ghi dấu ngày chung đôi của Tuấn Minh và Mai Lan. Trân trọng kính mời quý khách tới nâng ly chúc phúc!",
    }),
    wgt("plugin-countdown", "countdown", 20, 830, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN TO OUR DAY", accentColor: warmGold }),
    wgt("plugin-calendar", "calendar", 20, 955, 350, 240, { selectedDate: "2026-05-28", accentColor: warmGold }),
    wgt("plugin-map", "map", 20, 1210, 350, 200, { address: "The Myst Dong Khoi, 6-8 Hồ Huấn Nghiệp, Q.1, TP.HCM", label: "The Myst Dong Khoi Hotel" }),
    wgt("plugin-rsvp", "rsvp", 20, 1425, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Gửi Lời Chúc", accentColor: sepia }),
    wgt("plugin-qrbox", "qrbox", 20, 1720, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "199044", brideName: "MAI LAN", brideBank: "MBBANK", brideAccount: "199088" }),
    txt("txt-footer", 20, 2015, 350, 35, "Love is a timeless vintage story 🎞️", { size: 15, font: "'Lora', serif", italic: true, color: warmGold }),
  ];
}

/** 15. Thiệp Cưới 5 — CineLove Bespoke 05: Minimalist Korean Gold & Gentle Chic (Top Bespoke • Seoul Chic) */
function makeThiepCuoi5(): TemplateElement[] {
  const gold = "#d4af37";
  const darkNavy = "#1e293b";
  const softBg = "#fdfbf7";
  const accentGray = "#64748b";
  return [
    txt("txt-header", 20, 25, 350, 25, "THE WEDDING DAY • 우리가 함께하는 날", { size: 11, font: "'Inter', sans-serif", color: gold, weight: "bold" }),
    txt("txt-names", 10, 55, 370, 90, "TUẤN MINH & MAI LAN", { size: 28, font: "'Cinzel', serif", weight: "bold", color: darkNavy, lineHeight: 1.2 }),
    img("img-main", 35, 155, 320, 420, { radius: 160, borderWidth: 3, borderColor: gold, src: "https://images.unsplash.com/photo-1529634597503-139d3726fed5?w=800&fit=crop" }),
    txt("txt-date", 20, 590, 350, 30, "MAY 28, 2026 | 18:00 PM", { size: 16, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-invite", 20, 628, 350, 45, "Trân trọng kính mời quý khách tham dự lễ thành hôn phong cách Hàn Quốc tối giản", { size: 13, font: "'Inter', sans-serif", color: accentGray, lineHeight: 1.5 }),
    wgt("plugin-voice", "voice-narration", 20, 685, 350, 160, {
      title: "🎙️ Lời Dẫn Thiệp Cưới Minimalist Gold",
      groomName: "Tuấn Minh",
      brideName: "Mai Lan",
      weddingDate: "28/05/2026",
      venue: "Grand Ballroom Seoul Centre",
      accentColor: gold,
      script: "Kính chào quý vị khách quý. Tình yêu là khi hai tâm hồn tìm thấy sự bình yên bên nhau. Tuấn Minh và Mai Lan trân trọng kính mời quý vị đến chung vui trong ngày hạnh phúc.",
    }),
    wgt("plugin-countdown", "countdown", 20, 860, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: gold }),
    wgt("plugin-calendar", "calendar", 20, 985, 350, 240, { selectedDate: "2026-05-28", accentColor: gold }),
    wgt("plugin-map", "map", 20, 1240, 350, 200, { address: "Park Hyatt Saigon, 2 Lam Son Square, Q.1, TP.HCM", label: "Park Hyatt Saigon Hotel" }),
    wgt("plugin-rsvp", "rsvp", 20, 1455, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: darkNavy }),
    wgt("plugin-qrbox", "qrbox", 20, 1750, 350, 280, { groomName: "TUAN MINH", groomBank: "TCB", groomAccount: "88889999", brideName: "MAI LAN", brideBank: "VCB", brideAccount: "99998888" }),
    txt("txt-footer", 20, 2045, 350, 35, "Warmly thank you for joining us 🕊️", { size: 15, font: "'Cinzel', serif", color: gold }),
  ];
}

/** 15. Thiệp Cưới 23 — Pure White Scandinavian Minimal (Top 15 • 8.7k views • Free) */
function makeThiepCuoi23(): TemplateElement[] {
  const dark = "#111827";
  const gray = "#6b7280";
  return [
    txt("txt-header", 20, 35, 350, 25, "WEDDING INVITATION", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: gray }),
    txt("txt-names", 10, 70, 370, 80, "Tuấn Minh & Mai Lan", { size: 34, font: "'Playfair Display', serif", weight: "bold", color: dark }),
    img("img-main", 20, 165, 350, 300, { radius: 4, borderWidth: 1, borderColor: "#e5e7eb", src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&fit=crop" }),
    txt("txt-date", 20, 485, 350, 30, "Saturday, 28 May 2026", { size: 16, font: "'Inter', sans-serif", weight: "600", color: dark }),
    txt("txt-invite", 20, 525, 350, 50, "We invite you to celebrate our wedding day with us", { size: 13, font: "'Inter', sans-serif", color: gray, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 595, 350, 110, { targetDate: "2026-05-28", label: "DAYS UNTIL WEDDING", accentColor: dark }),
    wgt("plugin-calendar", "calendar", 20, 725, 350, 240, { selectedDate: "2026-05-28", accentColor: dark }),
    wgt("plugin-map", "map", 20, 985, 350, 200, { address: "Capella Gallery Hall, 24 Đường 3/2, Q.10, TP.HCM", label: "Capella Gallery Hall" }),
    wgt("plugin-rsvp", "rsvp", 20, 1205, 350, 280, { title: "RSVP", submitLabel: "SUBMIT", accentColor: dark }),
    wgt("plugin-qrbox", "qrbox", 20, 1505, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "101010", brideName: "MAI LAN", brideBank: "TCB", brideAccount: "202020" }),
    txt("txt-footer", 20, 1805, 350, 30, "See you at our wedding", { size: 13, font: "'Inter', sans-serif", color: gray }),
  ];
}

/** 16. Thiệp Cưới 8 — Warm Terracotta Boho Sunset (Top 16 • 8.0k views • Free) */
function makeThiepCuoi8(): TemplateElement[] {
  const terra = "#c2410c";
  const dark = "#7c2d12";
  const sand = "#ffedd5";
  return [
    txt("txt-header", 20, 25, 350, 25, "B O H O   W E D D I N G", { size: 12, font: "'Cinzel', serif", color: terra, weight: "bold" }),
    txt("txt-names", 10, 60, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 42, font: "'Dancing Script', cursive", weight: "bold", color: dark, lineHeight: 1.15 }),
    img("img-main", 30, 175, 330, 420, { radius: 100, borderWidth: 3, borderColor: sand, src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&fit=crop" }),
    txt("txt-date", 20, 615, 350, 35, "28 Tháng 05 Năm 2026", { size: 20, font: "'Lora', serif", weight: "bold", color: terra }),
    txt("txt-invite", 20, 655, 350, 50, "Thân mời bạn cùng hoà mình vào tiệc cưới hoàng hôn ấm cúng", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 720, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC", accentColor: terra }),
    wgt("plugin-calendar", "calendar", 20, 850, 350, 240, { selectedDate: "2026-05-28", accentColor: terra }),
    wgt("plugin-map", "map", 20, 1110, 350, 200, { address: "An Lâm Retreats Saigon River, 21/4 Trung, Thuận An, Bình Dương", label: "An Lâm Retreats" }),
    wgt("plugin-rsvp", "rsvp", 20, 1330, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: terra }),
    wgt("plugin-qrbox", "qrbox", 20, 1630, 350, 280, { groomName: "TUAN MINH", groomBank: "MBBANK", groomAccount: "778899", brideName: "MAI LAN", brideBank: "VCB", brideAccount: "445566" }),
    txt("txt-footer", 20, 1930, 350, 35, "With warm love & light ☀️", { size: 16, font: "'Dancing Script', cursive", color: terra }),
  ];
}

/** 17. Thiệp Cưới 53 — Midnight Starry Celestial (Top 17 • 7.7k views • Premium) */
function makeThiepCuoi53(): TemplateElement[] {
  return makeCineLove53();
}

/** 18. Thiệp Cưới 28 — Vintage Monogram & Arch Window (Top 18 • 7.2k views) */
function makeThiepCuoi28(): TemplateElement[] {
  const brown = "#78350f";
  const gold = "#b45309";
  const dark = "#451a03";
  return [
    txt("txt-monogram", 145, 25, 100, 35, "T ❦ M", { size: 22, font: "'Cinzel', serif", weight: "bold", color: gold }),
    txt("txt-header", 20, 65, 350, 25, "LỄ THÀNH HÔN TRUYỀN THỐNG", { size: 13, font: "'Cinzel', serif", color: brown, weight: "bold" }),
    txt("txt-names", 10, 100, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 40, font: "'Playfair Display', serif", weight: "bold", color: dark, lineHeight: 1.15 }),
    img("img-main", 30, 215, 330, 420, { radius: 90, borderWidth: 2, borderColor: gold, src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&fit=crop" }),
    txt("txt-date", 20, 655, 350, 35, "Ngày 28 Tháng 05 Năm 2026", { size: 18, font: "'Cormorant Garamond', serif", weight: "bold", color: brown }),
    txt("txt-invite", 20, 695, 350, 50, "Kính mời quý vị cùng nâng ly chúc phúc cho đôi trẻ", { size: 14, font: "'Lora', serif", italic: true, color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 760, 350, 110, { targetDate: "2026-05-28", label: "ĐẾM NGƯỢC", accentColor: brown }),
    wgt("plugin-calendar", "calendar", 20, 890, 350, 240, { selectedDate: "2026-05-28", accentColor: brown }),
    wgt("plugin-map", "map", 20, 1150, 350, 200, { address: "Nhà Hàng Đồng Xanh, 132/5 Hoàng Hoa Thám, Bình Thạnh, TP.HCM", label: "Nhà Hàng Tiệc Cưới Đồng Xanh" }),
    wgt("plugin-rsvp", "rsvp", 20, 1370, 350, 280, { title: "Xác Nhận", submitLabel: "Xác Nhận Tham Dự", accentColor: brown }),
    wgt("plugin-qrbox", "qrbox", 20, 1670, 350, 280, { groomName: "TUAN MINH", groomBank: "AGRIBANK", groomAccount: "100200300", brideName: "MAI LAN", brideBank: "BIDV", brideAccount: "400500600" }),
    txt("txt-footer", 20, 1970, 350, 35, "Kính chúc quý khách an khang thịnh vượng 💐", { size: 15, font: "'Lora', serif", italic: true, color: brown }),
  ];
}

/** 19. Thiệp Cưới 11 — Lavender Watercolor Whisper (Top 19 • 6.5k views) */
function makeThiepCuoi11(): TemplateElement[] {
  const lavender = "#7c3aed";
  const dark = "#5b21b6";
  const soft = "#ddd6fe";
  return [
    txt("txt-header", 20, 25, 350, 25, "LAVENDER DREAMS", { size: 12, font: "'Cinzel', serif", color: lavender, weight: "bold" }),
    txt("txt-names", 10, 60, 370, 100, "Tuấn Minh\n& Mai Lan", { size: 42, font: "'Dancing Script', cursive", weight: "bold", color: dark, lineHeight: 1.15 }),
    img("img-main", 25, 175, 340, 420, { radius: 18, borderWidth: 2, borderColor: soft, src: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&fit=crop" }),
    txt("txt-date", 20, 615, 350, 30, "28 · 05 · 2026", { size: 20, font: "'Playfair Display', serif", weight: "bold", color: lavender }),
    txt("txt-invite", 20, 655, 350, 50, "Trân trọng kính mời quý khách đến chung vui ngày vu quy ngát hương hoa", { size: 13, font: "'Inter', sans-serif", color: dark, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 720, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: lavender }),
    wgt("plugin-calendar", "calendar", 20, 850, 350, 240, { selectedDate: "2026-05-28", accentColor: lavender }),
    wgt("plugin-map", "map", 20, 1110, 350, 200, { address: "MerPerle Crystal Palace, C17-1-2 Nguyễn Lương Bằng, Q.7, TP.HCM", label: "MerPerle Crystal Palace" }),
    wgt("plugin-rsvp", "rsvp", 20, 1330, 350, 280, { title: "Xác Nhận Tham Dự", submitLabel: "Xác Nhận", accentColor: lavender }),
    wgt("plugin-qrbox", "qrbox", 20, 1630, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "777888", brideName: "MAI LAN", brideBank: "MBBANK", brideAccount: "999000" }),
    txt("txt-footer", 20, 1930, 350, 35, "Thank you for being our guest 💜", { size: 16, font: "'Dancing Script', cursive", color: lavender }),
  ];
}

/** 20. Thiệp Cưới 49 — Contemporary Nordic Studio (Top 20 • 6.1k views) */
function makeThiepCuoi49(): TemplateElement[] {
  const slate = "#334155";
  const dark = "#0f172a";
  const soft = "#e2e8f0";
  return [
    txt("txt-header", 20, 30, 350, 25, "THE MARRIAGE OF", { size: 12, font: "'Inter', sans-serif", weight: "bold", color: slate }),
    txt("txt-names", 10, 65, 370, 90, "Tuấn Minh\n& Mai Lan", { size: 36, font: "'Playfair Display', serif", weight: "bold", color: dark, lineHeight: 1.2 }),
    img("img-main", 20, 170, 350, 320, { radius: 10, borderWidth: 1, borderColor: soft, src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&fit=crop" }),
    txt("txt-date", 20, 510, 350, 30, "Saturday, May 28, 2026", { size: 16, font: "'Inter', sans-serif", weight: "bold", color: dark }),
    txt("txt-invite", 20, 550, 350, 50, "We warmly invite you to share our happiness and celebrate our wedding day", { size: 13, font: "'Inter', sans-serif", color: slate, lineHeight: 1.6 }),
    wgt("plugin-countdown", "countdown", 20, 620, 350, 110, { targetDate: "2026-05-28", label: "COUNTDOWN", accentColor: dark }),
    wgt("plugin-calendar", "calendar", 20, 750, 350, 240, { selectedDate: "2026-05-28", accentColor: dark }),
    wgt("plugin-map", "map", 20, 1010, 350, 200, { address: "Pullman Saigon Centre, 148 Trần Hưng Đạo, Q.1, TP.HCM", label: "Pullman Saigon Centre" }),
    wgt("plugin-rsvp", "rsvp", 20, 1230, 350, 280, { title: "RSVP", submitLabel: "SUBMIT", accentColor: dark }),
    wgt("plugin-qrbox", "qrbox", 20, 1530, 350, 280, { groomName: "TUAN MINH", groomBank: "VCB", groomAccount: "123123123", brideName: "MAI LAN", brideBank: "TCB", brideAccount: "321321321" }),
    txt("txt-footer", 20, 1830, 350, 30, "Looking forward to seeing you", { size: 13, font: "'Inter', sans-serif", color: slate }),
  ];
}

// ═══════════════════════════════════════════════════════════════════
// ALL 75 TEMPLATE UNIQUE PRESETS — Each uses a distinct layout family + unique colors
// ═══════════════════════════════════════════════════════════════════

export const TEMPLATE_UNIQUE_PRESETS: Record<string, TemplateElement[]> = {
  // ── TOP 20 BESPOKE UNIQUE LAYOUTS (Sprint 52 • CineLove Parity 90%+) ──
  "thiep-cuoi-42": makeThiepCuoi42(),
  "thiep-cuoi-39": makeThiepCuoi39(),
  "thiep-cuoi-46": makeThiepCuoi46(),
  "thiep-cuoi-38": makeThiepCuoi38(),
  "thiep-cuoi-36": makeThiepCuoi36(),
  "thiep-cuoi-44": makeThiepCuoi44(),
  "thiep-cuoi-40": makeThiepCuoi40(),
  "thiep-cuoi-16": makeThiepCuoi16(),
  "thiep-cuoi-47": makeThiepCuoi47(),
  "thiep-cuoi-48": makeThiepCuoi48(),
  "thiep-cuoi-19": makeThiepCuoi19(),
  "thiep-cuoi-tone-xanh": makeThiepCuoiToneXanh(),
  "thiep-cuoi-2": makeThiepCuoi2(),
  "thiep-cuoi-5": makeThiepCuoi5(),
  "thiep-cuoi-23": makeThiepCuoi23(),
  "thiep-cuoi-8": makeThiepCuoi8(),
  "thiep-cuoi-53": makeThiepCuoi53(),
  "thiep-cuoi-28": makeThiepCuoi28(),
  "thiep-cuoi-11": makeThiepCuoi11(),
  "thiep-cuoi-49": makeThiepCuoi49(),

  // ── OTHER WEDDING TEMPLATES (Family Presets) ──
  "thiep-cuoi-1": makeClassicPreset("#111827", "#6b7280", "#e5e7eb"),
  "thiep-cuoi-17": makeClassicPreset("#1f2937", "#4b5563", "#d1d5db"),
  "thiep-cuoi-56": makeLuxuryPreset("#c9a84c", "#fef9e7", "✦ ═══════ ✦"),
  "thiep-cuoi-52": makeLuxuryPreset("#d4af37", "#fff8e1", "─── ✦ ───"),
  "thiep-cuoi-12": makeClassicPreset("#1c1917", "#57534e", "#e7e5e4"),
  "thiep-bw-1": makeModernPreset("#18181b", "#52525b", "#71717a"),
  "thiep-cuoi-43": makeRomanticPreset(
    "#fecdd3",
    "#9f1239",
    "#fda4af",
    "'Cormorant Garamond', serif",
    "✿ ─── ✿ ─── ✿",
  ),
  "thiep-cuoi-21": makeRomanticPreset(
    "#f9a8d4",
    "#be185d",
    "#f472b6",
    "'Great Vibes', cursive",
    "✦ ══════ ✦",
  ),
  "thiep-cuoi-7": makeClassicPreset("#111827", "#374151", "#d1d5db"),
  "thiep-cuoi-31": makeTraditionalPreset("#b91c1c", "#7f1d1d", "#f59e0b"),
  "thiep-cuoi-30": makeTraditionalPreset("#dc2626", "#881337", "#fbbf24"),
  "thiep-cuoi-4": makeThiepCuoi4(),
  "thiep-cuoi-14": makeRomanticPreset(
    "#fecdd3",
    "#831843",
    "#f9a8d4",
    "'Playfair Display', serif",
    "─── ♥ ───",
  ),
  "thiep-cuoi-15": makeRomanticPreset(
    "#fde8f3",
    "#9f1239",
    "#fca5e4",
    "'Lora', serif",
    "✿ ─── ✿",
  ),
  "thiep-cuoi-3": makeClassicPreset("#161616", "#404040", "#d4d4d4"),
  "thiep-cuoi-55": makeRomanticPreset(
    "#fecdd3",
    "#9f1239",
    "#fda4af",
    "'Cormorant Garamond', serif",
    "❀ ─── ❀",
  ),
  "thiep-cuoi-10": makeTraditionalPreset("#dc2626", "#7f1d1d", "#d97706"),
  "thiep-cuoi-50": makeRomanticPreset(
    "#fda4af",
    "#831843",
    "#fb7185",
    "'Cormorant Garamond', serif",
    "❀ ────── ❀",
  ),
  "thiep-cuoi-24": makeRomanticPreset(
    "#f9a8d4",
    "#7c3369",
    "#e879a7",
    "'Dancing Script', cursive",
    "✿ ═══ ✿",
  ),
  "thiep-cuoi-18": makeClassicPreset("#1e1e1e", "#4a4a4a", "#c4c4c4"),
  "thiep-cuoi-41": makeRomanticPreset(
    "#fecdd3",
    "#be185d",
    "#fda4af",
    "'Great Vibes', cursive",
    "✿ ─── ✿ ─── ✿",
  ),
  "thiep-cuoi-57": makeLuxuryPreset("#d4a574", "#faf3e0", "✦ ─────── ✦"),
  "thiep-cuoi-37": makeRomanticPreset(
    "#fda4af",
    "#9f1239",
    "#fb7185",
    "'Playfair Display', serif",
    "✦ ── ✦ ── ✦",
  ),
  "thiep-cuoi-6": makeTraditionalPreset("#b91c1c", "#7f1d1d", "#f59e0b"),
  "thiep-cuoi-32": makeTraditionalPreset("#dc2626", "#78181d", "#fbbf24"),
  "thiep-cuoi-34": makeLuxuryPreset("#d4a574", "#fef3c7", "─ ✦ ─ ✦ ─"),
  "thiep-cuoi-20": makeTraditionalPreset("#ef4444", "#7f1d1d", "#f59e0b"),
  "thiep-cuoi-35": makeRomanticPreset(
    "#fde8f3",
    "#831843",
    "#f9a8d4",
    "'Lora', serif",
    "✿ ═══ ✿",
  ),
  "thiep-cuoi-9": makeTraditionalPreset("#b91c1c", "#6b1414", "#d97706"),
  "thiep-cuoi-33": makeLuxuryPreset("#c9a84c", "#fff8e1", "✦ ─────── ✦"),
  "thiep-cuoi-22": makeClassicPreset("#111827", "#6b7280", "#e5e7eb"),
  "thiep-cuoi-25": makeNaturePreset("#bbf7d0", "#14532d", "#86efac"),
  "thiep-cuoi-54": makeLuxuryPreset("#c9a84c", "#fef3c7", "─── ✦ ───"),
  "thiep-cuoi-60": makeLuxuryPreset("#e5c678", "#fffbeb", "✦ ────── ✦"),
  "thiep-cuoi-13": makeTraditionalPreset("#dc2626", "#7f1d1d", "#fbbf24"),
  "thiep-cuoi-26": makeTraditionalPreset("#dc2626", "#881337", "#fbbf24"),
  "thiep-cuoi-29": makeTraditionalPreset("#b91c1c", "#7f1d1d", "#f59e0b"),
  "thiep-cuoi-27": makeTraditionalPreset("#be123c", "#7f1d1d", "#d97706"),

  // ── BIRTHDAY (6) — uses Nature layout (bright, organic) ──
  "thiep-sinh-nhat-01": makeNaturePreset("#fda4af", "#be185d", "#f472b6"),
  "thiep-sinh-nhat-06": makeNaturePreset("#c4b5fd", "#5b21b6", "#a78bfa"),
  "thiep-sinh-nhat-05": makeNaturePreset("#fde68a", "#92400e", "#fbbf24"),
  "thiep-sinh-nhat-02": makeNaturePreset("#fca5a5", "#9f1239", "#f87171"),
  "thiep-sinh-nhat-04": makeNaturePreset("#bfdbfe", "#1e40af", "#93c5fd"),
  "thiep-sinh-nhat-03": makeNaturePreset("#fde68a", "#78350f", "#fbbf24"),

  // ── GRADUATION (3) — uses Modern layout ──
  "thiep-tot-nghiep-1": makeModernPreset("#1e3a5f", "#2d5a8e", "#bfdbfe"),
  "thiep-tot-nghiep-3": makeModernPreset("#1a1a2e", "#374151", "#c7d2fe"),
  "thiep-tot-nghiep-2": makeModernPreset("#14532d", "#166534", "#bbf7d0"),

  // ── EVENTS ──
  "thiep-ky-yeu-mau1": makeModernPreset("#1e3a5f", "#374151", "#bfdbfe"),
  "thiep-ky-yeu-mau2": makeClassicPreset("#312e81", "#4338ca", "#c7d2fe"),
  "thiep-tan-gia-1": makeTraditionalPreset("#dc2626", "#7f1d1d", "#fbbf24"),
  "thiep-tan-gia-2": makeNaturePreset("#fde68a", "#92400e", "#fbbf24"),
  "thiep-valentine-1": makeRomanticPreset(
    "#fda4af",
    "#be185d",
    "#f472b6",
    "'Great Vibes', cursive",
    "♥ ────── ♥",
  ),
  "tiec-tat-nien-3": makeLuxuryPreset("#d4a574", "#fef3c7", "✦ ───── ✦"),
  "thiep-tat-nien-4": makeLuxuryPreset("#c9a84c", "#fef3c7", "✦ ══════ ✦"),
  "tiec-tat-nien-1": makeLuxuryPreset("#b8860b", "#fef9e7", "✦ ────── ✦"),

  // ── DEMO ELEGANT — CineLove 36 clone ──
  "demo-elegant": [
    txt(
      "txt-quote",
      30,
      40,
      360,
      80,
      "I love three things in this world.\nSun, moon and you.\nSun for morning, moon for night,\nand you forever.",
      {
        size: 14,
        font: "'Cormorant Garamond', Georgia, serif",
        color: "#8b7e6a",
        italic: true,
        opacity: 0.55,
        lineHeight: 1.7,
      },
    ),
    img("img-hero-left", 0, 160, 207, 530, {
      radius: 0,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500&h=700&fit=crop&crop=faces",
    }),
    img("img-hero-right", 213, 160, 207, 530, {
      radius: 0,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1519741497674-611481863552?w=500&h=700&fit=crop&crop=faces",
    }),
    txt("txt-bride", 20, 740, 380, 50, "Mai Anh", {
      size: 42,
      font: "'Great Vibes', 'Dancing Script', cursive",
      color: "#2c2417",
      lineHeight: 1.2,
    }),
    txt("txt-amp", 20, 800, 380, 40, "&", {
      size: 36,
      font: "'Great Vibes', 'Dancing Script', cursive",
      color: "#8b7e6a",
      italic: true,
      opacity: 0.5,
      lineHeight: 1.2,
    }),
    txt("txt-groom", 20, 850, 380, 50, "Minh Quân", {
      size: 42,
      font: "'Great Vibes', 'Dancing Script', cursive",
      color: "#2c2417",
      lineHeight: 1.2,
    }),
    txt(
      "txt-poem1",
      30,
      960,
      360,
      100,
      "Đời dài muôn mảnh bình yên\nEm mang lãng mạn dịu hiền bước qua.\nSáng ngời dáng ngọc ngọc ngà\nCùng anh sánh bước chan hòa trọn đời.",
      {
        size: 18,
        font: "'Dancing Script', 'Great Vibes', cursive",
        color: "#5c4f3d",
        opacity: 0.85,
        lineHeight: 1.8,
      },
    ),
    img("img-photo1", 0, 1150, 420, 320, {
      radius: 8,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&fit=crop",
    }),
    txt(
      "txt-invite",
      30,
      1780,
      360,
      100,
      "Mời bạn tới dự lễ thành hôn\ncủa chúng mình\nĐể cùng chứng kiến khoảnh khắc\nthiêng liêng nhất",
      {
        size: 18,
        font: "'Dancing Script', 'Great Vibes', cursive",
        color: "#5c4f3d",
        lineHeight: 1.7,
      },
    ),
    txt("txt-day", 60, 2020, 300, 80, "15", {
      size: 72,
      font: "'Playfair Display', Georgia, serif",
      color: "#2c2417",
      weight: "bold",
      lineHeight: 1,
    }),
    txt("txt-weekday", 60, 2105, 300, 25, "Chủ Nhật", {
      size: 15,
      font: "'Cormorant Garamond', Georgia, serif",
      color: "#8b7e6a",
      opacity: 0.6,
      lineHeight: 1.2,
    }),
    txt("txt-time", 60, 2140, 140, 20, "10:00 AM", {
      size: 13,
      font: "'Cormorant Garamond', Georgia, serif",
      color: "#8b7e6a",
      opacity: 0.7,
    }),
    txt("txt-month", 160, 2140, 100, 20, "Tháng 6", {
      size: 13,
      font: "'Cormorant Garamond', Georgia, serif",
      color: "#8b7e6a",
      opacity: 0.7,
    }),
    txt("txt-year", 260, 2140, 100, 20, "2026", {
      size: 13,
      font: "'Cormorant Garamond', Georgia, serif",
      color: "#8b7e6a",
      opacity: 0.7,
    }),
    txt("txt-addr-label", 20, 2320, 380, 25, "A D D R E S S", {
      size: 12,
      font: "'Cormorant Garamond', Georgia, serif",
      color: "#8b7e6a",
      opacity: 0.5,
    }),
    txt("txt-venue", 20, 2350, 380, 30, "Trung tâm Tiệc cưới Cinelove", {
      size: 20,
      font: "'Playfair Display', Georgia, serif",
      color: "#2c2417",
      weight: "600",
    }),
    img("img-photo2", 0, 2460, 420, 560, {
      radius: 0,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&fit=crop",
    }),
    txt(
      "txt-en-quote",
      40,
      3120,
      340,
      70,
      "LOVE AND FREEDOM\nYOU AND\nGENTLENESS",
      {
        size: 20,
        font: "'Cormorant Garamond', Georgia, serif",
        color: "#8b7e6a",
        opacity: 0.5,
        lineHeight: 1.5,
      },
    ),
    txt(
      "txt-poem2",
      30,
      3280,
      360,
      60,
      "Đời này quý giá vô ngần\nCó anh chung bước, muôn phần đẹp tươi.",
      {
        size: 18,
        font: "'Dancing Script', 'Great Vibes', cursive",
        color: "#5c4f3d",
        opacity: 0.85,
        lineHeight: 1.8,
      },
    ),
    img("img-photo3", 0, 3450, 420, 560, {
      radius: 0,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1544078751-58fee2d8a03b?w=800&fit=crop",
    }),
    txt(
      "txt-detail",
      30,
      4930,
      360,
      140,
      "Xin vui lòng xác nhận trước với chúng mình\nsố lượng người tham dự để tiện sắp xếp chỗ ngồi.\n\nNếu có việc bận đột xuất không thể đến được,\nmong bạn báo trước.\n\nHẹn gặp bạn tại đám cưới nhé~",
      {
        size: 14,
        font: "'Cormorant Garamond', Georgia, serif",
        color: "#5c4f3d",
        opacity: 0.85,
        lineHeight: 1.7,
      },
    ),
    img("img-photo4", 0, 5200, 420, 560, {
      radius: 0,
      borderWidth: 0,
      borderColor: "transparent",
      src: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&fit=crop",
    }),
    txt(
      "txt-closing",
      30,
      6720,
      360,
      100,
      "Non sông một chặng đường dài\nBa sinh hữu hạnh, duyên này thành đôi.\nTiệc vui ngắn ngủi mà thôi\nNếu điều sơ suất, mong người lượng thương.",
      {
        size: 18,
        font: "'Dancing Script', 'Great Vibes', cursive",
        color: "#5c4f3d",
        opacity: 0.85,
        lineHeight: 1.8,
      },
    ),
    txt("txt-thankyou", 20, 7200, 380, 50, "THANK YOU", {
      size: 36,
      font: "'Great Vibes', 'Dancing Script', cursive",
      color: "#8b7e6a",
      opacity: 0.5,
      lineHeight: 1.2,
    }),
  ],
};

// ═══════════════════════════════════════════════════════════════════
// TEMPLATE DEFAULT MUSIC ASSIGNMENTS (Sprint 53 • Tone-Matched Audio)
// ═══════════════════════════════════════════════════════════════════

export interface TemplateMusicAssignment {
  musicId: string;
  musicName: string;
  musicUrl: string;
}

export const TEMPLATE_DEFAULT_MUSIC: Record<string, TemplateMusicAssignment> = {
  // ── TOP 20 BESPOKE UNIQUE LAYOUTS (Sprint 52 • CineLove Parity 90%+) ──
  "thiep-cuoi-42": {
    musicId: "m3",
    musicName: "Lời Tỏ Tình Ngọt Ngào",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m3.mp3",
  },
  "thiep-cuoi-39": {
    musicId: "m33",
    musicName: "Canon in D — Pachelbel",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m33.mp3",
  },
  "thiep-cuoi-46": {
    musicId: "m31",
    musicName: "Cherry Blossom Romance",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m31.mp3",
  },
  "thiep-cuoi-38": {
    musicId: "m20",
    musicName: "Soft Acoustic Love",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m20.mp3",
  },
  "thiep-cuoi-36": {
    musicId: "m36",
    musicName: "Liebestraum — Liszt",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m36.mp3",
  },
  "thiep-cuoi-44": {
    musicId: "m27",
    musicName: "Moonlit Piano",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m27.mp3",
  },
  "thiep-cuoi-40": {
    musicId: "m24",
    musicName: "Elegant Piano Melody",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m24.mp3",
  },
  "thiep-cuoi-16": {
    musicId: "m19",
    musicName: "Sweet Guitar Morning",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m19.mp3",
  },
  "thiep-cuoi-47": {
    musicId: "m6",
    musicName: "Hạnh Phúc Trọn Vẹn",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m6.mp3",
  },
  "thiep-cuoi-48": {
    musicId: "m11",
    musicName: "Marry Me — Ballad",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m11.mp3",
  },
  "thiep-cuoi-19": {
    musicId: "m23",
    musicName: "Dreamy Piano",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m23.mp3",
  },
  "thiep-cuoi-tone-xanh": {
    musicId: "m18",
    musicName: "Gentle Fingerstyle",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m18.mp3",
  },
  "thiep-cuoi-2": {
    musicId: "m8",
    musicName: "A Thousand Years",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m8.mp3",
  },
  "thiep-cuoi-4": {
    musicId: "m37",
    musicName: "Wedding March — Mendelssohn",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m37.mp3",
  },
  "thiep-cuoi-5": {
    musicId: "m28",
    musicName: "Korean Wedding Ballad",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m28.mp3",
  },
  "thiep-cuoi-23": {
    musicId: "m26",
    musicName: "Tender Piano Notes",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m26.mp3",
  },
  "thiep-cuoi-8": {
    musicId: "m17",
    musicName: "Romantic Guitar Serenade",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m17.mp3",
  },
  "thiep-cuoi-53": {
    musicId: "m13",
    musicName: "Beautiful In White",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m13.mp3",
  },
  "thiep-cuoi-28": {
    musicId: "m37",
    musicName: "Wedding March — Mendelssohn",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m37.mp3",
  },
  "thiep-cuoi-11": {
    musicId: "m28",
    musicName: "Korean Wedding Ballad",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m28.mp3",
  },
  "thiep-cuoi-49": {
    musicId: "m15",
    musicName: "All of Me — Piano",
    musicUrl: "https://assets.7app.online/audio/wedding-tracks/m15.mp3",
  },
};

export function getDefaultMusicForTemplate(templateSlug: string): TemplateMusicAssignment {
  return (
    TEMPLATE_DEFAULT_MUSIC[templateSlug] ?? {
      musicId: "m1",
      musicName: "Tình Yêu Mãi Mãi (Wedding)",
      musicUrl: "https://assets.7app.online/audio/wedding-tracks/m1.mp3",
    }
  );
}

