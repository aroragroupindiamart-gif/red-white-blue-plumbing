import Link from "next/link";
import { BRAND_NAME, PHONE_NUMBER, PHONE_TEL } from "@/lib/config";
import { getAllServices } from "@/lib/data";

export default async function Footer({
  city,
  stateCode,
  placeSlug,
}: {
  city?: string;
  stateCode?: string;
  placeSlug?: string;
}) {
  const allServices = await getAllServices();
  const footerServices = allServices.slice(0, 5);

  const location = city && stateCode ? `${city}, ${stateCode}` : "Nationwide";
  const hasContext = !!(stateCode && placeSlug);

  return (
    <footer style={{ backgroundColor: "#070c1a", borderTop: "1px solid #1e293b", padding: "48px 24px 80px", color: "#94a3b8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>
          <div>
            <div style={{ fontWeight: 800, color: "white", fontSize: "1.1rem", marginBottom: 12 }}>{BRAND_NAME}</div>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.6, marginBottom: 12 }}>
              Connecting you with trusted professionals {location !== "Nationwide" ? `in ${location}` : "across the US"}.
            </p>
            <a href={`tel:${PHONE_TEL}`} style={{ color: "#f97316", fontWeight: 700, textDecoration: "none" }}>
              {PHONE_NUMBER}
            </a>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "white", marginBottom: 12, fontSize: "0.85rem" }}>SERVICES</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
              {footerServices.map((svc) =>
                hasContext ? (
                  <Link key={svc.service_slug} href={`/${stateCode!.toLowerCase()}/${placeSlug}/${svc.service_slug}`} style={{ color: "#94a3b8", textDecoration: "none" }}>
                    {svc.service_name}
                  </Link>
                ) : (
                  <span key={svc.service_slug}>{svc.service_name}</span>
                )
              )}
            </div>
          </div>

          <div>
            <div style={{ fontWeight: 700, color: "white", marginBottom: 12, fontSize: "0.85rem" }}>NAVIGATE</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.85rem" }}>
              <Link href="/"         style={{ color: "#94a3b8", textDecoration: "none" }}>Home</Link>
              <Link href="/#states"  style={{ color: "#94a3b8", textDecoration: "none" }}>All States</Link>
              <Link href="/sitemap.xml" style={{ color: "#94a3b8", textDecoration: "none" }}>Sitemap</Link>
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid #1e293b", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12, fontSize: "0.8rem" }}>
          <span>&copy; {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.</span>
          <span>Licensed &amp; Insured &mdash; Available 24/7</span>
        </div>
      </div>
    </footer>
  );
}
