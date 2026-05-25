"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-5"
      style={{ background: "rgba(8,12,16,0.75)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
      <Link href="/" className="flex items-center gap-2 no-underline">
        {/* Snowflake-style icon matching the Framer site */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="12" y1="2" x2="12" y2="22" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="2" y1="12" x2="22" y2="12" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <line x1="19.07" y1="4.93" x2="4.93" y2="19.07" stroke="#14b8a6" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="12" r="2" fill="#14b8a6"/>
        </svg>
        <span className="font-bold text-white tracking-wide text-sm uppercase" style={{ fontFamily: "var(--font-dm-sans)", letterSpacing: "0.12em" }}>
          SPADE OS
        </span>
      </Link>

      <Link href="/assessment" className="cta-button" style={{ padding: "10px 20px", fontSize: "0.85rem" }}>
        Take the Assessment
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M7 17L17 7M17 7H7M17 7V17"/>
        </svg>
      </Link>
    </nav>
  );
}
