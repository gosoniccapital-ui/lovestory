import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CheckInScannerApp } from "./_components/CheckInScannerApp";

export default async function CheckInPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Load user's projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, title, slug")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      {(!projects || projects.length === 0) ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 20,
            padding: "60px 40px",
            textAlign: "center",
            border: "1px solid #e8e8ec",
          }}
        >
          <p style={{ fontSize: 48, margin: "0 0 16px" }}>💌</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: "#1f2937", margin: "0 0 8px" }}>
            Chưa có thiệp cưới nào
          </h3>
          <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>
            Hãy tạo thiệp cưới và thêm danh sách khách mời trước khi sử dụng ứng dụng Check-in lễ tân.
          </p>
          <a
            href="/templates"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              borderRadius: 12,
              background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            🎨 Tạo thiệp ngay
          </a>
        </div>
      ) : (
        <CheckInScannerApp
          projects={projects.map((p) => ({
            id: p.id,
            title: p.title || "",
            slug: p.slug || "",
          }))}
        />
      )}
    </div>
  );
}
