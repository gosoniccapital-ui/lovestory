/**
 * AI Voice Narration Script Generation Service
 * Generates emotional, ceremonial spoken wedding invitation narration.
 * Uses Google Gemini 2.5 Flash with rich Vietnamese cultural fallbacks.
 */

interface CoupleVoiceInfo {
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  venue?: string;
  howWeMet?: string;
  style?: "romantic" | "formal" | "modern";
}

interface VoiceScriptOutput {
  intro: string;
  storySegment: string;
  invitationCall: string;
  fullScript: string;
  estimatedDurationSeconds: number;
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

function buildVoicePrompt(info: CoupleVoiceInfo): string {
  const groom = info.groomName || "Chú rể";
  const bride = info.brideName || "Cô dâu";
  const date = info.weddingDate || "ngày trọng đại sắp tới";
  const venue = info.venue || "trung tâm tiệc cưới";
  const story = info.howWeMet || "Hành trình tình yêu đong đầy cảm xúc";
  const style = info.style || "romantic";

  return `Bạn là một phát thanh viên (Voice Talent) đám cưới chuyên nghiệp với chất giọng ấm áp, truyền cảm và sang trọng.
Hãy viết LỜI DẪN THOẠI ĐỌC (Voice-over Narration Script) cho thiệp cưới online của cặp đôi:
- Chú rể: ${groom}
- Cô dâu: ${bride}
- Ngày cưới: ${date}
- Địa điểm: ${venue}
- Câu chuyện: ${story}
- Phong cách: ${style} (romantic = lãng mạn nhẹ nhàng, formal = trang trọng quý phái, modern = tươi vui ấm áp)

YÊU CẦU:
1. Lời dẫn dùng để ĐỌC THÀNH TIẾNG (Voice narration), câu văn nhịp nhàng, từ ngữ gợi cảm xúc, dễ nghe, không dùng ký tự lạ hay bullet points.
2. Độ dài khoảng 80-120 từ, vừa vặn đọc trong 35-50 giây.
3. Trả về DUY NHẤT một JSON object (không markdown hay text thừa) theo format:
{
  "intro": "Câu mở đầu chào mừng quý khách mời và giới thiệu ngày hạnh phúc",
  "storySegment": "Đoạn văn ngắn 2-3 câu tôn vinh tình yêu và hành trình bên nhau của hai bạn",
  "invitationCall": "Lời mời trân trọng kính mời quý khách đến chung vui tại thời gian, địa điểm",
  "fullScript": "Toàn bộ đoạn văn liền mạch để máy tự động đọc (bao gồm intro, storySegment và invitationCall)",
  "estimatedDurationSeconds": 40
}`;
}

function getDefaultVoiceScript(info: CoupleVoiceInfo): VoiceScriptOutput {
  const groom = info.groomName || "Minh";
  const bride = info.brideName || "Hoa";
  const date = info.weddingDate || "ngày hạnh phúc";
  const venue = info.venue || "sảnh tiệc ấm cúng";

  const intro = `Chào mừng quý vị đến với không gian tình yêu của ${groom} và ${bride}.`;
  const storySegment = `Tình yêu không chỉ là những tháng ngày cùng nhau chia sẻ nụ cười, mà còn là lời hứa nắm tay nhau đi qua mọi thăng trầm của cuộc đời.`;
  const invitationCall = `Chúng tôi xin trân trọng kính mời quý khách đến tham dự lễ thành hôn vào ${date} tại ${venue}, để cùng chúc phúc cho khởi đầu trọn vẹn này.`;

  return {
    intro,
    storySegment,
    invitationCall,
    fullScript: `${intro} ${storySegment} ${invitationCall}`,
    estimatedDurationSeconds: 40,
  };
}

export async function generateVoiceScript(
  info: CoupleVoiceInfo
): Promise<VoiceScriptOutput> {
  if (!GEMINI_API_KEY) {
    return getDefaultVoiceScript(info);
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: buildVoicePrompt(info) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 600,
        },
      }),
    });

    if (!response.ok) {
      return getDefaultVoiceScript(info);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return getDefaultVoiceScript(info);
    }

    const parsed = JSON.parse(jsonMatch[0]) as VoiceScriptOutput;
    if (!parsed.fullScript) {
      return getDefaultVoiceScript(info);
    }

    return parsed;
  } catch (err) {
    console.error("AI Voice script generation error:", err);
    return getDefaultVoiceScript(info);
  }
}
