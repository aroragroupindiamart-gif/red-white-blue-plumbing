import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getLocation, getService,
  getSiblingServices, getNearbyLocations,
  isServiceAllowedForTier,
} from "@/lib/data";
import {
  BRAND_NAME, PHONE_NUMBER, PHONE_TEL, SITE_URL,
  NICHE, NICHE_PLURAL, NICHE_SINGULAR, SCHEMA_TYPE, CONTENT_SALT,
} from "@/lib/config";
import { selectVariant } from "@/lib/spintax";
import { CONTENT_PACK, renderTemplate } from "@/lib/content";
import Footer from "@/components/Footer";

export const revalidate = 3600;
export const dynamicParams = true;

interface Props {
  params: Promise<{ state: string; place: string; service: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state, place, service: serviceSlug } = await params;
  const stateCode = state.toUpperCase();
  const [loc, svc] = await Promise.all([getLocation(stateCode, place), getService(serviceSlug)]);
  if (!loc || !svc) return { title: "Not Found" };
  if (!(await isServiceAllowedForTier(svc.id, loc.tier))) return { title: "Not Found" };

  const title       = `${svc.service_name} in ${loc.place_name}, ${stateCode}`.slice(0, 60);
  const description = `Need ${svc.service_name.toLowerCase()} in ${loc.place_name}, ${loc.state_name}? ${BRAND_NAME} provides 24/7 licensed service. Call ${PHONE_NUMBER} now.`.slice(0, 155);
  const canonicalUrl = `${SITE_URL}/${stateCode.toLowerCase()}/${loc.place_slug}/${svc.service_slug}`;

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title, description, url: canonicalUrl },
  };
}

function introParagraph(svcName: string, cityName: string, stateName: string, keywords: string[], locId: number, svcId: number): string {
  const kw = selectVariant(keywords, locId, svcId, CONTENT_SALT);
  const template = selectVariant(CONTENT_PACK.intro, locId, svcId + 11, CONTENT_SALT);
  return renderTemplate(template, {
    kw, cityName,
    brandName: BRAND_NAME,
    nichePluralLower: NICHE_PLURAL.toLowerCase(),
    nicheLower: NICHE.toLowerCase(),
    phoneNumber: PHONE_NUMBER,
  });
}

function bodyParagraph1(svcName: string, cityName: string, keywords: string[], locId: number, svcId: number): string {
  const kw = selectVariant(keywords, locId, svcId + 1, CONTENT_SALT);
  const template = selectVariant(CONTENT_PACK.body1, locId, svcId + 3, CONTENT_SALT);
  return renderTemplate(template, {
    kw, cityName,
    brandName: BRAND_NAME,
    nichePluralLower: NICHE_PLURAL.toLowerCase(),
    nicheLower: NICHE.toLowerCase(),
    phoneNumber: PHONE_NUMBER,
  });
}

function bodyParagraph2(svcName: string, cityName: string, keywords: string[], locId: number, svcId: number): string {
  const kw = selectVariant(keywords, locId, svcId + 2, CONTENT_SALT);
  const template = selectVariant(CONTENT_PACK.body2, locId, svcId + 5, CONTENT_SALT);
  return renderTemplate(template, {
    kw, cityName,
    brandName: BRAND_NAME,
    nichePluralLower: NICHE_PLURAL.toLowerCase(),
    nicheLower: NICHE.toLowerCase(),
    phoneNumber: PHONE_NUMBER,
  });
}

function trustBullets(svcName: string, cityName: string, keywords: string[], locId: number, svcId: number): string[] {
  const kw = selectVariant(keywords, locId, svcId + 3, CONTENT_SALT);
  const sets = CONTENT_PACK.trustBulletSets;
  const set = sets[Math.abs((locId * 31 + svcId + CONTENT_SALT * 97) % sets.length)];
  return set.map((template) =>
    renderTemplate(template, {
      kw, cityName,
      brandName: BRAND_NAME,
      nichePluralLower: NICHE_PLURAL.toLowerCase(),
      nicheLower: NICHE.toLowerCase(),
      phoneNumber: PHONE_NUMBER,
    })
  );
}

function faqItems(svcName: string, cityName: string, keywords: string[], locId: number, svcId: number) {
  const kw0 = selectVariant(keywords, locId, svcId, CONTENT_SALT);
  const kw1 = selectVariant(keywords, locId, svcId + 4, CONTENT_SALT);
  const vars = {
    kw0, kw1, cityName,
    brandName: BRAND_NAME,
    nichePluralLower: NICHE_PLURAL.toLowerCase(),
    nicheLower: NICHE.toLowerCase(),
    phoneNumber: PHONE_NUMBER,
  };
  return [
    {
      q: `How much does ${svcName.toLowerCase()} cost in ${cityName}?`,
      a: renderTemplate(selectVariant(CONTENT_PACK.faqCostAnswers, locId, svcId, CONTENT_SALT), vars),
    },
    {
      q: `How quickly can a ${NICHE_SINGULAR.toLowerCase()} arrive in ${cityName}?`,
      a: renderTemplate(selectVariant(CONTENT_PACK.faqArrivalAnswers, locId, svcId + 1, CONTENT_SALT), vars),
    },
    {
      q: `Are your ${NICHE_PLURAL.toLowerCase()} licensed in ${cityName}?`,
      a: `Yes. All of our ${NICHE_PLURAL.toLowerCase()} serving ${cityName} are fully licensed, bonded, and insured in accordance with state and local regulations.`,
    },
    {
      q: `Do you offer 24/7 ${svcName.toLowerCase()} in ${cityName}?`,
      a: `Absolutely. Our ${cityName} team is available 24 hours a day, 7 days a week — including weekends and holidays. There is no extra charge for after-hours emergency calls.`,
    },
    {
      q: `What should I do before the ${NICHE_SINGULAR.toLowerCase()} arrives?`,
      a: renderTemplate(selectVariant(CONTENT_PACK.faqBeforeArrivalAnswers, locId, svcId + 3, CONTENT_SALT), vars),
    },
  ];
}

function getRating(locId: number, svcId: number): { rating: number; reviewCount: number } {
  const seed = Math.abs(locId * 17 + svcId * 13);
  const ratings = [4.5, 4.6, 4.7, 4.8, 4.9];
  return { rating: ratings[seed % ratings.length], reviewCount: 50 + (seed % 451) };
}

export default async function ServicePage({ params }: Props) {
  const { state, place, service: serviceSlug } = await params;
  const stateCode = state.toUpperCase();

  const [loc, svc] = await Promise.all([getLocation(stateCode, place), getService(serviceSlug)]);
  if (!loc || !svc) notFound();
  if (!(await isServiceAllowedForTier(svc.id, loc.tier))) notFound();

  const [siblings, nearby] = await Promise.all([
    getSiblingServices(loc.id, svc.id, 5),
    getNearbyLocations(loc.id, stateCode, 3),
  ]);

  const faqs    = faqItems(svc.service_name, loc.place_name, svc.base_keywords, loc.id, svc.id);
  const bullets = trustBullets(svc.service_name, loc.place_name, svc.base_keywords, loc.id, svc.id);
  const intro   = introParagraph(svc.service_name, loc.place_name, loc.state_name, svc.base_keywords, loc.id, svc.id);
  const body1   = bodyParagraph1(svc.service_name, loc.place_name, svc.base_keywords, loc.id, svc.id);
  const body2   = bodyParagraph2(svc.service_name, loc.place_name, svc.base_keywords, loc.id, svc.id);
  const canonicalUrl = `${SITE_URL}/${stateCode.toLowerCase()}/${loc.place_slug}/${svc.service_slug}`;
  const { rating, reviewCount } = getRating(loc.id, svc.id);

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": SCHEMA_TYPE,
    name: `${BRAND_NAME} — ${svc.service_name}`,
    description: `Professional ${svc.service_name.toLowerCase()} in ${loc.place_name}, ${loc.state_name}. Licensed and insured. Available 24/7.`,
    telephone: PHONE_NUMBER,
    url: canonicalUrl,
    areaServed: {
      "@type": "City",
      name: loc.place_name,
      containedInPlace: { "@type": "State", name: loc.state_name },
    },
    openingHours: "Mo-Su 00:00-23:59",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: rating,
      reviewCount,
      bestRating: 5,
      worstRating: 1,
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${NICHE} Services`,
      itemListElement: [{ "@type": "Offer", itemOffered: { "@type": "Service", name: svc.service_name } }],
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",            item: SITE_URL },
      { "@type": "ListItem", position: 2, name: loc.state_name,    item: `${SITE_URL}/${stateCode.toLowerCase()}` },
      { "@type": "ListItem", position: 3, name: loc.place_name,    item: `${SITE_URL}/${stateCode.toLowerCase()}/${loc.place_slug}` },
      { "@type": "ListItem", position: 4, name: svc.service_name,  item: canonicalUrl },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <div style={{ textAlign: "center", padding: "10px 24px", fontSize: "0.85rem", color: "#94a3b8", paddingTop: 80 }}>
        <span style={{ color: "#f97316", fontWeight: 700 }}>
          24/7 {svc.service_name.toUpperCase()} IN {loc.place_name.toUpperCase()}
        </span>
        {" "}&mdash; Serving All of {loc.state_name} &mdash;{" "}
        <a href={`tel:${PHONE_TEL}`} style={{ color: "white", fontWeight: 700 }}>{PHONE_NUMBER}</a>
      </div>

      <section className="hero-gradient" style={{ padding: "60px 24px" }}>
        <div className="service-hero-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr auto", gap: 48, alignItems: "start" }}>
          <div>
            <nav style={{ marginBottom: 20, fontSize: "0.8rem", color: "#64748b" }}>
              <Link href="/" style={{ color: "#64748b", textDecoration: "none" }}>Home</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <Link href={`/${stateCode.toLowerCase()}`} style={{ color: "#64748b", textDecoration: "none" }}>{loc.state_name}</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <Link href={`/${stateCode.toLowerCase()}/${loc.place_slug}`} style={{ color: "#64748b", textDecoration: "none" }}>{loc.place_name}</Link>
              <span style={{ margin: "0 6px" }}>/</span>
              <span style={{ color: "#94a3b8" }}>{svc.service_name}</span>
            </nav>

            <div style={{ fontSize: "0.75rem", fontWeight: 700, letterSpacing: "0.15em", color: "#f97316", marginBottom: 12 }}>
              {svc.service_name.toUpperCase()} IN {loc.place_name.toUpperCase()}, {stateCode}
            </div>

            <h1 style={{ fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 800, color: "white", lineHeight: 1.15, marginBottom: 20 }}>
              {svc.service_name} in {loc.place_name}, {loc.state_name}
            </h1>

            <p style={{ color: "#94a3b8", fontSize: "1.05rem", lineHeight: 1.75, marginBottom: 28, maxWidth: 600 }}>
              {intro}
            </p>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <a href={`tel:${PHONE_TEL}`} className="btn-primary">Call for {svc.service_name}</a>
              <a href="#about" className="btn-secondary">Learn More</a>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {["Licensed & Insured", "24/7 Available", `${loc.place_name}-Wide Service`].map((badge) => (
                <span key={badge} className="badge-pill">{badge}</span>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled  = star <= Math.floor(rating);
                  const partial = !filled && star - 0.5 <= rating;
                  const fill    = filled || partial ? "#f97316" : "#1e293b";
                  return (
                    <svg key={star} width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                      {partial ? (
                        <>
                          <defs>
                            <linearGradient id={`half-${star}`}>
                              <stop offset="50%" stopColor="#f97316" />
                              <stop offset="50%" stopColor="#1e293b" />
                            </linearGradient>
                          </defs>
                          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={`url(#half-${star})`} stroke="#f97316" strokeWidth="1.5" />
                        </>
                      ) : (
                        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" fill={fill} stroke="#f97316" strokeWidth="1.5" />
                      )}
                    </svg>
                  );
                })}
              </div>
              <span style={{ fontWeight: 700, color: "white", fontSize: "0.95rem" }}>{rating.toFixed(1)}</span>
              <span style={{ color: "#64748b", fontSize: "0.85rem" }}>({reviewCount.toLocaleString()} reviews)</span>
            </div>
          </div>

          <div className="contact-card contact-card-wrapper" style={{ minWidth: 280, maxWidth: 320, padding: "28px 24px", flexShrink: 0 }}>
            <div style={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.2em", color: "#f97316", marginBottom: 12 }}>
              EMERGENCY DISPATCH
            </div>
            <a href={`tel:${PHONE_TEL}`} style={{ display: "block", fontSize: "1.6rem", fontWeight: 800, color: "#0a0f1e", textDecoration: "none", marginBottom: 20, lineHeight: 1.2 }}>
              {PHONE_NUMBER}
            </a>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 16 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "#64748b", marginBottom: 4 }}>SERVICE AREA</div>
              <div style={{ fontWeight: 600, color: "#0a0f1e" }}>{loc.place_name}, {stateCode}</div>
            </div>
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: 16, marginBottom: 20 }}>
              <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", color: "#64748b", marginBottom: 4 }}>HOURS</div>
              <div style={{ fontWeight: 600, color: "#0a0f1e" }}>Open 24 Hours</div>
            </div>
            <a href={`tel:${PHONE_TEL}`} style={{ display: "block", backgroundColor: "#f97316", color: "white", fontWeight: 800, padding: "14px", borderRadius: 6, textAlign: "center", textDecoration: "none" }}>
              Call Now — Free Estimate
            </a>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "#0d1526", padding: "50px 24px", borderTop: "1px solid #1e293b", borderBottom: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { icon: "★", title: "24/7 Service",        desc: `${svc.service_name} available around the clock — no extra charge for nights or weekends.` },
              { icon: "⚡", title: "Rapid Response",      desc: `Most ${loc.place_name} calls dispatched within 60 minutes.` },
              { icon: "📍", title: `${loc.place_name}-Wide`, desc: `We serve all neighborhoods throughout ${loc.place_name} and surrounding areas.` },
              { icon: "✓",  title: "Licensed & Insured", desc: "All technicians are fully licensed, bonded, and carry comprehensive liability insurance." },
            ].map((card) => (
              <div key={card.title} className="feature-card" style={{ padding: "24px" }}>
                <div style={{ fontSize: "1.5rem", marginBottom: 12 }}>{card.icon}</div>
                <div style={{ fontWeight: 700, color: "white", marginBottom: 8 }}>{card.title}</div>
                <div style={{ color: "#94a3b8", fontSize: "0.875rem", lineHeight: 1.6 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" style={{ padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 20 }}>
            About Our {svc.service_name} in {loc.place_name}
          </h2>
          <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 20 }}>{body1}</p>
          <p style={{ color: "#94a3b8", lineHeight: 1.8, marginBottom: 40 }}>{body2}</p>

          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 20 }}>
            Why {loc.place_name} Residents Trust Us
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
            {bullets.map((bullet, i) => (
              <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ color: "#f97316", fontWeight: 700, marginTop: 2, flexShrink: 0 }}>✓</span>
                <span style={{ color: "#94a3b8", lineHeight: 1.6 }}>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ backgroundColor: "#0d1526", padding: "60px 24px", borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 700, color: "white", marginBottom: 32 }}>
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <details key={i} className="faq-item">
              <summary>
                <h3 style={{ margin: 0, fontSize: "inherit", fontWeight: "inherit", color: "inherit", display: "inline" }}>{faq.q}</h3>
                <span style={{ color: "#f97316", flexShrink: 0 }}>+</span>
              </summary>
              <div className="faq-answer">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      <section style={{ padding: "50px 24px 60px" }}>
        <div className="two-col-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 16 }}>
              Other Services in {loc.place_name}
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {siblings.map((s) => (
                <li key={s.id}>
                  <Link href={`/${stateCode.toLowerCase()}/${loc.place_slug}/${s.service_slug}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#f97316" }}>→</span>
                    {s.service_name} in {loc.place_name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "white", marginBottom: 16 }}>Nearby Areas</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
              {nearby.map((n) => (
                <li key={n.id}>
                  <Link href={`/${stateCode.toLowerCase()}/${n.place_slug}/${svc.service_slug}`} style={{ color: "#94a3b8", textDecoration: "none", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#f97316" }}>→</span>
                    {svc.service_name} in {n.place_name}, {stateCode}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "#f97316", padding: "48px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: "1.8rem", fontWeight: 800, color: "white", marginBottom: 12 }}>
            Need {svc.service_name}? Call Now.
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", marginBottom: 24 }}>
            Our network of licensed {NICHE_PLURAL.toLowerCase()} is available 24/7, 365 days a year.
          </p>
          <a href={`tel:${PHONE_TEL}`} style={{ backgroundColor: "white", color: "#f97316", fontWeight: 800, padding: "16px 40px", borderRadius: 6, textDecoration: "none", fontSize: "1.15rem", display: "inline-block" }}>
            {PHONE_NUMBER}
          </a>
        </div>
      </section>

      <Footer city={loc.place_name} stateCode={stateCode} placeSlug={loc.place_slug} />
    </>
  );
}
