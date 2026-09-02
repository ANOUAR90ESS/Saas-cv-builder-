import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { GUIDES, getGuide } from "@/lib/guides";
import Seo, { siteUrl } from "@/components/Seo";
import PullToRefresh from "@/components/PullToRefresh";
import MobileSubHeader from "@/components/MobileSubHeader";

// Route-driven guide pages: /guides shows the list, /guides/:slug shows a
// guide. Using the URL (not internal state) means the browser back button and
// deep links work as expected on mobile.
export default function Guides() {
  const { slug } = useParams();
  const active = slug ? getGuide(slug) : null;

  // Structured data. An article page describes itself as an Article and states
  // its place in the visible hierarchy (the "← All guides" link above it);
  // the index page describes itself as a list of the guides it actually shows.
  const jsonLd = useMemo(() => {
    if (active) {
      return [
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: active.title,
          description: active.excerpt,
          articleSection: "CV Guides",
          inLanguage: "en",
          mainEntityOfPage: { "@type": "WebPage", "@id": siteUrl(`/guides/${active.slug}`) },
          author: { "@type": "Organization", name: "DexaCV", url: siteUrl("/") },
          publisher: { "@type": "Organization", name: "DexaCV", url: siteUrl("/") },
        },
        {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
            { "@type": "ListItem", position: 2, name: "CV Guides", item: siteUrl("/guides") },
            { "@type": "ListItem", position: 3, name: active.title, item: siteUrl(`/guides/${active.slug}`) },
          ],
        },
      ];
    }
    return [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: "CV Guides",
        description: "Practical, no-fluff CV writing guides to help you write a CV that gets interviews.",
        url: siteUrl("/guides"),
        isPartOf: { "@type": "WebSite", name: "DexaCV", url: siteUrl("/") },
        hasPart: GUIDES.map((g) => ({
          "@type": "Article",
          headline: g.title,
          description: g.excerpt,
          url: siteUrl(`/guides/${g.slug}`),
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl("/") },
          { "@type": "ListItem", position: 2, name: "CV Guides", item: siteUrl("/guides") },
        ],
      },
    ];
  }, [active]);

  return (
    <PullToRefresh onRefresh={async () => {}}>
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Seo
          title={active ? `${active.title} — DexaCV` : "CV Guides — DexaCV"}
          description={active ? active.excerpt : "Practical, no-fluff CV writing guides to help you write a CV that gets interviews."}
          path={active ? `/guides/${active.slug}` : "/guides"}
          type={active ? "article" : "website"}
          jsonLd={jsonLd}
        />
        <MobileSubHeader title={active ? active.title : "CV Guides"} />
        {/* One H1 per page: the section name on the index, the article title on
            an article. On an article the section name stays visible with the
            same styling, just not as a competing heading. */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          {active ? (
            <p className="text-4xl font-bold tracking-tight">CV guides</p>
          ) : (
            <h1 className="text-4xl font-bold tracking-tight">CV guides</h1>
          )}
          <p className="mt-3 text-muted-foreground">Practical, no-fluff advice to help you write a CV that gets interviews.</p>
        </div>

        {active ? (
          <article className="prose-cv">
            <Link to="/guides" className="text-sm text-primary hover:underline mb-4 inline-block">← All guides</Link>
            <h1 className="text-2xl font-bold mb-2">{active.title}</h1>
            <p className="text-muted-foreground mb-6">{active.excerpt}</p>
            <div className="space-y-4">
              {active.body.map((p, i) => (
                <p key={i} className="text-foreground/80 leading-relaxed">{p}</p>
              ))}
            </div>
            <div className="mt-8 p-5 rounded-2xl bg-primary/5 border border-primary/20">
              <p className="font-semibold mb-1">Ready to put this into practice?</p>
              <p className="text-sm text-muted-foreground mb-3">Build a professional CV for free — €0.99 per download, no watermark, no signup.</p>
              <Link to="/builder" className="inline-block px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold">Create my CV</Link>
            </div>
            {/* Related guides: keeps readers moving between articles and gives
                each guide inbound internal links with descriptive anchor text. */}
            <div className="mt-10">
              <h2 className="text-lg font-semibold mb-3">Related CV guides</h2>
              <ul className="space-y-2">
                {GUIDES.filter((g) => g.slug !== active.slug).slice(0, 3).map((g) => (
                  <li key={g.slug}>
                    <Link to={`/guides/${g.slug}`} className="text-primary hover:underline">{g.title}</Link>
                    <span className="text-sm text-muted-foreground"> — {g.excerpt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {GUIDES.map((g) => (
              <Link key={g.slug} to={`/guides/${g.slug}`} className="text-left p-5 rounded-2xl border border-border bg-card hover:shadow-md transition-shadow">
                <h3 className="font-semibold mb-1">{g.title}</h3>
                <p className="text-sm text-muted-foreground">{g.excerpt}</p>
                <span className="text-sm text-primary mt-3 inline-block">Read →</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PullToRefresh>
  );
}