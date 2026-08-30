import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

/** Escape a CSV cell to prevent formula injection (=, +, -, @, tab, CR). */
function escapeCsvCell(value: string): string {
  if (!value) return "";
  const escaped = value.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(escaped)) return `'${escaped}`;
  return escaped;
}

// GET /api/guests/export?projectId=xxx
// Downloads RSVP responses as CSV — Sprint 8: updated to rsvp_responses table
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");

  if (!projectId) {
    return new Response("Missing projectId", { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Verify ownership
  const { data: project } = await supabase
    .from("projects")
    .select("id, title, slug")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return new Response("Not found or unauthorized", { status: 404 });
  }

  // Fetch RSVP responses (new table schema: Sprint 8)
  const { data: rsvps } = await supabase
    .from("rsvp_responses")
    .select("guest_name, attending, guest_count, note, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Fetch traditional guest list if table exists
  const { data: guests } = await supabase
    .from("guests")
    .select("name, email, phone, status, created_at")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  // Build CSV with BOM for Vietnamese text in Excel
  const BOM = "\uFEFF";
  const rows: string[] = [
    "Loại,Tên khách,Email,Điện thoại,Tham dự,Số người,Bàn tiệc,Khẩu phần ăn,Lời nhắn,Ngày đăng ký",
  ];

  // RSVP rows
  for (const r of rsvps || []) {
    const attending = r.attending ? "Tham dự" : "Không đến";
    const count = r.attending ? r.guest_count || 1 : 0;
    const date = new Date(r.created_at).toLocaleDateString("vi-VN");
    const guestName = escapeCsvCell(r.guest_name || "");
    const note = escapeCsvCell(r.note || "");
    
    // Parse dietary preference from note if formatted like [Chay] or dietary field
    let dietary = "Tiêu chuẩn (Mặn)";
    if (r.note?.includes("[Chay]") || r.note?.toLowerCase().includes("ăn chay")) {
      dietary = "Ăn chay";
    } else if (r.note?.includes("[Hải sản]") || r.note?.toLowerCase().includes("hải sản")) {
      dietary = "Kiêng hải sản";
    } else if (r.note?.toLowerCase().includes("trẻ em")) {
      dietary = "Suất trẻ em";
    }

    rows.push(
      `RSVP,"${guestName}",,,"${attending}",${count},"-","${dietary}","${note}",${date}`,
    );
  }

  // Old guest list rows (if any)
  for (const g of guests || []) {
    const statusLabel =
      g.status === "confirmed"
        ? "Tham dự"
        : g.status === "declined"
          ? "Vắng mặt"
          : "Mời";
    const date = new Date(g.created_at).toLocaleDateString("vi-VN");
    const name = escapeCsvCell(g.name || "");
    const email = escapeCsvCell(g.email || "");
    const phone = escapeCsvCell(g.phone || "");
    rows.push(
      `Danh sách mời,"${name}","${email}","${phone}","${statusLabel}",1,"-","Tiêu chuẩn (Mặn)","-",${date}`,
    );
  }

  if (rows.length === 1) {
    rows.push("(Chưa có dữ liệu)");
  }

  const csv = BOM + rows.join("\n");
  const filename = `danh-sach-khach-rsvp-${project.slug || projectId}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
