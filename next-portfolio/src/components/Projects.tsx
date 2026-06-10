"use client";
import { useState } from "react";

type Category = "AI" | "Full-stack" | "Backend" | "Mobile";

interface Project {
  name: string;
  categories: Category[];
  context?: string;
  description: string;
  stack: string[];
  liveUrl?: string;
  liveLabel?: string;
  githubUrl?: string;
}

const projects: Project[] = [
  {
    name: "Ember",
    categories: ["Mobile", "Backend"],
    description:
      "A cross-platform habit-tracking app for building routines with friends, featuring real-time shared routines and leaderboards via Apple HealthKit and Android Health Connect. Built a local-first sync engine with an MMKV-persisted outbox, optimistic updates, and dead-letter recovery to stay consistent on unreliable mobile networks.",
    stack: ["React Native", "TypeScript", "AppSync", "AWS Lambda", "DynamoDB", "SQS", "Firebase"],
  },
  {
    name: "BaseCrew",
    categories: ["Full-stack"],
    description:
      "A live marketing website built for a contractor company, designed and shipped end to end with a responsive layout and fast static delivery.",
    stack: ["Next.js", "React", "Tailwind CSS", "Vercel"],
    liveUrl: "https://basecrew.us",
    liveLabel: "basecrew.us",
  },
  {
    name: "Campus Connect",
    categories: ["Full-stack", "Backend"],
    description:
      "A serverless campus marketplace with reliable Stripe payments and instant, secure digital delivery. Cut P99 API latency by 65% under 2,500 concurrent users by resolving DynamoDB hot partitions and API Gateway bottlenecks.",
    stack: ["React", "Next.js", "AWS Lambda", "API Gateway", "DynamoDB", "S3", "CloudFront", "Stripe", "AWS SAM"],
    liveUrl: "https://campus-connect-csc-482.vercel.app/",
    liveLabel: "Live demo",
    githubUrl: "https://github.com/Baljinnyam23/Campus-Connect",
  },
  {
    name: "StudyPlanner",
    categories: ["Full-stack"],
    description:
      "A real-time collaborative study planner where students create, share, and update group study schedules live, with drag-and-drop tasks and instant updates across users.",
    stack: ["React", "Flask", "PostgreSQL", "Socket.IO", "Vercel", "Render"],
    liveUrl: "https://project1-topaz-mu.vercel.app",
    liveLabel: "Live demo",
    githubUrl: "https://github.com/Baljinnyam-P/Study-Planner",
  },
  {
    name: "FriendAligner",
    categories: ["Full-stack", "Backend"],
    description:
      "A group scheduling app that helps friends find the best time and place to meet, with shared calendars, real-time updates, and venue suggestions via Google Places.",
    stack: ["Flask", "MySQL", "SQLAlchemy", "Google Places API"],
    liveUrl: "https://www.youtube.com/watch?v=GhvZoOWvor4",
    liveLabel: "Demo",
    githubUrl: "https://github.com/Baljinnyam-P/FriendAligner",
  },
  {
    name: "Enterprise RAG Retrieval System",
    categories: ["AI", "Backend"],
    context: "Pinecone Studio",
    description:
      "Python RAG and context pipelines grounded in customer knowledge bases and operational data, improving response accuracy by 18% and cutting document processing turnaround by 45%.",
    stack: ["Python", "RAG", "Vector search", "AWS Lambda", "DynamoDB"],
  },
  {
    name: "LLM Evaluation & Observability",
    categories: ["AI", "Backend"],
    context: "Pinecone Studio",
    description:
      "Evaluation and observability tooling for production LLM workflows, using golden test cases and runtime metrics like retrieval quality, latency, and token usage to catch regressions before rollout across customer environments.",
    stack: ["Python", "LLM evaluation", "Observability", "Docker", "CI/CD"],
  },
  {
    name: "AliPay+ Cross-Border Payments",
    categories: ["Backend"],
    context: "Golomt Bank, SocialPay",
    description:
      "Cross-border payment integrations on Spring Boot microservices handling 8,000+ daily transactions at 99.95% uptime, with HMAC signing, retry handling, idempotent processing, and Resilience4j circuit breakers.",
    stack: ["Java", "Spring Boot", "Kafka", "Microservices", "Resilience4j"],
  },
  {
    name: "LLM-Assisted Incident Debugging",
    categories: ["AI", "Backend"],
    context: "Golomt Bank, SocialPay",
    description:
      "An LLM-assisted log correlation tool across distributed payment services that cut transaction failure diagnosis from 20 to 30 minutes down to under 5 minutes, paired with distributed tracing across services.",
    stack: ["Python", "LLM", "Distributed tracing", "Kafka"],
  },
  {
    name: "Document Automation Engine",
    categories: ["AI", "Full-stack"],
    context: "PCDP LLC",
    description:
      "LLM generation and RAG retrieval workflows for construction proposals and permitting documentation that reduced manual document preparation time by 30 to 40%.",
    stack: ["Python", "LLM", "RAG", "Flask"],
  },
];

const filters: Array<"All" | Category> = ["All", "AI", "Full-stack", "Backend", "Mobile"];

export default function Projects() {
  const [active, setActive] = useState<"All" | Category>("All");

  const visible = active === "All" ? projects : projects.filter((p) => p.categories.includes(active));

  return (
    <section id="projects" className="section">
      <div className="shell">
        <p className="kicker">02 / Projects</p>
        <h2 className="section-title" style={{ marginBottom: "1.75rem" }}>
          Things I&apos;ve built
        </h2>

        {/* Filters */}
        <div role="tablist" aria-label="Filter projects" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2.5rem" }}>
          {filters.map((f) => {
            const isActive = active === f;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(f)}
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                  padding: "0.4rem 0.9rem",
                  borderRadius: "999px",
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor: isActive ? "var(--color-ink)" : "var(--color-line-strong)",
                  background: isActive ? "var(--color-ink)" : "transparent",
                  color: isActive ? "var(--color-paper)" : "var(--color-ink-soft)",
                  transition: "all 0.18s ease",
                }}
              >
                {f}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: "1.25rem" }}>
          {visible.map((p) => (
            <article
              key={p.name}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "var(--color-card)",
                border: "1px solid var(--color-line)",
                borderRadius: "10px",
                padding: "1.5rem",
              }}
            >
              <div className="flex items-baseline" style={{ gap: "0.75rem", flexWrap: "wrap", marginBottom: "0.3rem" }}>
                <h3 style={{ fontSize: "1.2rem" }}>{p.name}</h3>
                {p.context && (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-muted)" }}>{p.context}</span>
                )}
              </div>

              <p className="kicker" style={{ marginBottom: "0.85rem" }}>{p.categories.join(" / ")}</p>

              <p style={{ fontSize: "0.95rem", lineHeight: 1.6, marginBottom: "1.1rem", flex: 1 }}>
                {p.description}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: (p.liveUrl || p.githubUrl) ? "1.1rem" : 0 }}>
                {p.stack.map((t) => (
                  <span key={t} className="chip" style={{ fontSize: "0.75rem", padding: "2px 8px" }}>{t}</span>
                ))}
              </div>

              {(p.liveUrl || p.githubUrl) && (
                <div className="flex items-center" style={{ gap: "1.25rem" }}>
                  {p.liveUrl && (
                    <a href={p.liveUrl} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                      {p.liveLabel}
                    </a>
                  )}
                  {p.githubUrl && (
                    <a href={p.githubUrl} target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: "0.88rem", fontWeight: 500 }}>
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>

        <div style={{ marginTop: "2.25rem" }}>
          <a href="https://github.com/Baljinnyam-P" target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: "0.92rem", fontWeight: 500 }}>
            See more on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
