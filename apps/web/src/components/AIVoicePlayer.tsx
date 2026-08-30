"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface AIVoicePlayerProps {
  initialScript?: string;
  groomName?: string;
  brideName?: string;
  weddingDate?: string;
  venue?: string;
  editable?: boolean;
  accentColor?: string;
  title?: string;
  onScriptChange?: (script: string) => void;
}

export function AIVoicePlayer({
  initialScript,
  groomName = "Chú Rể",
  brideName = "Cô Dâu",
  weddingDate = "2026-10-20",
  venue = "Trung tâm tiệc cưới",
  editable = false,
  accentColor = "#d97706",
  title = "🎙️ Lời Dẫn Thiệp Cưới AI",
  onScriptChange,
}: AIVoicePlayerProps) {
  const defaultText = `Chào mừng quý khách đến với thiệp cưới của ${groomName} và ${brideName}. Chúng tôi vô cùng trân trọng tình cảm và kính mời quý vị đến chung vui trong ngày hạnh phúc ${weddingDate} tại ${venue}. Chân thành cảm ơn quý khách!`;

  const [script, setScript] = useState(initialScript || defaultText);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Load available speech voices
  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      const avail = window.speechSynthesis.getVoices();
      if (avail.length > 0) {
        setVoices(avail);
        // Find Vietnamese voice or default
        const viIndex = avail.findIndex(
          (v) => v.lang.includes("vi") || v.lang.includes("VI") || v.name.toLowerCase().includes("vietnamese")
        );
        if (viIndex >= 0) {
          setSelectedVoiceIndex(viIndex);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stopAudio = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const playAudio = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Trình duyệt của bạn chưa hỗ trợ tính năng Speech Synthesis.");
      return;
    }

    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(script);
    utter.rate = rate;
    utter.pitch = pitch;

    if (voices.length > 0 && voices[selectedVoiceIndex]) {
      utter.voice = voices[selectedVoiceIndex];
      utter.lang = voices[selectedVoiceIndex].lang || "vi-VN";
    } else {
      utter.lang = "vi-VN";
    }

    utter.onstart = () => setIsPlaying(true);
    utter.onend = () => setIsPlaying(false);
    utter.onerror = () => setIsPlaying(false);

    utteranceRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [script, rate, pitch, voices, selectedVoiceIndex]);

  const togglePlay = () => {
    if (isPlaying) {
      stopAudio();
    } else {
      playAudio();
    }
  };

  // Generate AI Script
  const handleGenerateScript = async (style: "romantic" | "formal" | "modern" = "romantic") => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/voice-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName,
          brideName,
          weddingDate,
          venue,
          style,
        }),
      });
      const data = await res.json();
      if (data?.data?.fullScript) {
        setScript(data.data.fullScript);
        onScriptChange?.(data.data.fullScript);
      }
    } catch (err) {
      console.error("Failed to generate AI script:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fafafa 100%)",
        borderRadius: 20,
        padding: "20px 24px",
        border: "1px solid #e5e7eb",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        position: "relative",
      }}
    >
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              color: accentColor,
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              background: "#ecfdf5",
              color: "#059669",
              padding: "2px 8px",
              borderRadius: 12,
            }}
          >
            AI Narration
          </span>
        </div>

        {/* Action button to view/edit script */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            fontWeight: 600,
            color: "#6b7280",
            cursor: "pointer",
            textDecoration: "underline",
          }}
        >
          {editable ? "✏️ Chỉnh sửa lời dẫn" : "📜 Xem lời dẫn"}
        </button>
      </div>

      {/* Waveform Bar & Play Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#f8fafc",
          padding: "12px 18px",
          borderRadius: 16,
          border: "1px solid #e2e8f0",
        }}
      >
        {/* Play/Pause Main Circular Button */}
        <button
          onClick={togglePlay}
          style={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: isPlaying
              ? "linear-gradient(135deg, #ef4444, #dc2626)"
              : `linear-gradient(135deg, ${accentColor}, #b45309)`,
            border: "none",
            color: "#fff",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            boxShadow: "0 4px 14px rgba(0,0,0,0.15)",
            transition: "transform 0.15s ease",
            flexShrink: 0,
          }}
          title={isPlaying ? "Dừng đọc" : "Phát lời dẫn"}
        >
          {isPlaying ? "⏹" : "▶"}
        </button>

        {/* Audio Waveform Bars Simulation */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            gap: 3,
            height: 36,
            overflow: "hidden",
          }}
        >
          {Array.from({ length: 28 }).map((_, i) => {
            const barHeight = isPlaying
              ? Math.sin(i * 0.4 + Date.now() * 0.005) * 14 + 18
              : (i % 4) * 4 + 6;
            return (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${barHeight}px`,
                  background: isPlaying ? accentColor : "#cbd5e1",
                  borderRadius: 4,
                  transition: "height 0.2s ease, background 0.2s ease",
                }}
              />
            );
          })}
        </div>

        {/* Speed Selector (0.9x / 1.0x / 1.15x) */}
        <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
          {[0.9, 1.0, 1.15].map((s) => (
            <button
              key={s}
              onClick={() => setRate(s)}
              style={{
                background: rate === s ? accentColor : "#e2e8f0",
                color: rate === s ? "#fff" : "#475569",
                border: "none",
                padding: "4px 8px",
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>

      {/* Short Preview text */}
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: "#4b5563",
          lineHeight: 1.5,
          fontStyle: "italic",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        "{script}"
      </p>

      {/* Script Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 28,
              maxWidth: 480,
              width: "100%",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#1f2937" }}>
                🎙️ Kịch Bản Lời Dẫn Thiệp Cưới
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer" }}
              >
                ✕
              </button>
            </div>

            {editable ? (
              <textarea
                value={script}
                onChange={(e) => {
                  setScript(e.target.value);
                  onScriptChange?.(e.target.value);
                }}
                rows={5}
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #cbd5e1",
                  fontSize: 14,
                  lineHeight: 1.5,
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            ) : (
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: "#374151",
                  background: "#f8fafc",
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                }}
              >
                {script}
              </p>
            )}

            {/* Quick AI Presets Generator buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#6b7280" }}>
                Tạo nhanh với AI:
              </span>
              <button
                disabled={isGenerating}
                onClick={() => handleGenerateScript("romantic")}
                style={{
                  background: "#fdf2f8",
                  color: "#db2777",
                  border: "1px solid #fbcfe8",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🌹 Lãng mạn
              </button>
              <button
                disabled={isGenerating}
                onClick={() => handleGenerateScript("formal")}
                style={{
                  background: "#fefce8",
                  color: "#ca8a04",
                  border: "1px solid #fef08a",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                👑 Trang trọng
              </button>
              <button
                disabled={isGenerating}
                onClick={() => handleGenerateScript("modern")}
                style={{
                  background: "#eff6ff",
                  color: "#2563eb",
                  border: "1px solid #bfdbfe",
                  padding: "6px 12px",
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                ✨ Trẻ trung
              </button>
            </div>

            {/* Voice Tone Selector (if available) */}
            {voices.length > 0 && (
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                  Chọn chất giọng thiết bị:
                </label>
                <select
                  value={selectedVoiceIndex}
                  onChange={(e) => setSelectedVoiceIndex(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    borderRadius: 8,
                    border: "1px solid #cbd5e1",
                    fontSize: 13,
                    outline: "none",
                  }}
                >
                  {voices.map((v, idx) => (
                    <option key={idx} value={idx}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowModal(false);
                  playAudio();
                }}
                style={{
                  flex: 1,
                  background: `linear-gradient(135deg, ${accentColor}, #b45309)`,
                  color: "#fff",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                ▶ Nghe Thử Ngay
              </button>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  border: "none",
                  padding: "12px 18px",
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Xong
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
