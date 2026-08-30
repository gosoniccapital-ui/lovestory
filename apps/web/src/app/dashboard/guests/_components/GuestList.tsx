"use client";

import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";

const STATUS_CONFIG = {
  pending: { label: "Chờ", color: "#6b7280", bg: "#f3f4f6" },
  invited: { label: "Đã mời", color: "#3b82f6", bg: "#eff6ff" },
  confirmed: { label: "Xác nhận", color: "#10b981", bg: "#ecfdf5" },
  declined: { label: "Từ chối", color: "#ef4444", bg: "#fef2f2" },
} as const;

type GuestStatus = keyof typeof STATUS_CONFIG;

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

interface GuestListProps {
  projects: Project[];
  appUrl: string;
}

export function GuestList({ projects, appUrl }: GuestListProps) {
  const [selectedProjectId, setSelectedProjectId] = useState(
    projects[0]?.id || "",
  );
  const [activeTab, setActiveTab] = useState<"guests" | "seating">("guests");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState("");
  // Sprint 43: batch import + bulk copy
  const [showBatchImport, setShowBatchImport] = useState(false);
  const [batchText, setBatchText] = useState("");
  const [batchImporting, setBatchImporting] = useState(false);
  const [bulkCopied, setBulkCopied] = useState(false);

  // Sprint 56: QR Check-in Modal State
  const [qrModalGuest, setQrModalGuest] = useState<{ id: string; name: string } | null>(null);

  // Sprint 55: Guest Seating Management State
  const [tables, setTables] = useState<SeatingTable[]>([]);
  const [newTableName, setNewTableName] = useState("");
  const [newTableCapacity, setNewTableCapacity] = useState(10);
  const [newTableZone, setNewTableZone] = useState("Khu vực trung tâm");
  const [showAddTable, setShowAddTable] = useState(false);

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

  const saveTables = (updatedTables: SeatingTable[]) => {
    setTables(updatedTables);
    if (selectedProjectId) {
      try {
        localStorage.setItem(`lovestory_tables_${selectedProjectId}`, JSON.stringify(updatedTables));
      } catch {
        // fallback
      }
    }
  };

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;
    const newTbl: SeatingTable = {
      id: `tbl-${Date.now()}`,
      name: newTableName.trim(),
      capacity: newTableCapacity || 10,
      zone: newTableZone || "Khu vực trung tâm",
      guestIds: [],
    };
    saveTables([...tables, newTbl]);
    setNewTableName("");
    setShowAddTable(false);
  };

  const handleDeleteTable = (tblId: string) => {
    saveTables(tables.filter((t) => t.id !== tblId));
  };

  const handleAssignGuest = (tblId: string, guestId: string) => {
    const updated = tables.map((t) => {
      // Remove from old table first if present
      const cleanGuestIds = t.guestIds.filter((id) => id !== guestId);
      if (t.id === tblId) {
        return { ...t, guestIds: [...cleanGuestIds, guestId] };
      }
      return { ...t, guestIds: cleanGuestIds };
    });
    saveTables(updated);
  };

  const handleUnassignGuest = (tblId: string, guestId: string) => {
    const updated = tables.map((t) => {
      if (t.id === tblId) {
        return { ...t, guestIds: t.guestIds.filter((id) => id !== guestId) };
      }
      return t;
    });
    saveTables(updated);
  };

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  const { data: guests = [], refetch } = trpc.guest.listGuests.useQuery(
    { projectId: selectedProjectId },
    { enabled: !!selectedProjectId },
  );

  const addGuest = trpc.guest.addGuest.useMutation({
    onSuccess: () => {
      setName("");
      setEmail("");
      setPhone("");
      setError("");
      refetch();
    },
    onError: (e) => setError(e.message),
  });

  const deleteGuest = trpc.guest.deleteGuest.useMutation({
    onSuccess: () => refetch(),
  });

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!selectedProjectId) return;
    addGuest.mutate({
      projectId: selectedProjectId,
      name: name.trim(),
      email,
      phone,
    });
  };

  const getGuestLink = (guestName: string) => {
    const slug = selectedProject?.slug;
    if (!slug) return "";
    return `${appUrl}/i/${slug}?guest=${encodeURIComponent(guestName)}`;
  };

  const copyLink = (guestName: string) => {
    const link = getGuestLink(guestName);
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(guestName);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  // Sprint 43: Batch import — one name per line
  const handleBatchImport = async () => {
    if (!batchText.trim() || !selectedProjectId) return;
    setBatchImporting(true);
    const names = batchText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    for (const gName of names) {
      try {
        await addGuest.mutateAsync({
          projectId: selectedProjectId,
          name: gName,
          email: "",
          phone: "",
        });
      } catch {
        /* skip duplicates */
      }
    }
    setBatchText("");
    setShowBatchImport(false);
    setBatchImporting(false);
    refetch();
  };

  // Sprint 43: Bulk copy all links
  const handleBulkCopy = () => {
    if (!selectedProject?.slug || guests.length === 0) return;
    const allLinks = guests
      .map((g: { name: string }) => `${g.name}: ${getGuestLink(g.name)}`)
      .join("\n");
    navigator.clipboard.writeText(allLinks).then(() => {
      setBulkCopied(true);
      setTimeout(() => setBulkCopied(false), 3000);
    });
  };

  // Sprint 43: Export CSV
  const handleExportCSV = () => {
    if (guests.length === 0) return;
    const header = "Tên,Email,SĐT,Trạng thái,Link thiệp\n";
    const rows = guests
      .map(
        (g: {
          name: string;
          email?: string | null;
          phone?: string | null;
          status: string;
        }) =>
          `"${g.name}","${g.email || ""}","${g.phone || ""}","${g.status}","${getGuestLink(g.name)}"`,
      )
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `guests_${selectedProject?.slug || "export"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sprint 43: Share via Zalo
  const shareZalo = (guestName: string) => {
    const link = getGuestLink(guestName);
    const text = `Thiệp mời cưới dành riêng cho ${guestName} 💌`;
    window.open(
      `https://zalo.me/share?url=${encodeURIComponent(link)}&title=${encodeURIComponent(text)}`,
      "_blank",
    );
  };

  // Sprint 43: Share via SMS
  const shareSMS = (guestName: string, guestPhone?: string | null) => {
    const link = getGuestLink(guestName);
    const text = `Thư mời cưới dành cho ${guestName}: ${link}`;
    window.open(`sms:${guestPhone || ""}?body=${encodeURIComponent(text)}`);
  };

  // Sprint 43: Share via Facebook
  const shareFB = (guestName: string) => {
    const link = getGuestLink(guestName);
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      "_blank",
    );
  };

  return (
    <div>
      {/* Project Selector */}
      {projects.length > 1 && (
        <div style={{ marginBottom: 24 }}>
          <label
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              display: "block",
              marginBottom: 8,
            }}
          >
            Thiệp:
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            style={{
              padding: "10px 16px",
              borderRadius: 10,
              border: "1px solid #e5e7eb",
              fontSize: 14,
              color: "#1f2937",
              background: "#fff",
              cursor: "pointer",
              minWidth: 240,
              outline: "none",
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title || p.slug}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Sprint 55: Tab Switcher (Guest List vs Seating Chart) */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: 12,
        }}
      >
        <button
          onClick={() => setActiveTab("guests")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: activeTab === "guests" ? "linear-gradient(135deg, #ff6b9d, #c084fc)" : "#f3f4f6",
            color: activeTab === "guests" ? "#ffffff" : "#4b5563",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: activeTab === "guests" ? "0 4px 12px rgba(255,107,157,0.25)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>👥</span> Danh sách khách mời ({guests.length})
        </button>
        <button
          onClick={() => setActiveTab("seating")}
          style={{
            padding: "10px 20px",
            borderRadius: 10,
            border: "none",
            background: activeTab === "seating" ? "linear-gradient(135deg, #e11d48, #be123c)" : "#f3f4f6",
            color: activeTab === "seating" ? "#ffffff" : "#4b5563",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: activeTab === "seating" ? "0 4px 12px rgba(225,29,72,0.25)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          <span>🍽️</span> Sơ đồ bàn tiệc & Chỗ ngồi ({tables.length} bàn)
        </button>

        <a
          href="/dashboard/check-in"
          style={{
            marginLeft: "auto",
            padding: "10px 18px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            color: "#ffffff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
          }}
        >
          <span>📱</span> Mở App Check-in Lễ Tân
        </a>
      </div>

      {/* ═══════ SEATING CHART VIEW (Sprint 55) ═══════ */}
      {activeTab === "seating" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginBottom: 28 }}>
          {/* Seating Stats Summary */}
          {(() => {
            const totalCapacity = tables.reduce((acc, t) => acc + t.capacity, 0);
            const totalSeated = tables.reduce((acc, t) => acc + t.guestIds.length, 0);
            const unassignedGuests = guests.filter((g: { id: string }) => !tables.some((t) => t.guestIds.includes(g.id)));

            return (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
                  <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e8e8ec" }}>
                    <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>Tổng số bàn tiệc</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#1f2937", marginTop: 4 }}>{tables.length} bàn</div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid rgba(16,185,129,0.3)" }}>
                    <div style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>Chỗ đã xếp</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#059669", marginTop: 4 }}>
                      {totalSeated} / {totalCapacity} ghế
                    </div>
                  </div>
                  <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #e8e8ec" }}>
                    <div style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>Chưa xếp bàn</div>
                    <div style={{ fontSize: 26, fontWeight: 800, color: "#d97706", marginTop: 4 }}>
                      {unassignedGuests.length} khách
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <button
                      onClick={() => setShowAddTable(!showAddTable)}
                      style={{
                        width: "100%",
                        padding: "14px 20px",
                        borderRadius: 12,
                        border: "none",
                        background: "linear-gradient(135deg, #e11d48, #be123c)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(225,29,72,0.2)",
                      }}
                    >
                      ➕ Thêm bàn tiệc mới
                    </button>
                  </div>
                </div>

                {/* Add Table Form */}
                {showAddTable && (
                  <form
                    onSubmit={handleAddTable}
                    style={{
                      background: "#fff",
                      borderRadius: 16,
                      padding: 20,
                      border: "1px solid #fed7aa",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}
                  >
                    <h4 style={{ fontSize: 14, fontWeight: 700, color: "#9a3412", margin: "0 0 12px" }}>
                      🪑 Tạo bàn tiệc mới
                    </h4>
                    <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr auto", gap: 12, alignItems: "end" }}>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                          Tên bàn tiệc *
                        </label>
                        <input
                          required
                          value={newTableName}
                          onChange={(e) => setNewTableName(e.target.value)}
                          placeholder="VD: Bàn 4 - Bạn Đại Học"
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13,
                            outline: "none",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                          Số ghế
                        </label>
                        <select
                          value={newTableCapacity}
                          onChange={(e) => setNewTableCapacity(Number(e.target.value))}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13,
                            background: "#fff",
                          }}
                        >
                          <option value={6}>6 ghế</option>
                          <option value={8}>8 ghế</option>
                          <option value={10}>10 ghế (Chuẩn)</option>
                          <option value={12}>12 ghế (Lớn)</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", display: "block", marginBottom: 4 }}>
                          Khu vực
                        </label>
                        <select
                          value={newTableZone}
                          onChange={(e) => setNewTableZone(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            fontSize: 13,
                            background: "#fff",
                          }}
                        >
                          <option value="Khu vực sân khấu (VIP)">Khu vực sân khấu (VIP)</option>
                          <option value="Khu vực trung tâm">Khu vực trung tâm</option>
                          <option value="Khu vực ban công / Ngoài trời">Khu vực ngoài trời</option>
                          <option value="Khu vực cửa đón khách">Khu vực cửa đón khách</option>
                        </select>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          type="submit"
                          style={{
                            padding: "8px 16px",
                            borderRadius: 8,
                            border: "none",
                            background: "#ea580c",
                            color: "#fff",
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          Lưu bàn
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddTable(false)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: "1px solid #cbd5e1",
                            background: "#fff",
                            color: "#64748b",
                            fontSize: 13,
                            cursor: "pointer",
                          }}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </form>
                )}

                {/* Seating Tables Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 16 }}>
                  {tables.map((table) => {
                    const seatedGuests = guests.filter((g: { id: string }) => table.guestIds.includes(g.id));
                    const isFull = table.guestIds.length >= table.capacity;

                    return (
                      <div
                        key={table.id}
                        style={{
                          background: "#fff",
                          borderRadius: 16,
                          padding: 18,
                          border: isFull ? "1px solid #cbd5e1" : "1px solid #e2e8f0",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                          display: "flex",
                          flexDirection: "column",
                          gap: 12,
                        }}
                      >
                        {/* Table Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <h4 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                              {table.name}
                            </h4>
                            <span
                              style={{
                                display: "inline-block",
                                fontSize: 10,
                                fontWeight: 600,
                                color: "#64748b",
                                background: "#f1f5f9",
                                padding: "2px 8px",
                                borderRadius: 4,
                                marginTop: 4,
                              }}
                            >
                              📍 {table.zone}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteTable(table.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#94a3b8",
                              cursor: "pointer",
                              fontSize: 14,
                              padding: 4,
                            }}
                            title="Xóa bàn tiệc này"
                          >
                            🗑️
                          </button>
                        </div>

                        {/* Visual Circular Table & Seats count */}
                        <div
                          style={{
                            background: "linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)",
                            borderRadius: 12,
                            padding: "12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div
                              style={{
                                width: 44,
                                height: 44,
                                borderRadius: "50%",
                                background: isFull ? "#ef4444" : "#10b981",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 800,
                                fontSize: 13,
                                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                              }}
                            >
                              🍽️
                            </div>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>
                                {table.guestIds.length} / {table.capacity} khách
                              </div>
                              <div style={{ fontSize: 10, color: "#64748b" }}>
                                {isFull ? "⚠️ Đã đủ ghế" : `Còn ${table.capacity - table.guestIds.length} ghế trống`}
                              </div>
                            </div>
                          </div>

                          {/* Quick Add Guest Selector */}
                          {!isFull && unassignedGuests.length > 0 && (
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleAssignGuest(table.id, e.target.value);
                                  e.target.value = "";
                                }
                              }}
                              style={{
                                padding: "4px 8px",
                                borderRadius: 6,
                                border: "1px solid #cbd5e1",
                                fontSize: 11,
                                background: "#fff",
                                color: "#1e293b",
                                maxWidth: 140,
                              }}
                              defaultValue=""
                            >
                              <option value="" disabled>+ Xếp khách...</option>
                              {unassignedGuests.map((ug: { id: string; name: string }) => (
                                <option key={ug.id} value={ug.id}>{ug.name}</option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* List of Seated Guests */}
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, minHeight: 60 }}>
                          {seatedGuests.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "16px 0", fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>
                              Chưa có khách nào ở bàn này
                            </div>
                          ) : (
                            seatedGuests.map((g: { id: string; name: string; phone?: string | null }) => (
                              <div
                                key={g.id}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  padding: "6px 10px",
                                  borderRadius: 8,
                                  background: "#f8fafc",
                                  border: "1px solid #f1f5f9",
                                  fontSize: 12,
                                }}
                              >
                                <span style={{ fontWeight: 600, color: "#1e293b" }}>
                                  👤 {g.name}
                                </span>
                                <button
                                  onClick={() => handleUnassignGuest(table.id, g.id)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#ef4444",
                                    fontSize: 11,
                                    cursor: "pointer",
                                    padding: "2px 4px",
                                  }}
                                  title="Gỡ khỏi bàn"
                                >
                                  ✕
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ═══════ GUEST LIST VIEW (Sprint 43) ═══════ */}
      {activeTab === "guests" && (
        <>
          {/* Add Guest Form */}
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 24,
              border: "1px solid #e8e8ec",
              marginBottom: 24,
            }}
          >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 16,
          }}
        >
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            ➕ Thêm khách mời
          </h3>
          <button
            onClick={() => setShowBatchImport(!showBatchImport)}
            style={{
              padding: "6px 14px",
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: showBatchImport ? "#fdf2f8" : "#fff",
              color: showBatchImport ? "#be185d" : "#6b7280",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            📋 {showBatchImport ? "Nhập từng người" : "Nhập hàng loạt"}
          </button>
        </div>

        {/* Sprint 43: Batch Import */}
        {showBatchImport ? (
          <div>
            <p style={{ fontSize: 12, color: "#6b7280", margin: "0 0 8px" }}>
              Mỗi dòng một tên khách mời. Ví dụ:
            </p>
            <textarea
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={"Nguyễn Văn A\nTrần Thị B\nLê Văn C\nPhạm Thị D"}
              rows={6}
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                fontSize: 14,
                outline: "none",
                resize: "vertical",
                fontFamily: "inherit",
                boxSizing: "border-box",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                marginTop: 12,
                alignItems: "center",
              }}
            >
              <button
                onClick={handleBatchImport}
                disabled={batchImporting || !batchText.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: batchImporting
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #ff6b9d, #c084fc)",
                  color: batchImporting ? "#9ca3af" : "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: batchImporting ? "not-allowed" : "pointer",
                }}
              >
                {batchImporting
                  ? "Đang thêm..."
                  : `📋 Thêm ${batchText.split("\n").filter((l) => l.trim()).length} khách`}
              </button>
              <span style={{ fontSize: 12, color: "#9ca3af" }}>
                {batchText.split("\n").filter((l) => l.trim()).length} tên
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleAdd}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr auto",
                gap: 12,
                alignItems: "end",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Tên khách mời *
                </label>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  Email (tuỳ chọn)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guest@email.com"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#6b7280",
                    display: "block",
                    marginBottom: 4,
                  }}
                >
                  SĐT (tuỳ chọn)
                </label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0901234567"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    border: "1px solid #e5e7eb",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <button
                type="submit"
                disabled={addGuest.isPending || !name.trim()}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  border: "none",
                  background: addGuest.isPending
                    ? "#e5e7eb"
                    : "linear-gradient(135deg, #ff6b9d, #c084fc)",
                  color: addGuest.isPending ? "#9ca3af" : "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: addGuest.isPending ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                {addGuest.isPending ? "Đang thêm..." : "Thêm"}
              </button>
            </div>
            {error && (
              <p style={{ color: "#ef4444", fontSize: 13, margin: "8px 0 0" }}>
                ❌ {error}
              </p>
            )}
          </form>
        )}
      </div>

      {/* Guest count + Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <h3
          style={{ fontSize: 15, fontWeight: 700, color: "#1f2937", margin: 0 }}
        >
          👥 Danh sách ({guests.length} khách)
        </h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {guests.length > 0 && (
            <>
              <button
                onClick={handleBulkCopy}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: bulkCopied ? "#ecfdf5" : "#fff",
                  color: bulkCopied ? "#10b981" : "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {bulkCopied ? "✅ Đã copy tất cả" : "📋 Copy tất cả link"}
              </button>
              <button
                onClick={handleExportCSV}
                style={{
                  padding: "6px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "#fff",
                  color: "#374151",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📥 Xuất CSV
              </button>
            </>
          )}
        </div>
      </div>

      {/* Link format hint */}
      {selectedProject && (
        <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 12px" }}>
          Link thiệp:{" "}
          <code
            style={{
              background: "#f3f4f6",
              padding: "2px 6px",
              borderRadius: 4,
              fontSize: 11,
            }}
          >
            /i/{selectedProject.slug}?guest=Tên
          </code>
        </p>
      )}

      {/* Empty state */}
      {guests.length === 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            padding: "40px 24px",
            textAlign: "center",
            border: "1px solid #e8e8ec",
          }}
        >
          <p style={{ fontSize: 36, margin: "0 0 12px" }}>👥</p>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Chưa có khách mời nào. Thêm khách ở trên để bắt đầu!
          </p>
        </div>
      )}

      {/* Guest Table */}
      {guests.length > 0 && (
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1px solid #e8e8ec",
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {[
                  "Tên khách mời",
                  "Email",
                  "SĐT",
                  "Trạng thái",
                  "Hành động",
                ].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "#6b7280",
                      textAlign: "left",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                      borderBottom: "1px solid #e5e7eb",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {guests.map(
                (
                  guest: {
                    id: string;
                    name: string;
                    email?: string | null;
                    phone?: string | null;
                    status: string;
                    created_at: string;
                  },
                  i: number,
                ) => {
                  const s =
                    STATUS_CONFIG[guest.status as GuestStatus] ||
                    STATUS_CONFIG.pending;
                  return (
                    <tr
                      key={guest.id}
                      style={{
                        borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {guest.name}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {guest.email || "—"}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {guest.phone || "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: s.color,
                            background: s.bg,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div
                          style={{ display: "flex", gap: 4, flexWrap: "wrap" }}
                        >
                          <button
                            onClick={() => copyLink(guest.name)}
                            title="Copy link"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              background:
                                copied === guest.name ? "#ecfdf5" : "#fff",
                              color:
                                copied === guest.name ? "#10b981" : "#374151",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {copied === guest.name ? "✅" : "🔗"}
                          </button>
                          <button
                            onClick={() => setQrModalGuest({ id: guest.id, name: guest.name })}
                            title="Xem mã QR Check-in"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #e0e7ff",
                              background: "#eef2ff",
                              color: "#4f46e5",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            🎟️ QR
                          </button>
                          <button
                            onClick={() => shareZalo(guest.name)}
                            title="Gửi Zalo"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              color: "#0068ff",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            Z
                          </button>
                          <button
                            onClick={() => shareSMS(guest.name, guest.phone)}
                            title="Gửi SMS"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              color: "#10b981",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            💬
                          </button>
                          <button
                            onClick={() => shareFB(guest.name)}
                            title="Facebook"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #e5e7eb",
                              background: "#fff",
                              color: "#1877f2",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                            }}
                          >
                            f
                          </button>
                          <button
                            onClick={() =>
                              deleteGuest.mutate({ guestId: guest.id })
                            }
                            disabled={deleteGuest.isPending}
                            title="Xóa"
                            style={{
                              padding: "5px 10px",
                              borderRadius: 6,
                              border: "1px solid #fee2e2",
                              background: "#fff5f5",
                              color: "#ef4444",
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        </div>
      )}
    </>
  )}

      {/* ── QR Check-in Modal ── */}
      {qrModalGuest && (
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
          onClick={() => setQrModalGuest(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: "32px 28px",
              maxWidth: 380,
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
              animation: "fadeIn 0.2s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <span style={{ fontSize: 36, display: "block", marginBottom: 8 }}>🎟️</span>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#1e1b4b", margin: "0 0 4px" }}>
              Mã QR Check-in Lễ Tân
            </h3>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 20px" }}>
              Dành riêng cho khách mời: <strong style={{ color: "#4f46e5" }}>{qrModalGuest.name}</strong>
            </p>

            <div
              style={{
                display: "inline-block",
                padding: 16,
                background: "#f8fafc",
                borderRadius: 16,
                border: "2px dashed #cbd5e1",
                marginBottom: 20,
              }}
            >
              {/* VietQR / QuickChart / Google Chart QR API Generator */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  getGuestLink(qrModalGuest.name)
                )}`}
                alt="Guest Check-in QR"
                style={{ width: 180, height: 180, display: "block" }}
              />
            </div>

            <p style={{ fontSize: 12, color: "#9ca3af", margin: "0 0 20px" }}>
              Lễ tân quét mã này bằng Camera tại sảnh tiệc để tự động hiển thị số bàn và đón khách.
            </p>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => {
                  copyLink(qrModalGuest.name);
                }}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: "#eef2ff",
                  color: "#4f46e5",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                📋 Sao chép Link
              </button>
              <button
                onClick={() => setQrModalGuest(null)}
                style={{
                  padding: "10px 20px",
                  borderRadius: 10,
                  background: "#1f2937",
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RSVP & Wishes Section ── */}
      <RsvpWishesSection projectId={selectedProjectId} />

      <style>{`
                @media (max-width: 768px) {
                    div[style*="repeat(4, 1fr)"] { grid-template-columns: 1fr !important; }
                }
            `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RSVP & Wishes Section                                              */
/* ------------------------------------------------------------------ */

const RSVP_STATUS_STYLE = {
  confirmed: { label: "Xác nhận", color: "#10b981", bg: "#ecfdf5" },
  declined: { label: "Từ chối", color: "#ef4444", bg: "#fef2f2" },
  maybe: { label: "Có thể", color: "#f59e0b", bg: "#fffbeb" },
} as const;

function RsvpWishesSection({ projectId }: { projectId: string }) {
  const { data: rsvps = [] } = trpc.guest.listRsvps.useQuery(
    { projectId },
    { enabled: !!projectId },
  );
  const { data: wishes = [] } = trpc.guest.getWishes.useQuery(
    { projectId },
    { enabled: !!projectId },
  );

  const confirmed = rsvps.filter(
    (r: { status: string }) => r.status === "confirmed",
  ).length;
  const declined = rsvps.filter(
    (r: { status: string }) => r.status === "declined",
  ).length;
  const maybe = rsvps.filter(
    (r: { status: string }) => r.status === "maybe",
  ).length;
  const totalGuests = rsvps
    .filter(
      (r: { status: string; guest_count?: number }) => r.status === "confirmed",
    )
    .reduce(
      (acc: number, r: { guest_count?: number }) => acc + (r.guest_count ?? 1),
      0,
    );

  const statsCards = [
    {
      label: "Xác nhận",
      count: confirmed,
      icon: "✅",
      color: "#10b981",
      bg: "#ecfdf5",
    },
    {
      label: "Từ chối",
      count: declined,
      icon: "❌",
      color: "#ef4444",
      bg: "#fef2f2",
    },
    {
      label: "Có thể",
      count: maybe,
      icon: "🤔",
      color: "#f59e0b",
      bg: "#fffbeb",
    },
    {
      label: "Tổng khách",
      count: totalGuests,
      icon: "👥",
      color: "#3b82f6",
      bg: "#eff6ff",
    },
    {
      label: "Lời chúc",
      count: wishes.length,
      icon: "💌",
      color: "#c084fc",
      bg: "#faf5ff",
    },
  ];

  return (
    <div style={{ marginTop: 32 }}>
      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {statsCards.map((s) => (
          <div
            key={s.label}
            style={{
              background: s.bg,
              borderRadius: 12,
              padding: "16px 12px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>
              {s.count}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", fontWeight: 600 }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* RSVP Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e8e8ec",
          overflow: "hidden",
          marginBottom: 24,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>📋</span>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Phản hồi RSVP ({rsvps.length})
          </h3>
        </div>
        {rsvps.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            Chưa có phản hồi
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Tên", "Trạng thái", "Số khách", "SĐT", "Thời gian"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 16px",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#6b7280",
                        textAlign: "left",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rsvps.map(
                (
                  r: {
                    id?: string;
                    guest_name: string;
                    status: string;
                    guest_count?: number;
                    phone?: string;
                    created_at: string;
                  },
                  i: number,
                ) => {
                  const st =
                    RSVP_STATUS_STYLE[
                      r.status as keyof typeof RSVP_STATUS_STYLE
                    ] || RSVP_STATUS_STYLE.maybe;
                  return (
                    <tr
                      key={r.id ?? i}
                      style={{
                        borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                      }}
                    >
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1f2937",
                        }}
                      >
                        {r.guest_name}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: st.color,
                            background: st.bg,
                            padding: "3px 8px",
                            borderRadius: 6,
                          }}
                        >
                          {st.label}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {r.guest_count ?? 1}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: "#6b7280",
                        }}
                      >
                        {r.phone || "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "#9ca3af",
                        }}
                      >
                        {formatRelativeTime(r.created_at)}
                      </td>
                    </tr>
                  );
                },
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Wishes Feed */}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          border: "1px solid #e8e8ec",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>💌</span>
          <h3
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1f2937",
              margin: 0,
            }}
          >
            Lời chúc ({wishes.length})
          </h3>
        </div>
        {wishes.length === 0 ? (
          <div
            style={{
              padding: "32px 20px",
              textAlign: "center",
              color: "#9ca3af",
              fontSize: 13,
            }}
          >
            Chưa có lời chúc
          </div>
        ) : (
          <div
            style={{
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {wishes.map(
              (w: {
                id: string;
                guest_name: string;
                message: string;
                emoji?: string;
                created_at: string;
              }) => (
                <div
                  key={w.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: "#faf5ff",
                    border: "1px solid #f3e8ff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 6,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{w.emoji || "💝"}</span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#1f2937",
                      }}
                    >
                      {w.guest_name}
                    </span>
                    <span
                      style={{
                        fontSize: 11,
                        color: "#9ca3af",
                        marginLeft: "auto",
                      }}
                    >
                      {formatRelativeTime(w.created_at)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: 13,
                      color: "#4b5563",
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {w.message}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} ngày trước`;
  return new Date(dateStr).toLocaleDateString("vi-VN");
}
