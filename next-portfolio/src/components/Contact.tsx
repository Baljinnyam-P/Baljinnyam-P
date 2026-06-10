const details = [
  { label: "Email", value: "baljaa367@gmail.com", href: "mailto:baljaa367@gmail.com" },
  { label: "LinkedIn", value: "linkedin.com/in/baljinnyamm", href: "https://www.linkedin.com/in/baljinnyamm" },
  { label: "GitHub", value: "github.com/Baljinnyam-P", href: "https://github.com/Baljinnyam-P" },
  { label: "Location", value: "Seattle, WA (open to relocate)" },
];

export default function Contact() {
  return (
    <section id="contact" className="section">
      <div className="shell">
        <p className="kicker">04 / Contact</p>
        <h2 className="section-title balance" style={{ marginBottom: "1.25rem", maxWidth: "22rem" }}>
          Let&apos;s build something
        </h2>
        <p style={{ fontSize: "1.05rem", maxWidth: "34rem", marginBottom: "2.5rem" }} className="balance">
          I&apos;m always happy to talk about AI systems, distributed backends, and product
          engineering. Email is the fastest way to reach me.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "1.5rem", marginBottom: "2.75rem" }}>
          {details.map((d) => (
            <div key={d.label} style={{ minWidth: 0, paddingTop: "1rem", borderTop: "1px solid var(--color-line)" }}>
              <p className="kicker" style={{ marginBottom: "0.4rem" }}>{d.label}</p>
              {d.href ? (
                <a
                  href={d.href}
                  target={d.href.startsWith("http") ? "_blank" : undefined}
                  rel={d.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="link break-anywhere"
                  style={{ fontSize: "1.05rem" }}
                >
                  {d.value}
                </a>
              ) : (
                <p className="break-anywhere" style={{ fontSize: "1.05rem", color: "var(--color-ink)" }}>{d.value}</p>
              )}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row" style={{ gap: "1rem" }}>
          <a href="mailto:baljaa367@gmail.com" className="btn btn-solid">
            Send an email
          </a>
          <a href="/Baljinnyam_Puntsagnorov_Julius.pdf" download className="btn btn-ghost">
            Download resume
          </a>
        </div>
      </div>
    </section>
  );
}
