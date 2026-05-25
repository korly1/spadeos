"use client";

import { useState } from "react";
import Link from "next/link";

const PAIN_POINTS = [
  { letter: "A", label: "New tools launched but never fully adopted" },
  { letter: "B", label: "Process changes that reverted to old habits" },
  {
    letter: "C",
    label: "Transformation initiatives that stalled after initial enthusiasm",
  },
  { letter: "D", label: "Strategy that was clear but never executed" },
  {
    letter: "E",
    label: "Teams agreeing in meetings but not changing behavior",
  },
];

const ROLE_OPTIONS = [
  "CEO/Founder",
  "COO/VP Operations",
  "VP/Director Product",
  "VP/Director Strategy",
  "Other",
];

const COMPANY_SIZE_OPTIONS = [
  "50-200",
  "201-500",
  "501-1000",
  "1000+",
];

const URGENCY_OPTIONS = [
  "1 - Need this solved ASAP, ready to invest",
  "2 - Actively looking for solutions",
  "3 - On our roadmap, not immediate",
  "4 - Curious, no urgency",
  "5 - Just researching",
];

type FormState = {
  role: string;
  company_size: string;
  pain_points: string[];
  urgency: string;
  tried_so_far: string;
  email: string;
};

type Status = "idle" | "submitting" | "success" | "error";

export default function AssessmentPage() {
  const [form, setForm] = useState<FormState>({
    role: "",
    company_size: "",
    pain_points: [],
    urgency: "",
    tried_so_far: "",
    email: "",
  });
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const togglePainPoint = (label: string) => {
    setForm((prev) => ({
      ...prev,
      pain_points: prev.pain_points.includes(label)
        ? prev.pain_points.filter((p) => p !== label)
        : [...prev.pain_points, label],
    }));
  };

  const handleSubmit = async () => {
    if (!form.role || !form.company_size || !form.pain_points.length || !form.urgency) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    setErrorMsg("");
    setStatus("submitting");

    try {
      const res = await fetch("/api/submit-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Submission failed");
      }

      setStatus("success");
    } catch (err: unknown) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080c10",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}
      >
        <div
          className="glass-card animate-fade-up"
          style={{ maxWidth: "480px", width: "100%", padding: "48px 40px", textAlign: "center" }}
        >
          <div className="success-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, marginBottom: "16px" }}>
            Assessment Received
          </h2>
          <p style={{ color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: "32px" }}>
            Thank you for your responses. We&apos;ll review your submission and send
            insights to {form.email || "your inbox"} shortly.
          </p>
          <Link href="/" className="cta-button" style={{ justifyContent: "center" }}>
            Back to SPADE OS
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080c10",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          background: "rgba(8,12,16,0.9)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "18px 32px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="12" y1="2" x2="12" y2="22" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="2" y1="12" x2="22" y2="12" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
            <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="12" r="2" fill="#14b8a6"/>
          </svg>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.1em", color: "white", textTransform: "uppercase" }}>
            SPADE OS
          </span>
        </Link>
      </div>

      {/* Form container */}
      <div
        style={{
          flex: 1,
          maxWidth: "680px",
          width: "100%",
          margin: "0 auto",
          padding: "48px 24px 80px",
        }}
      >
        <div className="animate-fade-up" style={{ marginBottom: "40px" }}>
          <h1
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 800,
              fontSize: "clamp(1.8rem, 4vw, 2.6rem)",
              lineHeight: 1.1,
              marginBottom: "12px",
            }}
          >
            Strategy Execution Assessment
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}>
            Takes about 5 minutes. Helps us understand your situation.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {/* Role */}
          <div className="animate-fade-up delay-100">
            <label className="form-label">
              What&apos;s your role?{" "}
              <span style={{ color: "var(--teal)" }}>*</span>
            </label>
            <select
              className="form-select"
              value={form.role}
              onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
            >
              <option value="">Select your role</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Company size */}
          <div className="animate-fade-up delay-200">
            <label className="form-label">
              Company size?{" "}
              <span style={{ color: "var(--teal)" }}>*</span>
            </label>
            <select
              className="form-select"
              value={form.company_size}
              onChange={(e) => setForm((p) => ({ ...p, company_size: e.target.value }))}
            >
              <option value="">Select company size</option>
              {COMPANY_SIZE_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Pain points */}
          <div className="animate-fade-up delay-300">
            <label className="form-label">
              Which of these have you experienced in the past 12 months?{" "}
              <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
                (Select all that apply)
              </span>{" "}
              <span style={{ color: "var(--teal)" }}>*</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {PAIN_POINTS.map(({ letter, label }) => (
                <button
                  key={letter}
                  type="button"
                  className={`chip ${form.pain_points.includes(label) ? "selected" : ""}`}
                  onClick={() => togglePainPoint(label)}
                >
                  <span className="chip-letter">{letter}</span>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Urgency */}
          <div className="animate-fade-up delay-400">
            <label className="form-label">
              How urgent is solving this for your organization?{" "}
              <span style={{ color: "var(--teal)" }}>*</span>
            </label>
            <select
              className="form-select"
              value={form.urgency}
              onChange={(e) => setForm((p) => ({ ...p, urgency: e.target.value }))}
            >
              <option value="">Select urgency level</option>
              {URGENCY_OPTIONS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>

          {/* Tried so far */}
          <div className="animate-fade-up delay-500">
            <label className="form-label">What have you tried to fix this?</label>
            <textarea
              className="form-textarea"
              placeholder="e.g. Training programs, new software, consultants..."
              value={form.tried_so_far}
              onChange={(e) => setForm((p) => ({ ...p, tried_so_far: e.target.value }))}
            />
          </div>

          {/* Email */}
          <div className="animate-fade-up delay-500">
            <label className="form-label">
              Email to receive insights from our research
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            />
          </div>

          {/* Error */}
          {errorMsg && (
            <p style={{ color: "#f87171", fontSize: "0.9rem" }}>{errorMsg}</p>
          )}

          {/* Submit */}
          <div className="animate-fade-up delay-700">
            <button
              type="button"
              className="cta-button"
              onClick={handleSubmit}
              disabled={status === "submitting"}
              style={{
                opacity: status === "submitting" ? 0.7 : 1,
                cursor: status === "submitting" ? "wait" : "pointer",
              }}
            >
              {status === "submitting" ? "Submitting..." : "Submit"}
              {status !== "submitting" && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "20px 32px",
          textAlign: "center",
        }}
      >
        <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>
          © 2026 SPADE OS
        </span>
      </footer>
    </div>
  );
}
