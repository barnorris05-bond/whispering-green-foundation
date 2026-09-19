import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { ToastProvider } from "@/components/ui";
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

export const metadata: Metadata = {
  title: {
    default: "Whispering Green Foundation — Community waste action in Vasai-West",
    template: "%s · Whispering Green Foundation",
  },
  description:
    "Whispering Green Foundation coordinates community waste collection and awareness in Vasai-West. Request a household waste pickup, join clean-up events, and learn better waste habits.",
  keywords: ["waste management", "Vasai-West", "community cleanup", "recycling", "Whispering Green Foundation"],
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
