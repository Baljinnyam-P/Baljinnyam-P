interface Role {
  company: string;
  title: string;
  period: string;
  location: string;
  bullets: string[];
}

const roles: Role[] = [
  {
    company: "Pinecone Studio",
    title: "Forward Deployed Engineer",
    period: "Aug 2025 - Present",
    location: "Bellevue, WA",
    bullets: [
      "Reduced manual workflow effort by 40% across enterprise customers by leading technical discovery in 3 customer environments and turning operational requirements into production AI systems.",
      "Improved response accuracy by 18% and cut document processing turnaround by 45% with Python RAG and context pipelines grounded in customer knowledge bases and operational data.",
      "Caught retrieval regressions before rollout by building evaluation and observability tooling for production LLM workflows, using golden test cases and runtime metrics like retrieval quality, latency, and token usage.",
      "Cut dataset preparation from over three days to under four hours with LLM-driven synthetic data and validation pipelines for computer vision workflows.",
    ],
  },
  {
    company: "Golomt Bank, SocialPay",
    title: "Software Engineer",
    period: "May 2024 - Aug 2025",
    location: "Ulaanbaatar, MN",
    bullets: [
      "Handled 8,000+ daily transactions at 99.95% uptime by building AliPay+ cross-border payment integrations on Spring Boot microservices, with HMAC signing, retry handling, and idempotent transaction processing.",
      "Eliminated inconsistent payment states by redesigning transaction coordination across distributed payment services to prevent duplicate payments during retries and downstream failures.",
      "Cut false positives that eroded analyst trust by removing duplicate fraud alerts in retry-heavy Kafka consumers, redesigning event-driven processing around idempotency keys.",
      "Cut transaction failure diagnosis from 20 to 30 minutes down to under 5 minutes with an LLM-assisted log correlation tool across distributed payment services.",
    ],
  },
  {
    company: "PCDP LLC",
    title: "Software Developer",
    period: "Jun 2023 - May 2024",
    location: "Remote",
    bullets: [
      "Reduced administrative coordination time by an estimated 50% by replacing fragmented email and spreadsheet processes with a contractor intake platform for proposal submission and permitting, owning end-to-end development.",
      "Reduced manual document preparation by 30 to 40% by automating proposal and permitting documentation with LLM generation and RAG retrieval workflows.",
      "Shipped production features on schedule by working directly with non-technical stakeholders across multiple feedback cycles to refine requirements and prioritize delivery.",
    ],
  },
];

export default function ExperienceTimeline() {
  return (
    <section id="experience" className="section">
      <div className="shell">
        <p className="kicker">01 / Experience</p>
        <h2 className="section-title" style={{ marginBottom: "3rem" }}>
          Where I&apos;ve worked
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {roles.map((role, idx) => (
            <article
              key={role.company}
              className="grid grid-cols-1 md:grid-cols-[170px_1fr]"
              style={{
                gap: "1rem",
                paddingTop: idx === 0 ? 0 : "2.25rem",
                paddingBottom: idx === roles.length - 1 ? 0 : "2.25rem",
                borderTop: idx === 0 ? "none" : "1px solid var(--color-line)",
              }}
            >
              {/* Meta column */}
              <div>
                <p style={{ fontSize: "0.85rem", color: "var(--color-ink)", fontWeight: 500 }}>{role.period}</p>
                <p style={{ fontSize: "0.85rem", color: "var(--color-muted)", marginTop: "0.15rem" }}>{role.location}</p>
              </div>

              {/* Detail column */}
              <div>
                <h3 style={{ fontSize: "1.3rem" }}>{role.title}</h3>
                <p style={{ fontSize: "0.98rem", color: "var(--color-accent-deep)", marginTop: "0.2rem", marginBottom: "1.1rem" }}>
                  {role.company}
                </p>
                <ul style={{ display: "flex", flexDirection: "column", gap: "0.8rem", listStyle: "none" }}>
                  {role.bullets.map((b, i) => (
                    <li key={i} style={{ position: "relative", paddingLeft: "1.25rem", fontSize: "0.97rem", lineHeight: 1.65 }}>
                      <span
                        aria-hidden="true"
                        style={{ position: "absolute", left: 0, top: "0.66em", width: "12px", height: "1px", background: "var(--color-line-strong)" }}
                      />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
