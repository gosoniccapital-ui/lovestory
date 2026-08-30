"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function NavGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "var(--dash-text-muted)", letterSpacing: 1.2, margin: "0 0 6px 12px", textTransform: "uppercase" }}>
                {label}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{children}</div>
        </div>
    );
}

function NavItem({ href, icon, label, exact }: { href: string; icon: string; label: string; exact?: boolean }) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : (pathname === href || (href !== "/dashboard" && pathname.startsWith(href)));

    return (
        <Link
            href={href}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 10,
                fontSize: 14,
                color: isActive ? "var(--dash-accent)" : "var(--dash-text-secondary)",
                textDecoration: "none",
                background: isActive ? "var(--dash-accent-bg)" : "transparent",
                fontWeight: isActive ? 600 : 400,
                transition: "all 0.15s",
                borderLeft: isActive ? "3px solid var(--dash-accent)" : "3px solid transparent",
            }}
        >
            <span style={{ fontSize: 16 }}>{icon}</span>
            <span>{label}</span>
        </Link>
    );
}

export function DashboardNav() {
    return (
        <nav style={{ flex: 1, padding: "0 12px", display: "flex", flexDirection: "column", gap: 2 }}>
            <NavGroup label="HOME">
                <NavItem href="/dashboard" icon="📊" label="Tổng quan" exact />
                <NavItem href="/dashboard/my-plan" icon="⭐" label="Gói dịch vụ" />
                <NavItem href="/templates" icon="✏️" label="Tạo thiết kế" />
                <NavItem href="/gallery" icon="🖼️" label="Bộ sưu tập" />
            </NavGroup>

            <NavGroup label="THIỆP CỦA TÔI">
                <NavItem href="/dashboard/projects" icon="💌" label="Thiệp online" />
                <NavItem href="/dashboard/videos" icon="🎬" label="Video của tôi" />
                <NavItem href="/ai-video" icon="✨" label="Tạo AI Video" />
            </NavGroup>

            <NavGroup label="KHÁCH MỜI">
                <NavItem href="/dashboard/guests" icon="👥" label="Danh sách khách" />
                <NavItem href="/dashboard/check-in" icon="📱" label="Check-in Lễ tân" />
                <NavItem href="/dashboard/wishes" icon="💬" label="Lời chúc" />
                <NavItem href="/dashboard/rsvp" icon="✅" label="Xác nhận tham dự" />
                <NavItem href="/dashboard/gifts" icon="🎁" label="Quà tặng" />
            </NavGroup>

            <NavGroup label="TÀI KHOẢN">
                <NavItem href="/dashboard/profile" icon="👤" label="Thông tin cá nhân" />
                <NavItem href="/dashboard/referral" icon="🎁" label="Giới thiệu bạn bè" />
            </NavGroup>
        </nav>
    );
}
