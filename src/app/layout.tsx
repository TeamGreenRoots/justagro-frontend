import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "JustAgro — Agricultural Payment Platform",
  description: "Connecting smallholder farmers, aggregators, and buyers across Nigeria through verified Interswitch payments and AI-powered market intelligence.",
  keywords: ["agriculture", "Nigeria", "farmers", "payments", "Interswitch", "agritech"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "JustAgro — Agricultural Payment Platform",
    description: "Verified payments for Nigerian farmers. Powered by Interswitch.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
