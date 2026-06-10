"use client";
import { useState } from "react";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#skills", label: "Skills" },
  { href: "#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 w-full z-50"
      style={{
        background: "rgba(251, 250, 247, 0.85)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid var(--color-line)",
      }}
    >
      <div className="shell flex items-center justify-between" style={{ height: "64px" }}>
        <a
          href="#"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 600,
            fontSize: "1.15rem",
            color: "var(--color-ink)",
            letterSpacing: "-0.01em",
            textDecoration: "none",
          }}
        >
          Baljinnyam
          <span style={{ color: "var(--color-accent)" }}>.</span>
        </a>

        {/* Desktop */}
        <ul className="hidden md:flex items-center" style={{ gap: "1.9rem" }}>
          {navItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                style={{ fontSize: "0.9rem", color: "var(--color-ink-soft)", textDecoration: "none" }}
                className="hover:text-[var(--color-ink)] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/Baljinnyam_Puntsagnorov_Julius.pdf" download className="btn btn-solid" style={{ padding: "0.5rem 1.05rem", fontSize: "0.85rem" }}>
              Resume
            </a>
          </li>
        </ul>

        {/* Mobile toggle */}
        <button
          className="md:hidden flex h-11 w-11 flex-col items-center justify-center gap-[5px] rounded-lg"
          onClick={() => setOpen(!open)}
          aria-label="Toggle navigation"
          aria-expanded={open}
          aria-controls="mobile-nav"
          style={{ border: "1px solid var(--color-line-strong)", background: "var(--color-card)" }}
        >
          <span className={`block w-5 h-[1.5px] bg-[var(--color-ink)] transition-all duration-300 ${open ? "rotate-45 translate-y-[6.5px]" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[var(--color-ink)] transition-all duration-300 ${open ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-[1.5px] bg-[var(--color-ink)] transition-all duration-300 ${open ? "-rotate-45 -translate-y-[6.5px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-x-0 md:hidden"
          style={{ top: "64px", bottom: 0, background: "rgba(38, 34, 29, 0.25)" }}
          onClick={() => setOpen(false)}
        />
      )}
      <div
        id="mobile-nav"
        className={`fixed right-0 md:hidden flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
        style={{
          top: "64px",
          width: "min(18rem, calc(100vw - 2rem))",
          height: "calc(100dvh - 64px)",
          background: "var(--color-paper)",
          borderLeft: "1px solid var(--color-line)",
          padding: "1.75rem",
          gap: "1.25rem",
        }}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.1rem",
              color: "var(--color-ink)",
              textDecoration: "none",
              paddingBottom: "0.75rem",
              borderBottom: "1px solid var(--color-line)",
            }}
          >
            {item.label}
          </a>
        ))}
        <a
          href="/Baljinnyam_Puntsagnorov_Julius.pdf"
          download
          onClick={() => setOpen(false)}
          className="btn btn-solid"
          style={{ marginTop: "0.5rem" }}
        >
          Download Resume
        </a>
      </div>
    </nav>
  );
}
