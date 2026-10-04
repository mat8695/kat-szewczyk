import NotFound from "@/components/NotFound/NotFound";

// Root not-found.tsx: renders for any unmatched URL across the app as well
// as for notFound() thrown inside a route segment.
export default function NotFoundPage() {
  return <NotFound />;
}
