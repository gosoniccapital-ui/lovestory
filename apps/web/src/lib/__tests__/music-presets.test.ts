import { describe, it, expect } from "vitest";
import {
  MUSIC_PRESETS,
  getMusicPresetById,
  getMusicPresetsByCategory,
} from "@/app/editor/[id]/components/editor-constants/music-presets";
import {
  TEMPLATE_DEFAULT_MUSIC,
  getDefaultMusicForTemplate,
} from "@/server/data/template-presets";

describe("Sprint 53 — Dynamic Music Player & R2 Audio Suite", () => {
  it("should have exactly 40 unique wedding audio presets with valid R2 CDN URLs", () => {
    expect(MUSIC_PRESETS).toHaveLength(40);

    const ids = new Set<string>();
    const urls = new Set<string>();

    for (const track of MUSIC_PRESETS) {
      // Unique ID
      expect(ids.has(track.id)).toBe(false);
      ids.add(track.id);

      // Unique URL
      expect(urls.has(track.url)).toBe(false);
      urls.add(track.url);

      // Must be valid CDN or streamable URL
      expect(track.url).toMatch(/^https:\/\/assets\.7app\.online\/audio\/wedding-tracks\/m\d+\.mp3$/);

      // Required fields
      expect(track.label.length).toBeGreaterThan(0);
      expect(track.emoji.length).toBeGreaterThan(0);
      expect(track.duration).toMatch(/^\d{2}:\d{2}$/);
      expect(["intl", "vpop", "acoustic", "piano", "kpop", "classical"]).toContain(track.cat);
    }
  });

  it("should query music presets by ID and category correctly", () => {
    const track1 = getMusicPresetById("m1");
    expect(track1).toBeDefined();
    expect(track1?.label).toContain("Tình Yêu Mãi Mãi");

    const vpopTracks = getMusicPresetsByCategory("vpop");
    expect(vpopTracks.length).toBeGreaterThanOrEqual(7);
    expect(vpopTracks.every((t) => t.cat === "vpop")).toBe(true);

    const allTracks = getMusicPresetsByCategory("all");
    expect(allTracks).toHaveLength(40);
  });

  it("should assign tone-matched default music to all top 20 Bespoke Layouts", () => {
    const bespokeSlugs = [
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

    expect(Object.keys(TEMPLATE_DEFAULT_MUSIC).length).toBeGreaterThanOrEqual(20);

    for (const slug of bespokeSlugs) {
      const assignment = TEMPLATE_DEFAULT_MUSIC[slug];
      expect(assignment).toBeDefined();
      expect(assignment.musicId).toMatch(/^m\d+$/);
      expect(assignment.musicName.length).toBeGreaterThan(0);
      expect(assignment.musicUrl).toMatch(/^https:\/\/assets\.7app\.online\/audio\/wedding-tracks\/m\d+\.mp3$/);

      const helperResult = getDefaultMusicForTemplate(slug);
      expect(helperResult.musicId).toBe(assignment.musicId);
      expect(helperResult.musicUrl).toBe(assignment.musicUrl);
    }
  });

  it("should return fallback default music for unknown template slugs", () => {
    const fallback = getDefaultMusicForTemplate("unknown-template-slug");
    expect(fallback.musicId).toBe("m1");
    expect(fallback.musicUrl).toContain("m1.mp3");
  });
});
