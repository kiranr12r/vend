"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }

      // Hard navigation ensures the session cookie is sent on the next request,
      // avoiding a redirect loop on slower production (Vercel) network round-trips.
      const sessionRes = await fetch("/api/auth/session");
      const sessionData = await sessionRes.json();
      const role = sessionData?.user?.role;

      if (role === "APPROVER" || role === "ACCOUNTS") {
         window.location.href = "/vendors/approve";
      } else if (role === "IC_TEAM") {
         window.location.href = "/vendors/clarify";
      } else if (role === "ADMIN") {
         window.location.href = "/vendors/list";
      } else {
         window.location.href = "/vendors/new"; // INITIATOR
      }
    } catch (e) {
      console.error("Login error:", e);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(160deg,#c9e8f7 0%,#ddf0fa 30%,#eef8fd 55%,#d6edf8 75%,#b8dff5 100%)" }}
    >
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 1024 768"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        <ellipse cx="512" cy="920" rx="520" ry="420" stroke="white" strokeWidth="1.2" strokeOpacity="0.5" />
        <ellipse cx="512" cy="920" rx="660" ry="540" stroke="white" strokeWidth="1" strokeOpacity="0.3" />
        <ellipse cx="512" cy="920" rx="820" ry="670" stroke="white" strokeWidth="0.8" strokeOpacity="0.18" />
      </svg>

      <div
        className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% 115%,rgba(255,255,255,0.75) 0%,transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 left-[-8%] w-[50%] h-36 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(255,255,255,0.5) 0%,transparent 70%)" }}
      />
      <div
        className="absolute bottom-0 right-[-4%] w-[42%] h-28 rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse,rgba(255,255,255,0.45) 0%,transparent 70%)" }}
      />

      <div className="absolute top-5 left-6 flex items-center gap-2 z-10">
        <div className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#ED1C24"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span className="text-gray-700 font-semibold text-sm">Kotak Mahindra AMC</span>
      </div>

      <div
        className="relative z-10 w-full max-w-sm mx-4"
        style={{
          background: "linear-gradient(145deg,rgba(255,255,255,0.84) 0%,rgba(235,248,255,0.76) 100%)",
          backdropFilter: "blur(28px)",
          WebkitBackdropFilter: "blur(28px)",
          borderRadius: "28px",
          border: "1px solid rgba(255,255,255,0.78)",
          boxShadow: "0 8px 40px rgba(100,180,230,0.18),0 2px 12px rgba(100,180,230,0.1)",
          padding: "36px 32px 32px",
        }}
      >
        <div className="flex flex-col items-center mb-7">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.95)",
              boxShadow: "0 4px 16px rgba(100,180,230,0.18)",
              border: "1px solid rgba(255,255,255,0.9)",
            }}
          >
            <Image
              src="/kotak-logo.jpeg"
              alt="Kotak Mahindra"
              width={72}
              height={72}
              className="object-contain rounded-xl"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800 text-center">Sign in with email</h1>
          <p className="text-gray-500 text-xs text-center mt-1">
            Kotak Mahindra AMC · Vendor Management Portal
          </p>
        </div>

        <div className="space-y-3">

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
                <polyline
                  points="22,6 12,13 2,6"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Email"
              style={{
                background: "rgba(240,248,255,0.7)",
                border: "1px solid rgba(200,230,248,0.8)",
                borderRadius: "14px",
              }}
              className="w-full pl-10 pr-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/25 transition-all"
            />
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <input
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="Password"
              style={{
                background: "rgba(240,248,255,0.7)",
                border: "1px solid rgba(200,230,248,0.8)",
                borderRadius: "14px",
              }}
              className="w-full pl-10 pr-12 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/25 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPwd(!showPwd)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPwd ? (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </button>
          </div>

          <div className="text-right">
            <button type="button" className="text-xs text-gray-500 hover:text-[#ED1C24] transition-colors">
              Forgot password?
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            style={{ background: loading ? "#555" : "#1a1a1a", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3" />
                  <path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Signing in...
              </>
            ) : (
              "Get Started"
            )}
          </button>

          <p className="text-center text-xs text-gray-400">
            Access is admin-managed. Contact your administrator for an account.
          </p>

          <p className="text-center text-xs text-gray-500 pt-1">
            Need an account?{" "}
            <Link href="/register" className="text-[#ED1C24] font-semibold hover:underline">
              Request one
            </Link>
          </p>
        </div>
      </div>

      <p className="relative z-10 text-center text-xs text-gray-400/80 mt-6">
        © 2026 Kotak Mahindra Asset Management Company Ltd.
      </p>
    </div>
  );
}