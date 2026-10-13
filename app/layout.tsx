import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import PageTransitionLoader from "../components/PageTransitionLoader";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IETE-MOSIAC WEBSITE",
  description: "IETE-MOSIAC WEBSITE",
  icons: {
    icon: "/images/favicon-haunted.webp",
    shortcut: "/images/favicon-haunted.webp",
    apple: "/images/favicon-haunted.webp",
  },
  openGraph: {
    title: "IETE-MOSIAC WEBSITE",
    description: "IETE-MOSIAC WEBSITE",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "IETE-MOSIAC WEBSITE",
    description: "IETE-MOSIAC WEBSITE",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PageTransitionLoader>{children}</PageTransitionLoader>
      </body>
    </html>
  );
}
