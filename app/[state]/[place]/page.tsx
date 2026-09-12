import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllLocations, getLocation, getServicesByLocationTier } from "@/lib/data";
import { BRAND_NAME, PHONE_NUMBER, PHONE_TEL, SITE_URL, NICHE, NICHE_PLURAL } from "@/lib/config";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const locations = await getAllLocations();
  return locations.map((loc) => ({
    state: loc.state_code.toLowerCase(),
    place: loc.place_slug,
  }));
}

interface Props {
  params: Promise<{ state: string; place: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, place } = await params;
  const stateCode = state.toUpperCase();
  const loc = await getLocation(stateCode, place);
  if (!loc) return { title: "Not Found" };
  const canonicalUrl = `${SITE_URL}/${stateCode.toLowerCase()}/${loc.place_slug}`;
  return {
    title: `${NICHE_PLURAL} in ${loc.place_name}, ${stateCode} | ${BRAND_NAME}`,
    description: `Find licensed ${NICHE_PLURAL.toLowerCase()} in ${loc.place_name}, ${loc.state_name}. 24/7 service available. Call ${PHONE_NUMBER}.`,
    alternates: { canonical: canonicalUrl },
    openGraph: { url: canonicalUrl },
  };
}

export default async function CityPage({ params }: Props) {
  const { state, place } = await params;
  const stateCode = state.toUpperCase();
  const loc = await getLocation(stateCode, place);
  if (!loc) notFound();

  const services = await getServicesByLocationTier(loc.tier);

  return (
    <>
      <div className="announcement-bar" style={{ textAlign: "center", padding: "10px 24px", fontSize: "0.85rem", color: "#94a3b8", paddingTop: 80 }}>
        <span style={{ color: "#f97316", fontWeight: 700 }}>24/7 SERVICE</span>
        {" "}&mdash; Serving {loc.place_name}, {stateCode} &mdash;{" "}
        <a href={`tel:${PHONE_TEL}`} style={{ color: "white", fontWeight: 700 }}>{PHONE_NUMBER}</a>
      </div>

      <section className="hero-gradient" style={{ padding: "60px 24px 50px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <nav style={{ marginBottom: 24, fontSize: "0.8rem", color: "#64748b" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <Link href={`/${stateCode.toLowerCase()}`} style={{ color: "#64748b", textDecoration: "none" }}>{loc.state_name}</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "#94a3b8" }}>{loc.place_name}</span>
          </nav>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#f97316", marginBottom: 12 }}>
            {NICHE.toUpperCase()} IN {loc.place_name.toUpperCase()}, {stateCode}
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", marginBottom: 16, lineHeight: 1.15 }}>
            {NICHE} in {loc.place_name}, {stateCode}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 700, marginBottom: 32 }}>
            Our licensed and insured {NICHE_PLURAL.toLowerCase()} in {loc.place_name} are ready to handle any job —
            from emergency calls to scheduled service. Available 24/7.
          </p>
          <a href={`tel:${PHONE_TEL}`} className="btn-primary">Call {PHONE_NUMBER}</a>
        </div>
      </section>

      <section style={{ padding: "50px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", marginBottom: 8 }}>
            Available Services in {loc.place_name}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: "0.9rem" }}>
            {services.length} {NICHE.toLowerCase()} services available
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
            {services.map((svc) => (
              <Link key={svc.id} href={`/${stateCode.toLowerCase()}/${loc.place_slug}/${svc.service_slug}`} className="service-card">
                <div style={{ fontWeight: 700, color: "white", marginBottom: 6, fontSize: "0.95rem" }}>
                  {svc.service_name}
                </div>
                <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                  {svc.base_keywords[0] ?? svc.service_name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer city={loc.place_name} stateCode={stateCode} placeSlug={loc.place_slug} />
    </>
  );
}
