"use client";
export default function MobileStickyBar({
  phoneNumber,
  phoneTel,
}: {
  phoneNumber: string;
  phoneTel: string;
}) {
  return (
    <div className="mobile-sticky-bar" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <a
        href={`tel:${phoneTel}`}
        style={{
          display: "block",
          textAlign: "center",
          padding: "16px",
          color: "white",
          fontWeight: 700,
          fontSize: "1rem",
          textDecoration: "none",
        }}
      >
        Call Now &mdash; {phoneNumber}
      </a>
    </div>
  );
}
