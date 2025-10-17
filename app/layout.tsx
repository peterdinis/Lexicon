import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lexicon - Your Personal Knowledge Hub",
  description:
    "Organize your notes, docs, and ideas effortlessly with Lexicon, a Notion-inspired knowledge management app.",
  keywords: [
    "Lexicon",
    "notes",
    "knowledge management",
    "productivity",
    "organization",
    "notion alternative",
  ],
  authors: [{ name: "Tvoje Meno", url: "https://tvoja-stranka.sk" }],
  creator: "Tvoje Meno",
  publisher: "Tvoja Firma",
  openGraph: {
    title: "Lexicon - Your Personal Knowledge Hub",
    description:
      "Organize your notes, docs, and ideas effortlessly with Lexicon.",
    url: "https://tvojaappka.sk",
    siteName: "Lexicon",
    images: [
      {
        url: "https://tvojaappka.sk/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lexicon - Knowledge Management App",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lexicon - Your Personal Knowledge Hub",
    description:
      "Organize your notes, docs, and ideas effortlessly with Lexicon.",
    images: ["https://tvojaappka.sk/og-image.png"],
    creator: "@tvoj_twitter",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
