"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { trpc } from "@/lib/trpc/client";
import { playWelcomeChime, playErrorChime } from "@/lib/audio-chime";

export interface SeatingTable {
  id: string;
  name: string;
  capacity: number;
  zone: string;
  guestIds: string[];
}

interface Project {
  id: string;
  title: string;
  slug: string;
}

interface CheckInScannerAppProps {
  projects: Project[];
}

interface GuestItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  status: string;
  created_at: string;
}

export function CheckInScannerApp({ projects }: CheckInScannerAppProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || ""
  );
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGuest, setSelectedGuest] = useState<GuestItem | null>(null);
  const [checkInSuccessMsg, setCheckInSuccessMsg] = useState<string | null>(null);
  const [tables, setTables] = useState<SeatingTable[]>([]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // tRPC Queries & Mutations
  const utils = trpc.useUtils();
  const { data: guests = [] } = trpc.guest.listGuests.useQuery(
    { projectId: selectedProjectId },
    { enabled: Boolean(selectedProjectId) }
  );

  const checkInMutation = trpc.guest.checkInGuest.useMutation({
    onSuccess: (res) => {
      utils.guest.listGuests.invalidate({ projectId: selectedProjectId });
      playWelcomeChime();
      setCheckInSuccessMsg(`🎉 Đã check-in thành công: ${res.guest.name}`);
      setTimeout(() => setCheckInSuccessMsg(null), 4500);
      if (res.guest) {
        setSelectedGuest(res.guest);
      }
    },
    onError: (err) => {
      playErrorChime();
      alert(`Lỗi check-in: ${err.message}`);
    },
  });

  // Load seating tables from localStorage
  useEffect(() => {
    if (!selectedProjectId) return;
    try {
      const saved = localStorage.getItem(`lovestory_tables_${selectedProjectId}`);
      if (saved) {
        setTables(JSON.parse(saved));
      } else {
        setTables([
          { id: "tbl-1", name: "Bàn 1 - VIP Gia Đình", capacity: 10, zone: "Khu vực sân khấu", guestIds: [] },
          { id: "tbl-2", name: "Bàn 2 - Bạn Thân Dâu Rể", capacity: 10, zone: "Khu vực trung tâm", guestIds: [] },
          { id: "tbl-3", name: "Bàn 3 - Đồng Nghiệp Cty", capacity: 10, zone: "Khu vực trung tâm", guestIds: [] },
        ]);
      }
    } catch {
      // fallback
    }
  }, [selectedProjectId]);

  // Find seating table for a guest
  const getGuestTable = useCallback(
    (guestId: string) => {
      const found = tables.find((t) => t.guestIds?.includes(guestId));
      if (found) {
        return { tableName: found.name, zone: found.zone };
      }
      return { tableName: "Chưa xếp bàn", zone: "Tự do" };
    },
    [tables]
  );

  // Process raw scanned text from QR
  const handleScannedCode = useCallback(
    (rawText: string) => {
      if (!rawText) return;
      let targetGuestId = "";

      // Case 1: URL with ?guest=UUID
      if (rawText.includes("guest=")) {
        try {
          const url = new URL(rawText, window.location.origin);
          targetGuestId = url.searchParams.get("guest") || "";
        } catch {
          const match = rawText.match(/guest=([a-zA-Z0-9-]+)/);
          if (match) targetGuestId = match[1];
        }
      } else if (rawText.startsWith("LS-GUEST:")) {
        targetGuestId = rawText.replace("LS-GUEST:", "").trim();
      } else if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          rawText.trim()
        )
      ) {
        targetGuestId = rawText.trim();
      }

      // Look up guest in the current loaded list
      const matched = guests.find(
        (g) =>
          (targetGuestId && g.id === targetGuestId) ||
          (g.phone && g.phone === rawText.trim()) ||
          g.name.toLowerCase() === rawText.trim().toLowerCase()
      );

      if (matched) {
        setSelectedGuest(matched);
        if (matched.status !== "confirmed") {
          checkInMutation.mutate({
            projectId: selectedProjectId,
            guestId: matched.id,
          });
        } else {
          playWelcomeChime();
          setCheckInSuccessMsg(`✨ Khách mời ${matched.name} đã check-in trước đó.`);
          setTimeout(() => setCheckInSuccessMsg(null), 3000);
        }
      } else if (targetGuestId) {
        // Direct mutation attempt with backend
        checkInMutation.mutate({
          projectId: selectedProjectId,
          guestId: targetGuestId,
        });
      } else {
        playErrorChime();
        alert(`Không tìm thấy khách cho mã QR: "${rawText.slice(0, 30)}"`);
      }
    },
    [guests, selectedProjectId, checkInMutation]
  );

  // Start Camera Stream & QR Scanner Loop
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);

      // Check if native BarcodeDetector is available
      const HasBarcodeDetector = typeof window !== "undefined" && "BarcodeDetector" in window;
      let detector: any = null;
      if (HasBarcodeDetector) {
        try {
          // @ts-ignore
          detector = new window.BarcodeDetector({ formats: ["qr_code"] });
        } catch {
          detector = null;
        }
      }

      // Scanner polling interval
      if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = setInterval(async () => {
        if (!videoRef.current || videoRef.current.readyState < 2) return;

        if (detector) {
          try {
            const barcodes = await detector.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                handleScannedCode(code);
              }
            }
          } catch {
            // frame detection error
          }
        }
      }, 500);
    } catch (err: any) {
      setCameraError(
        err.name === "NotAllowedError"
          ? "Trình duyệt chưa được cấp quyền truy cập Camera. Vui lòng bật quyền trong cài đặt trình duyệt."
          : `Không thể mở Camera: ${err.message || "Thiết bị không hỗ trợ"}`
      );
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Filtered search list
  const filteredGuests = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return guests.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        (g.phone && g.phone.includes(q)) ||
        (g.email && g.email.toLowerCase().includes(q))
    );
  }, [guests, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const total = guests.length;
    const checkedIn = guests.filter((g) => g.status === "confirmed").length;
    const pending = total - checkedIn;
    const pct = total > 0 ? Math.round((checkedIn / total) * 100) : 0;
    return { total, checkedIn, pending, pct };
  }, [guests]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      {/* Top Banner & Project Selector */}
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)",
          borderRadius: 20,
          padding: "24px 28px",
          color: "#fff",
          boxShadow: "0 10px 25px -5px rgba(49, 46, 129, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 28 }}>📱</span>
            <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: -0.5 }}>
              Lễ Tân Check-in & Tra Cứu Bàn Tiệc
            </h2>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                background: "rgba(255,255,255,0.2)",
                padding: "3px 10px",
                borderRadius: 20,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              Live Reception
            </span>
          </div>
          <p style={{ fontSize: 14, color: "#c7d2fe", margin: 0 }}>
            Quét mã QR từ thiệp cưới của khách hoặc tìm kiếm theo tên / số điện thoại để tra cứu bàn và đón khách
          </p>
        </div>

        {/* Project Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <label style={{ fontSize: 13, color: "#e0e7ff", fontWeight: 600 }}>Thiệp cưới:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedGuest(null);
            }}
            style={{
              padding: "10px 16px",
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.95)",
              color: "#1e1b4b",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              outline: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                💌 {p.title || p.slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Success Notification Alert */}
      {checkInSuccessMsg && (
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#fff",
            padding: "14px 20px",
            borderRadius: 14,
            fontWeight: 700,
            fontSize: 15,
            display: "flex",
            alignItems: "center",
            gap: 12,
            boxShadow: "0 8px 20px rgba(16, 185, 129, 0.3)",
          }}
        >
          <span style={{ fontSize: 22 }}>🔔</span>
          <span>{checkInSuccessMsg}</span>
        </div>
      )}

      {/* Main Grid: Left = Camera Scanner & Manual Search, Right = Guest Card & Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 24 }}>
        {/* LEFT COLUMN: Camera & Search Input */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* CAMERA QR SCANNER BOX */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #e8e8ec",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", margin: 0 }}>
                📷 Camera Quét Mã QR
              </h3>
              {cameraActive && (
                <button
                  onClick={() => {
                    const next = facingMode === "environment" ? "user" : "environment";
                    setFacingMode(next);
                    stopCamera();
                    setTimeout(() => startCamera(), 200);
                  }}
                  style={{
                    background: "#f3f4f6",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  🔄 Đổi Camera ({facingMode === "environment" ? "Sau" : "Trước"})
                </button>
              )}
            </div>

            {/* Video Viewport */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: 280,
                background: "#0f172a",
                borderRadius: 16,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: cameraActive ? "block" : "none",
                }}
              />

              {/* Scanning Overlay Reticle */}
              {cameraActive && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div
                    style={{
                      width: 200,
                      height: 200,
                      border: "2px solid #ec4899",
                      borderRadius: 16,
                      boxShadow: "0 0 0 4000px rgba(0, 0, 0, 0.45)",
                      position: "relative",
                    }}
                  >
                    {/* Laser line anim */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        height: 2,
                        background: "linear-gradient(90deg, transparent, #f43f5e, #fb7185, transparent)",
                        boxShadow: "0 0 10px #f43f5e",
                        top: "50%",
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Inactive or Error State */}
              {!cameraActive && (
                <div style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>
                  <p style={{ fontSize: 44, margin: "0 0 12px" }}>📸</p>
                  <p style={{ fontSize: 14, margin: "0 0 16px", color: "#cbd5e1" }}>
                    Bật camera để tự động quét mã QR trên thiệp mời cưới
                  </p>
                  <button
                    onClick={startCamera}
                    style={{
                      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                      color: "#fff",
                      border: "none",
                      padding: "12px 24px",
                      borderRadius: 12,
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: "pointer",
                      boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)",
                    }}
                  >
                    🚀 Bật Camera Quét QR
                  </button>
                </div>
              )}
            </div>

            {cameraError && (
              <div
                style={{
                  marginTop: 12,
                  padding: "10px 14px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  color: "#b91c1c",
                  fontSize: 13,
                }}
              >
                ⚠️ {cameraError}
              </div>
            )}

            {cameraActive && (
              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={stopCamera}
                  style={{
                    background: "#fee2e2",
                    color: "#dc2626",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🛑 Tắt Camera
                </button>
              </div>
            )}
          </div>

          {/* MANUAL LIVE SEARCH INPUT */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #e8e8ec",
              boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            }}
          >
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#1f2937", margin: "0 0 12px" }}>
              🔍 Tra Cứu Thủ Công Nhanh
            </h3>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Nhập tên khách hoặc số điện thoại..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "14px 16px 14px 44px",
                  borderRadius: 12,
                  border: "1.5px solid #d1d5db",
                  fontSize: 15,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 16,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "#9ca3af",
                }}
              >
                🔎
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    fontSize: 16,
                    color: "#9ca3af",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Live Search Suggestions Dropdown */}
            {searchQuery.trim() && (
              <div
                style={{
                  marginTop: 10,
                  maxHeight: 240,
                  overflowY: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  background: "#fff",
                }}
              >
                {filteredGuests.length === 0 ? (
                  <div style={{ padding: "16px", textAlign: "center", color: "#9ca3af", fontSize: 14 }}>
                    Không tìm thấy khách mời nào khớp với từ khóa
                  </div>
                ) : (
                  filteredGuests.map((g) => {
                    const table = getGuestTable(g.id);
                    return (
                      <div
                        key={g.id}
                        onClick={() => {
                          setSelectedGuest(g);
                          setSearchQuery("");
                        }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: "1px solid #f3f4f6",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "background 0.15s",
                        }}
                      >
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#1e293b" }}>
                            {g.name}
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: "#64748b" }}>
                            {g.phone || g.email || "Chưa có SĐT"} • {table.tableName}
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "4px 10px",
                            borderRadius: 20,
                            background: g.status === "confirmed" ? "#ecfdf5" : "#f1f5f9",
                            color: g.status === "confirmed" ? "#059669" : "#64748b",
                          }}
                        >
                          {g.status === "confirmed" ? "Đã đến" : "Chưa check-in"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Selected Guest Check-in Card & Realtime Stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* STATS OVERVIEW WIDGET */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 20,
              border: "1px solid #e8e8ec",
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
              textAlign: "center",
            }}
          >
            <div style={{ padding: "12px 8px", background: "#f8fafc", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#64748b", fontWeight: 600 }}>
                Tổng khách mời
              </p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#1e293b" }}>
                {stats.total}
              </p>
            </div>
            <div style={{ padding: "12px 8px", background: "#ecfdf5", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#059669", fontWeight: 600 }}>
                Đã Check-in ({stats.pct}%)
              </p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#047857" }}>
                {stats.checkedIn}
              </p>
            </div>
            <div style={{ padding: "12px 8px", background: "#fff7ed", borderRadius: 12 }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, color: "#c2410c", fontWeight: 600 }}>
                Chưa đến
              </p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#ea580c" }}>
                {stats.pending}
              </p>
            </div>
          </div>

          {/* GUEST DETAIL & ACTION CARD */}
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 24,
              border: "1px solid #e8e8ec",
              boxShadow: "0 8px 30px rgba(0,0,0,0.06)",
              minHeight: 340,
              display: "flex",
              flexDirection: "column",
              justifyContent: selectedGuest ? "space-between" : "center",
            }}
          >
            {selectedGuest ? (
              (() => {
                const tableInfo = getGuestTable(selectedGuest.id);
                const isConfirmed = selectedGuest.status === "confirmed";
                return (
                  <div>
                    {/* Header */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 16,
                        borderBottom: "1px solid #f1f5f9",
                        paddingBottom: 16,
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            color: "#6366f1",
                          }}
                        >
                          THÔNG TIN KHÁCH MỜI
                        </span>
                        <h2 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 800, color: "#0f172a" }}>
                          {selectedGuest.name}
                        </h2>
                        <p style={{ margin: "2px 0 0", fontSize: 13, color: "#64748b" }}>
                          {selectedGuest.phone || "Không có SĐT"} • {selectedGuest.email || "Không có Email"}
                        </p>
                      </div>

                      <span
                        style={{
                          padding: "6px 14px",
                          borderRadius: 30,
                          fontSize: 13,
                          fontWeight: 700,
                          background: isConfirmed ? "#d1fae5" : "#fee2e2",
                          color: isConfirmed ? "#065f46" : "#991b1b",
                        }}
                      >
                        {isConfirmed ? "✅ ĐÃ CHECK-IN" : "⏳ CHƯA CHECK-IN"}
                      </span>
                    </div>

                    {/* Big Seating Table Highlight Card */}
                    <div
                      style={{
                        background: "linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)",
                        borderRadius: 16,
                        padding: 18,
                        marginBottom: 20,
                        border: "1.5px solid #d8b4fe",
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                      }}
                    >
                      <span style={{ fontSize: 36 }}>🪑</span>
                      <div>
                        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#7e22ce" }}>
                          VỊ TRÍ BÀN TIỆC ĐƯỢC XẾP
                        </p>
                        <h3 style={{ margin: "2px 0", fontSize: 18, fontWeight: 800, color: "#581c87" }}>
                          {tableInfo.tableName}
                        </h3>
                        <p style={{ margin: 0, fontSize: 13, color: "#6b21a8" }}>
                          Phân khu: <strong>{tableInfo.zone}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
                      {!isConfirmed ? (
                        <button
                          onClick={() => {
                            checkInMutation.mutate({
                              projectId: selectedProjectId,
                              guestId: selectedGuest.id,
                            });
                          }}
                          disabled={checkInMutation.isPending}
                          style={{
                            flex: 1,
                            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                            color: "#fff",
                            border: "none",
                            padding: "14px 20px",
                            borderRadius: 14,
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: "pointer",
                            boxShadow: "0 4px 15px rgba(16, 185, 129, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <span>✨</span>
                          <span>
                            {checkInMutation.isPending ? "Đang xử lý..." : "Xác Nhận Check-in Ngay"}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => playWelcomeChime()}
                          style={{
                            flex: 1,
                            background: "#f1f5f9",
                            color: "#334155",
                            border: "1px solid #cbd5e1",
                            padding: "14px 20px",
                            borderRadius: 14,
                            fontWeight: 700,
                            fontSize: 15,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <span>🔔</span>
                          <span>Phát Lại Chuông Đón Khách</span>
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedGuest(null)}
                        style={{
                          background: "#f8fafc",
                          color: "#64748b",
                          border: "1px solid #e2e8f0",
                          padding: "14px 18px",
                          borderRadius: 14,
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
                <span style={{ fontSize: 50, display: "block", marginBottom: 12 }}>💌</span>
                <h4 style={{ margin: "0 0 6px", fontSize: 17, fontWeight: 700, color: "#475569" }}>
                  Chưa chọn khách mời
                </h4>
                <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                  Quét mã QR từ camera hoặc nhập tìm kiếm ở ô bên trái để hiển thị thông tin bàn tiệc
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
