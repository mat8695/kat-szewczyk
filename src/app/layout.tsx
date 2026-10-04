import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TransitionProvider } from "@/components/Transition/TransitionProvider";
import { getWebSettings, resolveOgImage, getSiteName, getSiteUrl } from "@/lib/seo";
import { urlFor, hasImageAsset } from "@/sanity/lib/image";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Site-wide defaults: icons plus a baseline title/description/OG image, all
// from Web Settings. Every route overrides the text and image through its
// own generateMetadata; this is what a route inherits when it doesn't.
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getWebSettings();
  const siteName = await getSiteName();
  // undefined when Site URL isn't set — the key is simply omitted rather
  // than falling back to a guessed domain.
  const metadataBase = await getSiteUrl();
  const ogImage = resolveOgImage(settings?.ogImage);

  return {
    metadataBase,
    title: siteName,
    description: settings?.siteDescription,
    icons: {
      icon: hasImageAsset(settings?.favicon) ? urlFor(settings!.favicon!).url() : undefined,
      apple: hasImageAsset(settings?.appIcon) ? urlFor(settings!.appIcon!).url() : undefined,
    },
    openGraph: {
      type: "website",
      siteName: siteName,
      title: siteName,
      description: settings?.siteDescription,
      images: ogImage ? [ogImage] : undefined,
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title: siteName,
      description: settings?.siteDescription,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <TransitionProvider>{children}</TransitionProvider>
      </body>
    </html>
  );
}
