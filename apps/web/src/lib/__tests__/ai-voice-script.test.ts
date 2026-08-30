import { describe, it, expect } from "vitest";
import { generateVoiceScript } from "@/server/services/ai-voice-script";

describe("AI Voice Script Generation Engine", () => {
  it("should generate a complete voice script with intro, story, call, and fullScript", async () => {
    const result = await generateVoiceScript({
      groomName: "Tuấn Minh",
      brideName: "Mai Lan",
      weddingDate: "28/05/2026",
      venue: "Trung Tâm Tiệc Cưới Sheraton Saigon",
      howWeMet: "Gặp nhau tại quán cafe chiều thu Hà Nội",
      style: "romantic",
    });

    expect(result).toBeDefined();
    expect(result.intro).toBeDefined();
    expect(result.storySegment).toBeDefined();
    expect(result.invitationCall).toBeDefined();
    expect(result.fullScript).toBeDefined();
    expect(result.fullScript.length).toBeGreaterThan(30);
    expect(result.estimatedDurationSeconds).toBeGreaterThan(10);
  });

  it("should fallback gracefully when empty info is provided", async () => {
    const result = await generateVoiceScript({});

    expect(result).toBeDefined();
    expect(result.fullScript).toContain("Chào mừng");
    expect(result.fullScript.length).toBeGreaterThan(20);
  });
});
