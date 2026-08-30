"use client";

/**
 * Sprint 55 — RSVP Analytics CRM & Guest Intelligence Dashboard
 * - Realtime Supabase live stream for rsvp_responses
 * - In-depth CRM Analytics: Attendance rate %, Dietary preferences (Chay/Mặn/Hải sản/Trẻ em)
 * - Multi-project switcher & Status/Dietary multi-filters
 * - Instant Search & Quick Actions
 * - Smart Excel / CSV Export with Vietnamese UTF-8 BOM support
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

interface RsvpRow {
  id: string;
  project_id: string;
  guest_name: string;
  attending: boolean | null;
  guest_count: number;
  note: string | null;
  phone?: string | null;
  created_at: string;
}

interface ProjectRow {
  id: string;
  title: string | null;
  slug: string | null;
}

export default function RsvpPage() {
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [rsvps, setRsvps] = useState<RsvpRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "attending" | "declined" | "pending">("all");
  const [dietaryFilter, setDietaryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const loadData = useCallback(async (projectIds: string[], filterProjectId = "all") => {
    if (projectIds.length === 0) {
      setRsvps([]);
      return;
    }
    const query = filterProjectId === "all"
      ? supabase.from("rsvp_responses").select("*").in("project_id", projectIds).order("created_at", { ascending: false })
      : supabase.from("rsvp_responses").select("*").eq("project_id", filterProjectId).order("created_at", { ascending: false });

    const { data } = await query;
    setRsvps((data as RsvpRow[]) || []);
    setLastUpdated(new Date());
  }, [supabase]);

  useEffect(() => {
    let projectIds: string[] = [];

    async function bootstrap() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data: proj } = await supabase
        .from("projects")
        .select("id, title, slug")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      const loadedProjects = (proj as ProjectRow[]) || [];
      setProjects(loadedProjects);
      projectIds = loadedProjects.map((p) => p.id);
      await loadData(projectIds, "all");
      setLoading(false);
    }

    bootstrap();

    // ── Supabase Realtime: subscribe to rsvp_responses changes ──
    const channel = supabase
      .channel("rsvp-realtime-crm")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rsvp_responses" },
        () => {
          loadData(projectIds, selectedProjectId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch when project filter changes
  useEffect(() => {
    const projectIds = projects.map((p) => p.id);
    if (projectIds.length > 0) loadData(projectIds, selectedProjectId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  // CRM Computations
  const attendingList = useMemo(() => rsvps.filter((r) => r.attending === true), [rsvps]);
  const declinedList = useMemo(() => rsvps.filter((r) => r.attending === false), [rsvps]);
  const pendingList = useMemo(() => rsvps.filter((r) => r.attending === null || r.attending === undefined), [rsvps]);

  const totalHeadcount = useMemo(() => attendingList.reduce((sum, r) => sum + (r.guest_count || 1), 0), [attendingList]);
  const attendanceRate = useMemo(() => {
    if (rsvps.length === 0) return 0;
    return Math.round((attendingList.length / rsvps.length) * 100);
  }, [rsvps.length, attendingList.length]);

  // Dietary Analysis
  const dietaryStats = useMemo(() => {
    let vegetarian = 0;
    let noSeafood = 0;
    let kids = 0;
    let standard = 0;

    attendingList.forEach((r) => {
      const note = (r.note || "").toLowerCase();
      const count = r.guest_count || 1;
      if (note.includes("chay") || note.includes("ăn chay")) {
        vegetarian += count;
      } else if (note.includes("hải sản") || note.includes("di ung")) {
        noSeafood += count;
      } else if (note.includes("trẻ em") || note.includes("bé")) {
        kids += count;
      } else {
        standard += count;
      }
    });

    return { vegetarian, noSeafood, kids, standard };
  }, [attendingList]);

  // Filtered RSVPs
  const filteredRsvps = useMemo(() => {
    return rsvps.filter((r) => {
      // Status filter
      if (statusFilter === "attending" && r.attending !== true) return false;
      if (statusFilter === "declined" && r.attending !== false) return false;
      if (statusFilter === "pending" && (r.attending === true || r.attending === false)) return false;

      // Dietary filter
      if (dietaryFilter === "veg" && !(r.note || "").toLowerCase().includes("chay")) return false;
      if (dietaryFilter === "seafood" && !(r.note || "").toLowerCase().includes("hải sản")) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = r.guest_name.toLowerCase().includes(query);
        const matchNote = (r.note || "").toLowerCase().includes(query);
        const matchPhone = (r.phone || "").toLowerCase().includes(query);
        if (!matchName && !matchNote && !matchPhone) return false;
      }

      return true;
    });
  }, [rsvps, statusFilter, dietaryFilter, searchTerm]);

  const exportProjectId = selectedProjectId === "all" ? (rsvps[0]?.project_id || projects[0]?.id || "") : selectedProjectId;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "var(--dash-text-muted)" }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>⏳</p>
        <p style={{ fontSize: 15, fontWeight: 500 }}>Đang phân tích dữ liệu phản hồi...</p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header & Export Actions */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--dash-text)", margin: 0, letterSpacing: "-0.5px" }}>
            📊 RSVP Analytics & Guest CRM
          </h2>
          <p style={{ fontSize: 13, color: "var(--dash-text-secondary)", margin: "4px 0 0", display: "flex", alignItems: "center", gap: 8 }}>
            Hệ thống phân tích & theo dõi xác nhận tham dự theo thời gian thực
            {lastUpdated && (
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                fontSize: 11, color: "#10b981", background: "#ecfdf5",
                padding: "2px 8px", borderRadius: 20, fontWeight: 600,
              }}>
                🟢 Live · {lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
          </p>
        </div>

        {rsvps.length > 0 && exportProjectId && (
          <div style={{ display: "flex", gap: 8 }}>
            <a
              href={`/api/guests/export?projectId=${exportProjectId}`}
              download
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 16px", borderRadius: 10, border: "1px solid #10b981",
                background: "linear-gradient(135deg, #10b981, #059669)", color: "#ffffff",
                fontSize: 12, fontWeight: 700, textDecoration: "none", flexShrink: 0,
                boxShadow: "0 2px 8px rgba(16,185,129,0.25)",
              }}
            >
              📥 Xuất Excel / CSV (UTF-8)
            </a>
          </div>
        )}
      </div>

      {/* Project Switcher Tabs */}
      {projects.length > 1 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)", marginRight: 4 }}>
            💒 Thiệp cưới:
          </span>
          <button
            onClick={() => setSelectedProjectId("all")}
            style={{
              padding: "6px 14px", borderRadius: 20, border: "1px solid var(--dash-border)",
              background: selectedProjectId === "all" ? "linear-gradient(135deg, #e11d48, #be123c)" : "var(--dash-card)",
              color: selectedProjectId === "all" ? "#fff" : "var(--dash-text)",
              fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            Tất cả thiệp ({projects.length})
          </button>
          {projects.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedProjectId(p.id)}
              style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid var(--dash-border)",
                background: selectedProjectId === p.id ? "linear-gradient(135deg, #e11d48, #be123c)" : "var(--dash-card)",
                color: selectedProjectId === p.id ? "#fff" : "var(--dash-text)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
                maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
              title={p.title || p.slug || p.id}
            >
              💍 {p.title || p.slug || p.id.slice(0, 8)}
            </button>
          ))}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14 }}>
        <div style={{ background: "var(--dash-card)", borderRadius: 16, padding: 18, border: "1px solid var(--dash-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "var(--dash-text-secondary)", fontWeight: 600 }}>Tổng lượt phản hồi</span>
            <span style={{ fontSize: 18 }}>📝</span>
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: "var(--dash-text)", margin: "8px 0 0" }}>{rsvps.length}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Từ khách mời trực tuyến</p>
        </div>

        <div style={{ background: "var(--dash-card)", borderRadius: 16, padding: 18, border: "1px solid rgba(16,185,129,0.3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#059669", fontWeight: 700 }}>Tổng khách tham dự</span>
            <span style={{ fontSize: 18 }}>👥</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 30, fontWeight: 800, color: "#059669" }}>{totalHeadcount}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#10b981", background: "#ecfdf5", padding: "2px 8px", borderRadius: 99 }}>
              {attendanceRate}% đồng ý
            </span>
          </div>
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>{attendingList.length} lượt xác nhận đi</p>
        </div>

        <div style={{ background: "var(--dash-card)", borderRadius: 16, padding: 18, border: "1px solid var(--dash-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 600 }}>Không thể tham dự</span>
            <span style={{ fontSize: 18 }}>😔</span>
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: "#dc2626", margin: "8px 0 0" }}>{declinedList.length}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Gửi lời chúc mừng từ xa</p>
        </div>

        <div style={{ background: "var(--dash-card)", borderRadius: 16, padding: 18, border: "1px solid var(--dash-border)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>Chờ xác nhận</span>
            <span style={{ fontSize: 18 }}>⏳</span>
          </div>
          <p style={{ fontSize: 30, fontWeight: 800, color: "#d97706", margin: "8px 0 0" }}>{pendingList.length}</p>
          <p style={{ fontSize: 11, color: "#64748b", margin: "4px 0 0" }}>Cần gọi điện / nhắn tin nhắc</p>
        </div>
      </div>

      {/* Dietary Analytics Module */}
      <div style={{ background: "var(--dash-card)", borderRadius: 16, padding: 18, border: "1px solid var(--dash-border)" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)", margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8 }}>
          <span>🍽️</span> Phân bổ Khẩu Phần Ăn Tiệc Cưới (Dietary Planning)
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10 }}>
          <div style={{ background: "rgba(226, 232, 240, 0.4)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>🥩 Tiêu chuẩn (Mặn)</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "var(--dash-text)", marginTop: 4 }}>{dietaryStats.standard} suất</div>
          </div>
          <div style={{ background: "rgba(16, 185, 129, 0.1)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#059669", fontWeight: 700 }}>🌱 Ăn chay</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#059669", marginTop: 4 }}>{dietaryStats.vegetarian} suất</div>
          </div>
          <div style={{ background: "rgba(245, 158, 11, 0.1)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#d97706", fontWeight: 700 }}>🦀 Kiêng hải sản</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#d97706", marginTop: 4 }}>{dietaryStats.noSeafood} suất</div>
          </div>
          <div style={{ background: "rgba(59, 130, 246, 0.1)", borderRadius: 12, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: "#2563eb", fontWeight: 700 }}>👶 Suất trẻ em</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#2563eb", marginTop: 4 }}>{dietaryStats.kids} suất</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            style={{
              padding: "8px 12px", borderRadius: 10, border: "1px solid var(--dash-border)",
              background: "var(--dash-card)", color: "var(--dash-text)", fontSize: 12, fontWeight: 600,
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="attending">💕 Sẽ tham dự</option>
            <option value="declined">😔 Không đến</option>
            <option value="pending">⏳ Chờ xác nhận</option>
          </select>

          <select
            value={dietaryFilter}
            onChange={(e) => setDietaryFilter(e.target.value)}
            style={{
              padding: "8px 12px", borderRadius: 10, border: "1px solid var(--dash-border)",
              background: "var(--dash-card)", color: "var(--dash-text)", fontSize: 12, fontWeight: 600,
            }}
          >
            <option value="all">Tất cả khẩu phần ăn</option>
            <option value="veg">🌱 Ăn chay</option>
            <option value="seafood">🦀 Kiêng hải sản</option>
          </select>
        </div>

        <div style={{ position: "relative", minWidth: 240 }}>
          <input
            type="text"
            placeholder="🔍 Tìm tên khách, lời nhắn, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%", padding: "8px 14px", borderRadius: 10,
              border: "1px solid var(--dash-border)", background: "var(--dash-card)",
              color: "var(--dash-text)", fontSize: 12, outline: "none", boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* CRM Guest Table */}
      {filteredRsvps.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--dash-card)", borderRadius: 16, border: "1px solid var(--dash-border)" }}>
          <p style={{ fontSize: 40, marginBottom: 8 }}>💌</p>
          <p style={{ fontSize: 15, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>Không tìm thấy phản hồi nào phù hợp</p>
          <p style={{ fontSize: 12, color: "var(--dash-text-secondary)", marginTop: 4 }}>
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--dash-card)", borderRadius: 16, border: "1px solid var(--dash-border)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "var(--dash-card-hover)", borderBottom: "1px solid var(--dash-border)" }}>
                  <th style={{ padding: "12px 18px", fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)" }}>Khách mời</th>
                  <th style={{ padding: "12px 18px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)" }}>Trạng thái</th>
                  <th style={{ padding: "12px 18px", textAlign: "center", fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)" }}>Số người</th>
                  <th style={{ padding: "12px 18px", fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)" }}>Khẩu phần & Lời nhắn</th>
                  <th style={{ padding: "12px 18px", textAlign: "right", fontSize: 12, fontWeight: 700, color: "var(--dash-text-secondary)" }}>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {filteredRsvps.map((rsvp) => {
                  const isAttending = rsvp.attending === true;
                  const isDeclined = rsvp.attending === false;
                  const isVeg = (rsvp.note || "").toLowerCase().includes("chay");
                  const isNoSeafood = (rsvp.note || "").toLowerCase().includes("hải sản");

                  return (
                    <tr key={rsvp.id} style={{ borderTop: "1px solid var(--dash-border-light)" }}>
                      <td style={{ padding: "14px 18px" }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)" }}>
                          {rsvp.guest_name}
                        </div>
                        {rsvp.phone && (
                          <a
                            href={`tel:${rsvp.phone}`}
                            style={{ fontSize: 11, color: "#3b82f6", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginTop: 2 }}
                          >
                            📞 {rsvp.phone}
                          </a>
                        )}
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "center" }}>
                        <span style={{
                          padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                          color: isAttending ? "#059669" : isDeclined ? "#dc2626" : "#d97706",
                          background: isAttending ? "#ecfdf5" : isDeclined ? "#fef2f2" : "#fffbeb",
                          display: "inline-block",
                        }}>
                          {isAttending ? "💕 Tham dự" : isDeclined ? "😔 Không đến" : "⏳ Chờ xác nhận"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "center", fontSize: 14, fontWeight: 700, color: "var(--dash-text)" }}>
                        {isAttending ? (rsvp.guest_count || 1) : "—"}
                      </td>
                      <td style={{ padding: "14px 18px", maxWidth: 280 }}>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 4 }}>
                          {isVeg && (
                            <span style={{ background: "#ecfdf5", color: "#059669", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              🌱 Ăn chay
                            </span>
                          )}
                          {isNoSeafood && (
                            <span style={{ background: "#fffbeb", color: "#d97706", padding: "2px 6px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>
                              🦀 Kiêng hải sản
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--dash-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {rsvp.note || <span style={{ color: "var(--dash-text-muted)", fontStyle: "italic" }}>Không có ghi chú</span>}
                        </div>
                      </td>
                      <td style={{ padding: "14px 18px", textAlign: "right", fontSize: 11, color: "var(--dash-text-muted)" }}>
                        {new Date(rsvp.created_at).toLocaleDateString("vi-VN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
