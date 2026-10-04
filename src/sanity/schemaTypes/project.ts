import { defineField, defineType } from "sanity";

export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
    }),
    defineField({
      name: "coverImage",
      title: "Cover Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "coverImage2",
      title: "Cover Image 2",
      description:
        "Optional second cover image. When set, the homepage project card alternates between Cover Image and this one every 2 seconds (same slide animation as the Services section). Leave empty to keep a single static cover image.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "hoverDescription",
      title: "Hover Description",
      description:
        "Short text shown in the dark panel when a visitor hovers the project card (homepage) and as the headline on the project's own case-study page. Press Enter for a forced line break. Non-breaking spaces (Option+Space on Mac, or pasted as &nbsp;) are preserved exactly as typed — use them to keep specific words glued together and control where lines break.",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "year",
      title: "Year",
      type: "string",
    }),
    defineField({
      name: "descriptionEN",
      title: "Description (English)",
      description: "Full case-study description shown on the project page.",
      type: "text",
    }),
    defineField({
      name: "descriptionPL",
      title: "Description (Polish)",
      description: "Full case-study description shown on the project page.",
      type: "text",
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      description:
        "Additional case-study images shown after the cover image. Any number of images — 0, 1, or many.",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    // Optional SEO overrides. Each falls back to existing project content
    // (see src/lib/seo.ts), so none of these need filling in — set one only
    // to override what's generated automatically.
    defineField({
      name: "metaTitle",
      title: "Meta Title (SEO override)",
      description:
        "Leave empty to use the project title plus the site name automatically.",
      type: "string",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta Description (SEO override)",
      description:
        "Leave empty to fall back to the Hover Description, then the English description.",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "ogImage",
      title: "OG Image (SEO override)",
      description:
        "Leave empty to fall back to the Cover Image, then the global Default OG Image.",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "quote",
      title: "Quote",
      description:
        "Shown in the full-screen quote section between the gallery and the footer. Leave empty to skip that section entirely. Non-breaking spaces (Option+Space on Mac, or pasted as &nbsp;) are preserved exactly as typed — use them to keep specific words glued together and control where lines break.",
      type: "text",
    }),
    defineField({
      name: "quoteBackgroundAnimation",
      title: "Quote Background Animation",
      description:
        "Optional background animation for the quote section — same JSON format as the homepage hero's heart animation (a per-cell brightness grid, not a video). Section is 100vh regardless of whether this is set.",
      type: "object",
      fields: [
        defineField({
          name: "file",
          title: "Animation File",
          description:
            "Recommended resolution: 1920 × 1080 px (16:9). Just upload the file — its own aspect ratio drives how it's rendered, no separate width/height entry needed.",
          type: "file",
          options: { accept: "application/json,.json" },
        }),
      ],
    }),
  ],
});
