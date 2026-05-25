import Link from "next/link";
import Navbar from "@/components/Navbar";
import NeuralCanvas from "@/components/NeuralCanvas";

export default function Home() {
  return (
    <>
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero-section">
        <NeuralCanvas />

        {/* Radial vignette overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, transparent 30%, rgba(8,12,16,0.7) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Hero content */}
        <div
          className="relative z-10 flex flex-col items-center justify-center text-center flex-1 px-6 md:px-10"
          style={{ paddingTop: "120px", paddingBottom: "80px" }}
        >
          <h1
            className="animate-fade-up"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontWeight: 800,
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              maxWidth: "820px",
              color: "#ffffff",
              marginBottom: "28px",
            }}
          >
            Your Organization is Designed
            <br />
            for Humans Who Don&apos;t Exist
          </h1>

          <p
            className="animate-fade-up delay-200"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "520px",
              lineHeight: 1.65,
              marginBottom: "12px",
            }}
          >
            You design strategies, tools and processes for rational actors who
            follow instructions.
          </p>

          <p
            className="animate-fade-up delay-300"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "520px",
              lineHeight: 1.65,
              marginBottom: "12px",
            }}
          >
            Real humans run on familiarity, social proof, and attention — not
            logic.
          </p>

          <p
            className="animate-fade-up delay-400"
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              color: "rgba(255,255,255,0.65)",
              maxWidth: "520px",
              lineHeight: 1.65,
              marginBottom: "44px",
            }}
          >
            That&apos;s why adoption fails.
          </p>

          <Link
            href="/assessment"
            className="cta-button animate-fade-up delay-500"
          >
            Take the 5-Minute Assessment
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M7 17L17 7M17 7H7M17 7V17" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer
        style={{
          background: "rgba(8,12,16,0.98)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "24px 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <span
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          © 2026 SPADE OS
        </span>
        <span
          style={{
            fontSize: "0.82rem",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          Built for scaling companies that run on real humans.
        </span>
      </footer>
    </>
  );
}
