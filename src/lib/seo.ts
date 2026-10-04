import { cache } from "react";
import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url";
import { client } from "@/sanity/lib/client";
import { urlFor, hasImageAsset } from "@/sanity/lib/image";
import type { SanityProject } from "@/components/Works/types";

// Last resort only, for when Web Settings has no Site Name yet (or the
// document doesn't exist at all). Everything prefers the CMS value; this
// just guarantees no page ever renders without a title.
const FALLBACK_SITE_NAME = "Kat Szewczyk";

const fetchOptions =
  process.env.NODE_ENV === "production"
    ? { next: { revalidate: 60 } }
    : { cache: "no-store" as const };

export interface SanityPageSeo {
  pageName: string;
  path: string;
  metaTitle: string;
  metaDescription?: string;
  ogImage?: SanityImageSource;
}

export interface SanityWebSettings {
  siteName?: string;
  siteUrl?: string;
  siteDescription?: string;
  ogImage?: SanityImageSource;
  favicon?: SanityImageSource;
  appIcon?: SanityImageSource;
  pages?: SanityPageSeo[];
}

const WEB_SETTINGS_QUERY = `
  *[_type == "webSettings" && _id == "webSettings"][0]{
    siteName,
    siteUrl,
    siteDescription,
    ogImage,
    favicon,
    appIcon,
    pages[]{
      pageName,
      path,
      metaTitle,
      metaDescription,
      ogImage
    }
  }
`;

// Wrapped in React cache(): the root layout and every route's
// generateMetadata all need Web Settings, and this collapses them into one
// query per request instead of one per call site.
export const getWebSettings = cache(async function getWebSettings(): Promise<SanityWebSettings | null> {
  try {
    const settings = await client.fetch<SanityWebSettings | null>(
      WEB_SETTINGS_QUERY,
      {},
      fetchOptions
    );
    return settings ?? null;
  } catch {
    return null;
  }
});

/**
 * First image in the list that actually resolves, at standard OG size.
 *
 * Accepts the whole fallback chain rather than a pair, because an image
 * field left empty in Studio still serializes as an object with no asset —
 * truthiness isn't enough to decide whether to fall through.
 */
export function resolveOgImage(
  ...candidates: (SanityImageSource | undefined)[]
): { url: string; width: number; height: number } | undefined {
  const source = candidates.find((c) => hasImageAsset(c));
  if (!source) return undefined;
  return {
    url: urlFor(source).width(1200).height(630).fit("crop").url(),
    width: 1200,
    height: 630,
  };
}

/**
 * Parse Web Settings' Site URL into a base URL, or undefined if it's
 * missing or unusable. Deliberately never guesses a domain — a site with
 * no Site URL set simply gets no metadataBase, which is valid.
 *
 * Normalizes so joining a path can't produce a double slash:
 *   "https://x.com/"      -> https://x.com/
 *   "https://x.com"       -> https://x.com/
 *   "https://x.com/site/" -> https://x.com/site
 * Query strings and fragments are stripped; anything that isn't an
 * absolute http(s) URL with a host is rejected rather than thrown.
 */
export function normalizeSiteUrl(raw: string | undefined | null): URL | undefined {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return undefined;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return undefined;
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
  if (!url.hostname) return undefined;

  url.hash = "";
  url.search = "";
  // Collapse repeated slashes, then drop the trailing one (keeping "/" for
  // a bare origin) so callers can join "/path" without doubling up.
  const pathname = url.pathname.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  url.pathname = pathname || "/";

  return url;
}

/**
 * Base URL for metadata, or undefined when Site URL isn't set/valid.
 *
 * Passed to Next as `metadataBase` from the root layout, where it cascades
 * to every route. Absolute URLs (the Sanity CDN OG images) are unaffected —
 * Next only resolves *relative* metadata URLs against this. Setting it is
 * also what makes canonical URLs possible later without hardcoding a
 * domain: a route can then declare `alternates: { canonical: "/works" }`
 * and Next will expand it to the absolute URL on its own.
 */
export async function getSiteUrl(): Promise<URL | undefined> {
  return normalizeSiteUrl((await getWebSettings())?.siteUrl);
}

/** The site name to use everywhere: CMS value, else the built-in default. */
function resolveSiteName(settings: SanityWebSettings | null): string {
  return firstText(settings?.siteName) ?? FALLBACK_SITE_NAME;
}

/** Site name for callers outside this module (e.g. the root layout). */
export async function getSiteName(): Promise<string> {
  return resolveSiteName(await getWebSettings());
}

/**
 * Tidy a route path for use as a canonical: guarantee a leading slash,
 * collapse duplicate slashes, and drop any trailing slash (keeping bare
 * "/" for the homepage). Returns undefined for anything empty so callers
 * can simply omit the canonical.
 */
function normalizeRoutePath(path: string | undefined): string | undefined {
  const value = typeof path === "string" ? path.trim() : "";
  if (!value) return undefined;

  const withLeading = value.startsWith("/") ? value : `/${value}`;
  const collapsed = withLeading.replace(/\/{2,}/g, "/").replace(/\/+$/, "");
  return collapsed || "/";
}

/** First non-empty string in the chain. */
function firstText(...candidates: (string | undefined | null)[]): string | undefined {
  return candidates.find((c) => typeof c === "string" && c.trim().length > 0)?.trim();
}

interface BuildMetadataInput {
  title?: string;
  description?: string;
  image?: { url: string; width: number; height: number };
  siteName?: string;
  /** Route path for the self-referencing canonical, e.g. "/works/panama". */
  path?: string;
}

// The single place page/OG/Twitter tags are assembled, so both the static
// and the dynamic path emit the same shape. Undefined values are simply
// omitted by Next rather than rendering empty tags.
function buildMetadata({
  title,
  description,
  image,
  siteName,
  path,
}: BuildMetadataInput): Metadata {
  const images = image ? [image] : undefined;
  const canonical = normalizeRoutePath(path);

  return {
    title,
    description,
    // Relative on purpose: Next resolves it against metadataBase (the CMS
    // Site URL), so the production domain never appears in code. With no
    // Site URL set it stays relative, which still self-references correctly.
    alternates: canonical ? { canonical } : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      siteName,
      images,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images,
    },
  };
}

/**
 * Metadata for a fixed route (/, /works, /brief …), matched by `path`
 * against the Pages list in Web Settings.
 *
 * Each field falls back independently, so a page entry that fills in only
 * a title still inherits the global description and OG image — and a route
 * with no entry at all still gets complete global metadata rather than
 * nothing.
 */
export async function getPageMetadata(path: string): Promise<Metadata> {
  const settings = await getWebSettings();
  const page = settings?.pages?.find((p) => p.path === path);
  const siteName = resolveSiteName(settings);

  return buildMetadata({
    title: firstText(page?.metaTitle, siteName),
    description: firstText(page?.metaDescription, settings?.siteDescription),
    image: resolveOgImage(page?.ogImage, settings?.ogImage),
    siteName,
    path,
  });
}

/**
 * Metadata for a project page, generated from the project's own content so
 * no per-project SEO entry is needed. The metaTitle/metaDescription/ogImage
 * fields on the project are optional overrides layered on top:
 *
 *   title       metaTitle → "{title} — {siteName}" → siteName
 *   description metaDescription → hoverDescription → descriptionEN → siteDescription
 *   image       ogImage → coverImage → global ogImage
 *
 * `path` is the route being served (e.g. "/works/panama") and becomes the
 * self-referencing canonical.
 */
export async function getProjectMetadata(
  project: SanityProject | null,
  path?: string
): Promise<Metadata> {
  const settings = await getWebSettings();
  const siteName = resolveSiteName(settings);

  if (!project) {
    return buildMetadata({
      title: siteName,
      description: settings?.siteDescription,
      image: resolveOgImage(settings?.ogImage),
      siteName,
    });
  }

  const generatedTitle = project.title ? `${project.title} — ${siteName}` : undefined;

  return buildMetadata({
    title: firstText(project.metaTitle, generatedTitle, siteName),
    description: firstText(
      project.metaDescription,
      project.hoverDescription,
      project.descriptionEN,
      settings?.siteDescription
    ),
    image: resolveOgImage(project.ogImage, project.coverImage, settings?.ogImage),
    siteName,
    path,
  });
}
