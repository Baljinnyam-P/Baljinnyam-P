export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer style={{ borderTop: "1px solid var(--color-line)", paddingTop: "2.25rem", paddingBottom: "2.25rem" }}>
      <div
        className="shell flex flex-col sm:flex-row sm:items-center sm:justify-between"
        style={{ gap: "1rem" }}
      >
        <p style={{ fontFamily: "var(--font-display)", fontSize: "1rem", color: "var(--color-ink)" }}>
          Baljinnyam Puntsagnorov
        </p>

        <div className="flex items-center" style={{ gap: "1.5rem" }}>
          <a href="https://github.com/Baljinnyam-P" target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: "0.9rem" }}>
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/baljinnyamm" target="_blank" rel="noopener noreferrer" className="link" style={{ fontSize: "0.9rem" }}>
            LinkedIn
          </a>
          <span style={{ fontSize: "0.85rem", color: "var(--color-muted)" }}>{year}</span>
        </div>
      </div>
    </footer>
  );
}
