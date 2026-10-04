export interface SanityImageDimensions {
  width: number;
  height: number;
  aspectRatio: number;
}

export interface SanityImageRef {
  _type: "image";
  asset: { _ref: string; _type: "reference" };
  hotspot?: { x: number; y: number; height: number; width: number };
  // Added via a GROQ dereference projection ("metadata": asset->metadata) —
  // asset._ref itself is left untouched so urlFor() keeps working exactly
  // as before. Used only to read the source image's real dimensions/ratio.
  metadata?: { dimensions?: SanityImageDimensions };
}

export interface SanityQuoteBackgroundAnimation {
  // "fileUrl" via a GROQ dereference projection ("fileUrl": file.asset->url)
  fileUrl?: string;
}

export interface SanityProject {
  title: string;
  slug: string;
  coverImage?: SanityImageRef;
  coverImage2?: SanityImageRef;
  hoverDescription?: string;
  year?: string;
  descriptionEN?: string;
  descriptionPL?: string;
  gallery?: SanityImageRef[];
  // Optional SEO overrides — see src/lib/seo.ts for the fallback chain.
  metaTitle?: string;
  metaDescription?: string;
  ogImage?: SanityImageRef;
  quote?: string;
  quoteBackgroundAnimation?: SanityQuoteBackgroundAnimation;
}

// Keep the old shape for lib/projects.ts compatibility
export interface Project {
  title: string;
  slug: string;
  coverImage?: string;
  description?: string;
}
