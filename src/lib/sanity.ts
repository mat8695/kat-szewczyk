import { cache } from "react";
import { client } from "@/sanity/lib/client";
import type { SanityProject } from "@/components/Works/types";
import type { SanityServiceItem, SanityServiceCategory } from "@/components/Services/types";
import type { SanityTestimonial } from "@/components/Testimonials/types";
import type { SanityPreBriefQuestion } from "@/components/Brief/types";

const fetchOptions =
  process.env.NODE_ENV === "production"
    ? { next: { revalidate: 60 } }
    : { cache: "no-store" as const };

const PROJECTS_QUERY = `
  *[_type == "project"] | order(_createdAt asc) {
    title,
    "slug": slug.current,
    coverImage{
      ...,
      "metadata": asset->metadata
    },
    coverImage2,
    hoverDescription,
    year
  }
`;

const PROJECT_BY_SLUG_QUERY = `
  *[_type == "project" && slug.current == $slug][0] {
    title,
    "slug": slug.current,
    coverImage{
      ...,
      "metadata": asset->metadata
    },
    hoverDescription,
    year,
    descriptionEN,
    descriptionPL,
    gallery[]{
      ...,
      "metadata": asset->metadata
    },
    metaTitle,
    metaDescription,
    ogImage,
    quote,
    quoteBackgroundAnimation{
      "fileUrl": file.asset->url
    }
  }
`;

export async function getProjects(): Promise<SanityProject[]> {
  try {
    const projects = await client.fetch<SanityProject[]>(PROJECTS_QUERY, {}, fetchOptions);
    return projects ?? [];
  } catch {
    return [];
  }
}

// Wrapped in React cache(): /works/[slug] resolves the same project twice
// per request — once in generateMetadata, once in the page body — and this
// collapses that into a single query.
export const getProjectBySlug = cache(async function getProjectBySlug(
  slug: string
): Promise<SanityProject | null> {
  try {
    const project = await client.fetch<SanityProject | null>(
      PROJECT_BY_SLUG_QUERY,
      { slug },
      fetchOptions
    );
    return project ?? null;
  } catch {
    return null;
  }
});

const SERVICE_ITEMS_QUERY = `
  *[_type == "serviceItem"] | order(order asc) {
    _id,
    title,
    description,
    image,
    order
  }
`;

export async function getServiceItems(): Promise<SanityServiceItem[]> {
  try {
    const items = await client.fetch<SanityServiceItem[]>(SERVICE_ITEMS_QUERY, {}, fetchOptions);
    return items ?? [];
  } catch {
    return [];
  }
}

const SERVICE_CATEGORIES_QUERY = `
  *[_type == "service"] | order(order asc) {
    _id,
    title,
    descriptionEN,
    descriptionPL,
    image,
    order,
    "subcategories": *[
      _type == "serviceItem" &&
      references(^._id)
    ] | order(order asc) {
      _id,
      title,
      description,
      image,
      order
    }
  }
`;

export async function getServiceCategories(): Promise<SanityServiceCategory[]> {
  try {
    const categories = await client.fetch<SanityServiceCategory[]>(
      SERVICE_CATEGORIES_QUERY,
      {},
      fetchOptions
    );
    return categories ?? [];
  } catch {
    return [];
  }
}

const TESTIMONIALS_QUERY = `
  *[_type == "testimonial"] | order(order asc) {
    _id,
    clientName,
    quotePl,
    quoteEn,
    order
  }
`;

export async function getTestimonials(): Promise<SanityTestimonial[]> {
  try {
    const items = await client.fetch<SanityTestimonial[]>(TESTIMONIALS_QUERY, {}, fetchOptions);
    return items ?? [];
  } catch {
    return [];
  }
}

const PRE_BRIEF_QUESTIONS_QUERY = `
  *[_type == "preBriefSettings" && _id == "preBriefSettings"][0].questions[]{
    "key": key.current,
    label,
    fieldType,
    required,
    helperText,
    options
  }
`;

export async function getPreBriefQuestions(): Promise<SanityPreBriefQuestion[]> {
  try {
    const questions = await client.fetch<SanityPreBriefQuestion[] | null>(
      PRE_BRIEF_QUESTIONS_QUERY,
      {},
      fetchOptions
    );
    // Drop anything an editor started but left without a key/label — those
    // can't be rendered or matched back to an answer.
    return (questions ?? []).filter((q) => q?.key && q?.label);
  } catch {
    return [];
  }
}
