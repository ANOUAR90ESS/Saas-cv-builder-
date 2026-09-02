import { useEffect } from "react";

// Canonical host for the site. Every canonical URL, og:url and JSON-LD @id is
// built from this single constant so the app can never emit two competing
// domains to search engines.
const SITE_URL = "https://dexacv.com";
const SITE_NAME = "DexaCV";
// Default Open Graph share image; set once the OG banner URL is known.
const DEFAULT_OG_IMAGE = "https://media.base44.com/images/public/6a8a351cc082996c84425f54/dd31ad50d_generated_image.png";

// Lightweight per-page SEO: title, meta description, canonical link,
// Open Graph + Twitter Card tags, an optional robots noindex flag, and
// optional JSON-LD structured data. Used by every public page so search
// engines and social platforms get complete, non-duplicate metadata.
//
// `jsonLd` accepts a single schema.org object or an array of them. It is
// rendered into script tags tagged `data-seo-jsonld` and fully replaced on
// every navigation, so a page never inherits the previous page's structured
// data — the site-wide Organization / WebSite / SoftwareApplication schemas
// live in index.html and are deliberately not duplicated here.
export default function Seo({ title, description, path, image = "", noindex = false, type = "website", jsonLd = null }) {
  useEffect(() => {
    if (title) document.title = title;
    setMeta("description", description);

    // Always resolve to an absolute canonical URL. The home page canonical
    // keeps its trailing slash ("https://dexacv.com/") so it matches the URL
    // Google already has indexed.
    const url = path && path !== "/" ? `${SITE_URL}${path}` : `${SITE_URL}/`;
    setLink("canonical", url);

    const ogImage = image || DEFAULT_OG_IMAGE;

    setPropMeta("og:title", title);
    setPropMeta("og:description", description);
    setPropMeta("og:url", url);
    setPropMeta("og:type", type);
    setPropMeta("og:site_name", SITE_NAME);
    setPropMeta("og:locale", "en_US");
    if (ogImage) setPropMeta("og:image", ogImage);

    setPropMeta("twitter:card", ogImage ? "summary_large_image" : "summary");
    setPropMeta("twitter:title", title);
    setPropMeta("twitter:description", description);
    if (ogImage) setPropMeta("twitter:image", ogImage);

    setMeta("robots", noindex ? "noindex, nofollow" : "index, follow");

    setJsonLd(jsonLd);
    return () => setJsonLd(null);
  }, [title, description, path, image, noindex, type, jsonLd]);
  return null;
}

// Absolute-URL helper so pages can build structured data without hardcoding
// the host. Keeps every emitted URL on the canonical domain.
export function siteUrl(path = "/") {
  return path && path !== "/" ? `${SITE_URL}${path}` : `${SITE_URL}/`;
}

export { SITE_URL, SITE_NAME };

function setMeta(name, content) {
  if (!content) return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setPropMeta(property, content) {
  if (!content) return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute("property", property);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel, href) {
  if (!href) return;
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

// Replaces every page-level JSON-LD block. Static site-wide schemas in
// index.html carry no data-seo-jsonld attribute and are left untouched.
function setJsonLd(data) {
  document.querySelectorAll("script[data-seo-jsonld]").forEach((el) => el.remove());
  if (!data) return;
  const blocks = Array.isArray(data) ? data : [data];
  for (const block of blocks) {
    if (!block) continue;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.setAttribute("data-seo-jsonld", "");
    el.textContent = JSON.stringify(block);
    document.head.appendChild(el);
  }
}
