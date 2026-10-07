import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { ToastProvider } from "@/components/ui";
import { METADATA_BASE, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

const DEFAULT_TITLE = "Whispering Green Foundation — Community waste action in Vasai-West";
const DEFAULT_DESCRIPTION =
  "Whispering Green Foundation coordinates community waste collection and awareness in Vasai-West. Request a household waste pickup, join clean-up events, and learn better waste habits.";

export const metadata: Metadata = {
  metadataBase: METADATA_BASE,
  applicationName: SITE_NAME,
  title: {
    default: DEFAULT_TITLE,
    template: "%s · Whispering Green Foundation",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ["waste management", "Vasai-West", "community cleanup", "recycling", "Whispering Green Foundation"],
  // Site-level defaults; individual pages override title/description/url.
  // Absolute canonical URLs are only emitted once NEXT_PUBLIC_SITE_URL is set.
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "en_IN",
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: SITE_TAGLINE,
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${outfit.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
