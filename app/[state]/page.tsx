import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getStates, getStateByCode, getLocationsByState } from "@/lib/data";
import { BRAND_NAME, PHONE_NUMBER, PHONE_TEL, SITE_URL, NICHE, NICHE_PLURAL } from "@/lib/config";
import Footer from "@/components/Footer";

export async function generateStaticParams() {
  const states = await getStates();
  return states.map((s) => ({ state: s.state_code.toLowerCase() }));
}

interface Props {
  params: Promise<{ state: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state } = await params;
  const stateCode = state.toUpperCase();
  const stateRow = await getStateByCode(stateCode);
  if (!stateRow) return { title: "Not Found" };
  const canonicalUrl = `${SITE_URL}/${stateCode.toLowerCase()}`;
  return {
    title: `${NICHE} in ${stateRow.state_name} | ${BRAND_NAME}`,
    description: `Find licensed ${NICHE_PLURAL.toLowerCase()} across ${stateRow.state_name}. Browse ${stateRow.location_count} cities with 24/7 service. Call ${PHONE_NUMBER}.`,
    alternates: { canonical: canonicalUrl },
    openGraph: { url: canonicalUrl },
  };
}

export default async function StatePage({ params }: Props) {
  const { state } = await params;
  const stateCode = state.toUpperCase();
  const [stateRow, locations] = await Promise.all([
    getStateByCode(stateCode),
    getLocationsByState(stateCode),
  ]);

  if (!stateRow) notFound();

  return (
    <>
      <div className="announcement-bar" style={{ textAlign: "center", padding: "10px 24px", fontSize: "0.85rem", color: "#94a3b8", paddingTop: 80 }}>
        <span style={{ color: "#f97316", fontWeight: 700 }}>24/7 SERVICE</span>
        {" "}&mdash;{" "}
        Serving All of {stateRow.state_name} &mdash;{" "}
        <a href={`tel:${PHONE_TEL}`} style={{ color: "white", fontWeight: 700 }}>{PHONE_NUMBER}</a>
      </div>

      <section className="hero-gradient" style={{ padding: "60px 24px 50px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <nav style={{ marginBottom: 24, fontSize: "0.8rem", color: "#64748b" }}>
            <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
            <span style={{ margin: "0 8px" }}>/</span>
            <span style={{ color: "#94a3b8" }}>{stateRow.state_name}</span>
          </nav>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#f97316", marginBottom: 12 }}>
            {NICHE.toUpperCase()} IN {stateRow.state_name.toUpperCase()}
          </div>
          <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)", fontWeight: 800, color: "white", marginBottom: 16, lineHeight: 1.15 }}>
            Local {NICHE_PLURAL} in {stateRow.state_name}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.7, maxWidth: 700, marginBottom: 32 }}>
            Browse our network of licensed, insured {NICHE_PLURAL.toLowerCase()} serving {stateRow.location_count} cities across {stateRow.state_name}.
            Available 24 hours a day, 7 days a week.
          </p>
          <a href={`tel:${PHONE_TEL}`} className="btn-primary">Call {PHONE_NUMBER}</a>
        </div>
      </section>

      <section style={{ padding: "50px 24px 80px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 700, color: "white", marginBottom: 8 }}>
            Cities in {stateRow.state_name}
          </h2>
          <p style={{ color: "#94a3b8", marginBottom: 28, fontSize: "0.9rem" }}>
            {locations.length} {locations.length === 1 ? "city" : "cities"} with local {NICHE.toLowerCase()} service
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {locations.map((loc) => (
              <Link key={loc.id} href={`/${stateCode.toLowerCase()}/${loc.place_slug}`} className="state-card">
                <div style={{ fontWeight: 700, color: "white", marginBottom: 4 }}>{loc.place_name}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                  Pop. {loc.population.toLocaleString()} &middot; Tier {loc.tier}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
