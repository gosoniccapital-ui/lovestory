import { NextResponse } from "next/server";
import { generateVoiceScript } from "@/server/services/ai-voice-script";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const rl = checkRateLimit(`ai-voice-script:${ip}`, {
      limit: 15,
      windowSec: 60,
    });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Quá nhiều yêu cầu, vui lòng thử lại sau giây lát." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { groomName, brideName, weddingDate, venue, howWeMet, style } = body;

    const result = await generateVoiceScript({
      groomName,
      brideName,
      weddingDate,
      venue,
      howWeMet,
      style,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Voice script generation endpoint error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate voice script" },
      { status: 500 }
    );
  }
}
