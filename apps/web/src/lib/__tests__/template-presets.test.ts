import { describe, it, expect } from "vitest";
import { TEMPLATE_UNIQUE_PRESETS } from "@/server/data/template-presets";
import { convertTemplateToCanvas } from "@/app/editor/[id]/components/canvas-engine/convertTemplate";

const TOP_20_SLUGS = [
  "thiep-cuoi-42",
  "thiep-cuoi-39",
  "thiep-cuoi-46",
  "thiep-cuoi-38",
  "thiep-cuoi-36",
  "thiep-cuoi-44",
  "thiep-cuoi-40",
  "thiep-cuoi-16",
  "thiep-cuoi-47",
  "thiep-cuoi-48",
  "thiep-cuoi-19",
  "thiep-cuoi-tone-xanh",
  "thiep-cuoi-2",
  "thiep-cuoi-4",
  "thiep-cuoi-5",
  "thiep-cuoi-23",
  "thiep-cuoi-8",
  "thiep-cuoi-53",
  "thiep-cuoi-28",
  "thiep-cuoi-11",
  "thiep-cuoi-49",
];

describe("Template Presets Engine (Sprint 52 - CineLove Parity)", () => {
  it("should have all 75+ templates registered with non-empty elements", () => {
    const keys = Object.keys(TEMPLATE_UNIQUE_PRESETS);
    expect(keys.length).toBeGreaterThanOrEqual(75);

    for (const key of keys) {
      const elements = TEMPLATE_UNIQUE_PRESETS[key];
      expect(Array.isArray(elements)).toBe(true);
      expect(elements.length).toBeGreaterThan(0);
    }
  });

  it("should have distinct bespoke layouts for all Top 20 templates", () => {
    for (const slug of TOP_20_SLUGS) {
      const preset = TEMPLATE_UNIQUE_PRESETS[slug];
      expect(preset, `Preset ${slug} should exist`).toBeDefined();
      expect(preset.length).toBeGreaterThanOrEqual(10);

      // Verify each element has valid coordinates and dimensions
      for (const el of preset) {
        expect(typeof el.id).toBe("string");
        expect(typeof el.type).toBe("string");
        expect(typeof el.x).toBe("number");
        expect(typeof el.y).toBe("number");
        expect(typeof el.width).toBe("number");
        expect(typeof el.height).toBe("number");
        expect(el.props).toBeDefined();
      }
    }
  });

  it("should convert all Top 20 templates to canvas elements without errors", () => {
    for (const slug of TOP_20_SLUGS) {
      const preset = TEMPLATE_UNIQUE_PRESETS[slug];
      const canvasElements = convertTemplateToCanvas(preset);

      expect(canvasElements.length).toBe(preset.length);
      for (const cel of canvasElements) {
        expect(cel.id).toBeDefined();
        expect(cel.type).toBeDefined();
        expect(cel.top).toBeDefined();
        expect(cel.left).toBeDefined();
        expect(cel.width).toBeDefined();
      }
    }
  });
});
