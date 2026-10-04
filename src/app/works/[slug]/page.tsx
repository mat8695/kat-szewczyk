import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjects, getProjectBySlug } from "@/lib/sanity";
import Navigation from "@/components/Navigation/Navigation";
import WorkHero from "@/components/WorkHero/WorkHero";
import WorkQuote from "@/components/WorkQuote/WorkQuote";
import Footer from "@/components/Footer/Footer";
import { getProjectMetadata } from "@/lib/seo";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects
    .filter((p) => !!p.slug)
    .map((p) => ({ slug: p.slug }));
}

// Generated from the project's own content — no per-project SEO entry
// required. The optional metaTitle/metaDescription/ogImage fields on the
// project override it where set; see getProjectMetadata for the chain.
// getProjectBySlug is React-cached, so this shares one query with the page
// body below rather than fetching twice.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Canonical comes from the route param rather than the CMS slug field,
  // so it always matches the URL actually being served.
  return getProjectMetadata(await getProjectBySlug(slug), `/works/${slug}`);
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) notFound();

  return (
    <main>
      <Navigation />
      <WorkHero project={project} />
      <WorkQuote project={project} />
      <Footer />
    </main>
  );
}
