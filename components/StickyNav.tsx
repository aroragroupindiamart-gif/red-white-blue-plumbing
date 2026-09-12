"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { BRAND_NAME, PHONE_NUMBER, PHONE_TEL, NICHE } from "@/lib/config";

function slugToTitle(s: string): string {
  return s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function StickyNav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const parts = pathname.split("/").filter(Boolean);

  let contextLabel: string | null = null;
  let stateSlug: string | null = null;
  let citySlug:  string | null = null;

  if (parts.length >= 2) {
    stateSlug = parts[0];
    citySlug  = parts[1];
    contextLabel = `${slugToTitle(citySlug)}, ${stateSlug.toUpperCase()}`;
  } else if (parts.length === 1 && parts[0].length === 2) {
    stateSlug = parts[0];
  }

  const navLinks: { label: string; href: string }[] =
    parts.length >= 3 && stateSlug && citySlug
      ? [
          { label: slugToTitle(citySlug), href: `/${stateSlug}/${citySlug}` },
          { label: stateSlug.toUpperCase(), href: `/${stateSlug}` },
          { label: "All States", href: "/" },
        ]
      : parts.length >= 2 && stateSlug && citySlug
      ? [
          { label: stateSlug.toUpperCase(), href: `/${stateSlug}` },
          { label: "All States", href: "/" },
        ]
      : parts.length === 1 && stateSlug
      ? [{ label: "All States", href: "/" }]
      : [
          { label: NICHE, href: "/" },
          { label: "All States", href: "/" },
        ];

  return (
    <nav
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        backgroundColor: scrolled ? "rgba(10,15,30,0.97)" : "rgba(10,15,30,0.85)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(10px)",
        boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.05)" : "none",
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <Link href="/" style={{ color: "white", textDecoration: "none", fontWeight: 700, fontSize: "1.1rem", whiteSpace: "nowrap" }}>
          {BRAND_NAME}
          {contextLabel && (
            <span className="nav-context-label" style={{ color: "#94a3b8", fontWeight: 400, fontSize: "0.85rem", marginLeft: 8 }}>
              — {contextLabel}
            </span>
          )}
        </Link>

        <div style={{ display: "flex", gap: 24, fontSize: "0.85rem" }} className="nav-links">
          {navLinks.map((link) => (
            <Link key={link.href + link.label} href={link.href} style={{ color: "#94a3b8", textDecoration: "none" }}>
              {link.label}
            </Link>
          ))}
        </div>

        <a
          href={`tel:${PHONE_TEL}`}
          className="nav-phone-btn"
          style={{
            backgroundColor: "#f97316",
            color: "white",
            fontWeight: 700,
            padding: "9px 18px",
            borderRadius: 6,
            textDecoration: "none",
            fontSize: "0.9rem",
            whiteSpace: "nowrap",
          }}
        >
          {PHONE_NUMBER}
        </a>
      </div>
    </nav>
  );
}
