"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", email: "",
    phoneNumber: "", panCard: "", address: "", gstNumber: "",
    password: "", confirmPassword: "",
  });
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleRegister() {
  const { firstName, lastName, email, password, confirmPassword,
          dateOfBirth, phoneNumber, panCard, address, gstNumber } = form;

  if (!firstName || !lastName || !email || !password || !confirmPassword ||
      !dateOfBirth || !phoneNumber || !panCard || !address || !gstNumber) {
    setError("All fields are required.");
    return;
  }
  if (password.length < 8) {
    setError("Password must be at least 8 characters.");
    return;
  }
  if (password !== confirmPassword) {
    setError("Passwords do not match.");
    return;
  }
  if (!/^[6-9][0-9]{9}$/.test(phoneNumber.trim())) {
    setError("Enter a valid 10-digit mobile number.");
    return;
  }
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panCard.trim().toUpperCase())) {
    setError("Enter a valid PAN (e.g. ABCDE1234F).");
    return;
  }
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gstNumber.trim().toUpperCase())) {
    setError("Enter a valid GST number.");
    return;
  }

  setLoading(true);
  setError("");

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        password,
        dateOfBirth,
        phoneNumber: phoneNumber.trim(),
        panCard:     panCard.trim().toUpperCase(),
        address,
        gstNumber:   gstNumber.trim().toUpperCase(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Registration failed. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/login");
  } catch {
    setError("Something went wrong. Please try again.");
    setLoading(false);
  }
}

  const strength = (() => {
    const p = form.password; if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "#EF4444", "#F97316", "#EAB308", "#22C55E"][strength];

  const inputStyle = {
    background: "rgba(240,248,255,0.7)",
    border: "1px solid rgba(200,230,248,0.8)",
    borderRadius: "14px",
  };
  const lbl = "block text-xs font-semibold text-gray-500 mb-1.5";
  const inp = "w-full px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ED1C24]/25 focus:border-[#ED1C24]/60 transition-all";

  const EyeOff = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
  const Eye = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2"/>
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
    </svg>
  );

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden py-10"
      style={{ background: "linear-gradient(160deg,#c9e8f7 0%,#ddf0fa 30%,#eef8fd 55%,#d6edf8 75%,#b8dff5 100%)" }}
    >
      {/* arc lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1024 768" preserveAspectRatio="xMidYMid slice" fill="none">
        <ellipse cx="512" cy="920" rx="520" ry="420" stroke="white" strokeWidth="1.2" strokeOpacity="0.5"/>
        <ellipse cx="512" cy="920" rx="660" ry="540" stroke="white" strokeWidth="1"   strokeOpacity="0.3"/>
        <ellipse cx="512" cy="920" rx="820" ry="670" stroke="white" strokeWidth="0.8" strokeOpacity="0.18"/>
      </svg>

      {/* cloud glow */}
      <div className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 70% at 50% 115%,rgba(255,255,255,0.75) 0%,transparent 70%)" }}/>

      {/* top-left brand */}
      <div className="absolute top-5 left-6 flex items-center gap-2 z-10">
        <div className="w-7 h-7 rounded-lg bg-white/80 backdrop-blur flex items-center justify-center shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="#ED1C24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="text-gray-700 font-semibold text-sm">Kotak Mahindra AMC</span>
      </div>

      {/* ── Card ── */}
      <div
        className="relative z-10 w-full max-w-xl mx-4"
        style={{
          background: "linear-gradient(145deg,rgba(255,255,255,0.86) 0%,rgba(235,248,255,0.78) 100%)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          borderRadius: "28px", border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 8px 40px rgba(100,180,230,0.18),0 2px 12px rgba(100,180,230,0.1)",
          padding: "36px 36px 32px",
        }}
      >
        {/* logo + heading */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 overflow-hidden"
            style={{ background: "rgba(255,255,255,0.95)", boxShadow: "0 4px 16px rgba(100,180,230,0.18)", border: "1px solid rgba(255,255,255,0.9)" }}
          >
            <Image src="/kotak-logo.jpeg" alt="Kotak Mahindra" width={58} height={58} className="object-contain rounded-xl"/>
          </div>
          <h1 className="text-xl font-bold text-gray-800">Account Request</h1>
          <p className="text-gray-500 text-xs mt-1">Kotak Mahindra AMC · Vendor Management Portal</p>
        </div>

        <div className="space-y-4">

          {/* First + Last name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={lbl}>First Name</label>
              <input name="firstName" type="text" value={form.firstName} onChange={handleChange}
                placeholder="Rahul" style={inputStyle} className={inp}/>
            </div>
            <div>
              <label className={lbl}>Last Name</label>
              <input name="lastName" type="text" value={form.lastName} onChange={handleChange}
                placeholder="Sharma" style={inputStyle} className={inp}/>
            </div>
          </div>

          {/* Date of Birth */}
          <div>
            <label className={lbl}>Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
              style={inputStyle} className={inp}/>
          </div>

          {/* Email */}
          <div>
            <label className={lbl}>Email</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="you@kotak.com" style={inputStyle} className={`${inp} pl-10`}/>
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className={lbl}>Phone Number</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.1 1.18 2 2 0 012.11 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.08 8.96a16 16 0 006.29 6.29l1.32-1.32a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <input name="phoneNumber" type="tel" value={form.phoneNumber} onChange={handleChange}
                placeholder="+91 98765 43210" style={inputStyle} className={`${inp} pl-10`}/>
            </div>
          </div>

          {/* PAN Card */}
          <div>
            <label className={lbl}>PAN Card</label>
            <input name="panCard" type="text" value={form.panCard} onChange={handleChange}
              placeholder="ABCDE1234F" maxLength={10} style={inputStyle} className={`${inp} uppercase`}/>
          </div>

          {/* Address */}
          <div>
            <label className={lbl}>Address</label>
            <textarea name="address" value={form.address}
              onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
              placeholder="123, Business Park, Mumbai, Maharashtra 400001"
              rows={2} style={{ ...inputStyle, resize: "none" }} className={`${inp} pt-2.5`}/>
          </div>

          {/* GST Number */}
          <div>
            <label className={lbl}>GST Number</label>
            <input name="gstNumber" type="text" value={form.gstNumber} onChange={handleChange}
              placeholder="22AAAAA0000A1Z5" maxLength={15} style={inputStyle} className={`${inp} uppercase`}/>
          </div>

          {/* Password */}
          <div>
            <label className={lbl}>Password</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handleChange}
                placeholder="Min. 8 characters" style={inputStyle} className={`${inp} pl-10 pr-12`}/>
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPwd ? <EyeOff/> : <Eye/>}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                      style={{ backgroundColor: i <= strength ? strengthColor : "#E5E7EB" }}/>
                  ))}
                </div>
                <p className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className={lbl}>Confirm Password</label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <input name="confirmPassword" type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                onChange={handleChange} onKeyDown={e => e.key === "Enter" && handleRegister()}
                placeholder="Re-enter password" style={inputStyle} className={`${inp} pl-10 pr-12`}/>
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff/> : <Eye/>}
              </button>
            </div>
            {form.confirmPassword && (
              <p className={`text-xs font-medium mt-1.5 ${form.password === form.confirmPassword ? "text-green-600" : "text-red-500"}`}>
                {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-50/80 border border-red-200 rounded-xl px-3 py-2.5">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-red-500 shrink-0">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleRegister} disabled={loading}
            className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            style={{ background: loading ? "#555" : "#1a1a1a", boxShadow: "0 4px 16px rgba(0,0,0,0.22)" }}
          >
            {loading
              ? <><svg className="animate-spin" width="15" height="15" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" strokeOpacity="0.3"/><path d="M12 2a10 10 0 0110 10" stroke="white" strokeWidth="3" strokeLinecap="round"/></svg>Creating account...</>
              : "Request Account"
            }
          </button>

          <p className="text-center text-xs text-gray-500 pt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ED1C24] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>

      <p className="relative z-10 text-center text-xs text-gray-400/80 mt-6">
        © 2026 Kotak Mahindra Asset Management Company Ltd.
      </p>
    </div>
  );
}