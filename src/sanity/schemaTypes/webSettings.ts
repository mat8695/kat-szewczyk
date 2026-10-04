import { defineField, defineType } from "sanity";

// Singleton — see structure.ts, which pins this to a fixed document ID
// ("webSettings") and opens it directly instead of a creatable list.
export const webSettingsType = defineType({
  name: "webSettings",
  title: "Web Settings",
  type: "document",
  groups: [
    { name: "general", title: "General", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "siteName",
      title: "Site Name",
      description:
        "Used as the fallback page title, and appended to auto-generated titles for project pages (e.g. \"Panama — Kat Szewczyk\").",
      type: "string",
      group: "general",
    }),
    defineField({
      name: "siteUrl",
      title: "Site URL",
      description:
        "Production origin, e.g. https://katszewczyk.com — used as the base for absolute metadata URLs. Optional: leave empty and metadata still works, it just won't resolve relative URLs. A trailing slash is fine either way.",
      type: "url",
      validation: (Rule) =>
        Rule.uri({ scheme: ["http", "https"], allowRelative: false }),
      group: "general",
    }),
    defineField({
      name: "siteDescription",
      title: "Default Meta Description",
      description:
        "Fallback description for any page that has none of its own.",
      type: "text",
      rows: 3,
      group: "general",
    }),
    defineField({
      name: "ogImage",
      title: "Default OG Image",
      description: "Used for any page below that doesn't set its own OG Image.",
      type: "image",
      options: { hotspot: true },
      group: "general",
    }),
    defineField({
      name: "favicon",
      title: "Favicon",
      type: "image",
      group: "general",
    }),
    defineField({
      name: "appIcon",
      title: "App Icon",
      type: "image",
      group: "general",
    }),
    defineField({
      name: "pages",
      title: "Pages",
      description:
        "One entry per route (path). Add an entry here to give a new page its own SEO — no schema changes needed.",
      type: "array",
      of: [{ type: "pageSeo" }],
      group: "seo",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Web Settings" };
    },
  },
});
