"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
    const router = useRouter();
    const supabase = createClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isRegister, setIsRegister] = useState(false);
    const [isForgotPwd, setIsForgotPwd] = useState(false);
    const [resetSent, setResetSent] = useState(false);

    async function handleEmailAuth(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (isRegister) {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                setError(error.message);
            } else {
                // Auto-confirmed — sign in immediately
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    setError("Đã tạo tài khoản. Vui lòng đăng nhập.");
                } else {
                    router.push("/dashboard");
                    router.refresh();
                }
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) {
                setError(error.message);
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        }
        setLoading(false);
    }

    async function handleGoogleLogin() {
        setLoading(true);
        setError("");
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            });
            if (error) {
                setError(`Đăng nhập Google: ${error.message}`);
            }
        } catch (err: any) {
            setError(err.message || "Không thể kết nối tới Google OAuth");
        } finally {
            setLoading(false);
        }
    }

    async function handleForgotPassword(e: React.FormEvent) {
        e.preventDefault();
        if (!email) { setError("Vui lòng nhập email"); return; }
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/dashboard/profile`,
        });
        if (error) { setError(error.message); }
        else { setResetSent(true); }
        setLoading(false);
    }

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
                fontFamily: "'Inter', -apple-system, sans-serif",
            }}
        >
            <div
                style={{
                    width: "100%",
                    maxWidth: 420,
                    padding: 40,
                    borderRadius: 24,
                    background: "rgba(255,255,255,0.06)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
                }}
            >
                {/* Logo */}
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h1
                        style={{
                            fontSize: 32,
                            fontWeight: 700,
                            background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            margin: 0,
                        }}
                    >
                        LoveStory
                    </h1>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginTop: 8, fontSize: 14 }}>
                        {isRegister ? "Tạo tài khoản mới" : "Đăng nhập vào tài khoản"}
                    </p>
                </div>

                {/* Google Login */}
                <button
                    onClick={handleGoogleLogin}
                    style={{
                        width: "100%",
                        padding: "12px 16px",
                        borderRadius: 12,
                        border: "1px solid rgba(255,255,255,0.15)",
                        background: "rgba(255,255,255,0.08)",
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 10,
                        transition: "all 0.2s",
                    }}
                    onMouseOver={(e) => {
                        (e.target as HTMLElement).style.background = "rgba(255,255,255,0.15)";
                    }}
                    onMouseOut={(e) => {
                        (e.target as HTMLElement).style.background = "rgba(255,255,255,0.08)";
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                        <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        />
                        <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                    </svg>
                    Đăng nhập bằng Google
                </button>

                {/* Divider */}
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "24px 0",
                        gap: 12,
                    }}
                >
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12 }}>hoặc</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>

                {/* Email Form */}
                <form onSubmit={handleEmailAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6, display: "block" }}>
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginBottom: 6, display: "block" }}>
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            style={{
                                width: "100%",
                                padding: "12px 16px",
                                borderRadius: 12,
                                border: "1px solid rgba(255,255,255,0.15)",
                                background: "rgba(255,255,255,0.05)",
                                color: "#fff",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                            }}
                        />
                    </div>

                    {error && (
                        <p style={{ color: error.includes("Kiểm tra") ? "#4ade80" : "#f87171", fontSize: 13, margin: 0 }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            width: "100%",
                            padding: "12px 16px",
                            borderRadius: 12,
                            border: "none",
                            background: "linear-gradient(135deg, #ff6b9d, #c084fc)",
                            color: "#fff",
                            fontSize: 14,
                            fontWeight: 600,
                            cursor: loading ? "not-allowed" : "pointer",
                            opacity: loading ? 0.7 : 1,
                            transition: "all 0.2s",
                        }}
                    >
                        {loading ? "Đang xử lý..." : isRegister ? "Đăng ký" : "Đăng nhập"}
                    </button>
                </form>

                {/* Forgot Password */}
                {!isRegister && !isForgotPwd && (
                    <p style={{ textAlign: "center", marginTop: 12 }}>
                        <button
                            onClick={() => { setIsForgotPwd(true); setError(""); setResetSent(false); }}
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer" }}
                        >
                            Quên mật khẩu?
                        </button>
                    </p>
                )}
                {isForgotPwd && (
                    <div style={{ marginTop: 16, textAlign: "center" }}>
                        {resetSent ? (
                            <p style={{ color: "#34d399", fontSize: 13 }}>✅ Link đặt lại mật khẩu đã gửi tới email của bạn!</p>
                        ) : (
                            <button
                                onClick={handleForgotPassword}
                                disabled={loading}
                                style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "#6366f1", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                            >
                                {loading ? "Đang gửi..." : "📧 Gửi link đặt lại mật khẩu"}
                            </button>
                        )}
                        <p style={{ marginTop: 8 }}>
                            <button onClick={() => { setIsForgotPwd(false); setError(""); }} style={{ background: "none", border: "none", color: "#c084fc", fontSize: 12, cursor: "pointer" }}>
                                ← Quay lại đăng nhập
                            </button>
                        </p>
                    </div>
                )}

                {/* Toggle Register/Login */}
                <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 24 }}>
                    {isRegister ? "Đã có tài khoản?" : "Chưa có tài khoản?"}{" "}
                    <button
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setIsForgotPwd(false);
                            setError("");
                        }}
                        style={{
                            background: "none",
                            border: "none",
                            color: "#c084fc",
                            fontSize: 13,
                            cursor: "pointer",
                            fontWeight: 600,
                        }}
                    >
                        {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
                    </button>
                </p>
            </div>
        </div>
    );
}
