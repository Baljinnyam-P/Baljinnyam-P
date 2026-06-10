import Image from "next/image";

const links = [
  { label: "GitHub", href: "https://github.com/Baljinnyam-P" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/baljinnyamm" },
  { label: "Email", href: "mailto:baljaa367@gmail.com" },
];

export default function Hero() {
  return (
    <header id="about" style={{ paddingTop: "7.5rem", paddingBottom: "4.5rem" }}>
      <div className="shell">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] md:items-end" style={{ gap: "2.5rem" }}>
          {/* Left: identity */}
          <div>
            <p className="kicker">Full Stack / AI Engineer &middot; Seattle, WA</p>
            <h1
              style={{ fontSize: "clamp(2.6rem, 7vw, 4.5rem)", marginTop: "1rem", lineHeight: 1.04 }}
              className="balance"
            >
              Baljinnyam
              <br />
              Puntsagnorov
            </h1>
            <p style={{ fontSize: "1.1rem", maxWidth: "36rem", marginTop: "1.5rem" }} className="balance">
              I build production AI systems and distributed backend infrastructure, spanning RAG
              pipelines, LLM evaluation systems, and event-driven financial services operating at
              production scale with real reliability constraints.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", marginTop: "1.75rem" }}>
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="link"
                  style={{ fontSize: "0.95rem", fontWeight: 500 }}
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: photo, clean hairline frame */}
          <div
            style={{
              width: "min(220px, 60vw)",
              aspectRatio: "4 / 5",
              position: "relative",
              borderRadius: "8px",
              overflow: "hidden",
              border: "1px solid var(--color-line-strong)",
              background: "var(--color-card)",
              filter: "saturate(0.92)",
            }}
            className="justify-self-start md:justify-self-end"
          >
            <Image
              src="/images/profile.jpg"
              alt="Baljinnyam Puntsagnorov"
              fill
              sizes="220px"
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        {/* About prose */}
        <div
          style={{ marginTop: "4rem", paddingTop: "3rem", borderTop: "1px solid var(--color-line)" }}
          className="grid grid-cols-1 md:grid-cols-[140px_1fr]"
        >
          <p className="kicker" style={{ marginBottom: "1rem" }}>About</p>
          <div style={{ maxWidth: "42rem", display: "flex", flexDirection: "column", gap: "1.1rem" }}>
            <p style={{ fontSize: "1.05rem" }}>
              I am a software engineer focused on building production AI systems, distributed backend
              services, and reliability-critical infrastructure. My work spans applied AI systems,
              event-driven architectures, and full-stack applications designed to operate under real
              production constraints.
            </p>
            <p style={{ fontSize: "1.05rem" }}>
              I specialize in systems involving RAG pipelines, LLM evaluation and observability, and
              workflow automation layered on top of structured backend systems. My focus is on making
              AI systems reliable in production, especially where retrieval quality, latency, and
              system correctness directly affect real users.
            </p>
            <p style={{ fontSize: "1.05rem" }}>
              I have shipped systems acros fintech, e-commerce, SaaS and enterprise AI environments. At Golomt Bank, I
              built event-driven payment infrastructure for a large-scale digital wallet system
              handling thousands of daily transactions with strict reliability requirements. More
              recently, I have worked with enterprise customers on designing and deploying production
              AI workflows, including retrieval systems, evaluation frameworks, and automation
              pipelines that replace manual operational work.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
