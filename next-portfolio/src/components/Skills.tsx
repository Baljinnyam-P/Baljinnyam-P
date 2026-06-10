interface SkillGroup {
  label: string;
  items: string[];
}

const groups: SkillGroup[] = [
  {
    label: "AI & ML",
    items: ["RAG pipelines", "Agentic workflows", "LLM evaluation", "Retrieval observability", "Prompt engineering", "Tool-calling", "Vector search"],
  },
  {
    label: "Languages",
    items: ["Python", "TypeScript", "Java", "JavaScript", "SQL"],
  },
  {
    label: "Backend & Cloud",
    items: ["AWS Lambda", "DynamoDB", "SQS", "AppSync", "API Gateway", "S3", "CDK", "CloudFront", "Docker", "CI/CD", "Kafka", "Stripe"],
  },
  {
    label: "Frameworks",
    items: ["React", "Next.js", "Node.js", "Spring Boot", "React Native", "PostgreSQL", "MongoDB", "Redis", "Firebase"],
  },
];

export default function Skills() {
  return (
    <section id="skills" className="section">
      <div className="shell">
        <p className="kicker">03 / Skills</p>
        <h2 className="section-title" style={{ marginBottom: "3rem" }}>
          Tools I work with
        </h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {groups.map((g, idx) => (
            <div
              key={g.label}
              className="grid grid-cols-1 sm:grid-cols-[170px_1fr]"
              style={{
                gap: "0.85rem",
                paddingTop: idx === 0 ? 0 : "1.6rem",
                paddingBottom: idx === groups.length - 1 ? 0 : "1.6rem",
                borderTop: idx === 0 ? "none" : "1px solid var(--color-line)",
              }}
            >
              <p style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", color: "var(--color-ink)" }}>
                {g.label}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {g.items.map((item) => (
                  <span key={item} className="chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Education */}
        <div
          style={{ marginTop: "3.5rem", paddingTop: "3rem", borderTop: "1px solid var(--color-line)" }}
          className="grid grid-cols-1 sm:grid-cols-[170px_1fr]"
        >
          <p className="kicker" style={{ marginBottom: "1rem" }}>Education</p>
          <div>
            <h3 style={{ fontSize: "1.2rem" }}>Adelphi University</h3>
            <p style={{ marginTop: "0.3rem" }}>B.S. Computer Science, GPA 3.99</p>
            <p style={{ marginTop: "0.6rem", fontSize: "0.92rem", color: "var(--color-muted)" }}>
              Wells Fargo x GCA Early Talent Competition, Top 10 Finalist
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
