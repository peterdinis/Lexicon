import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { ConvexClientProvider } from "@/components/providers/ConvexProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/shared/ScrollToTop";

const geistSans = Ubuntu({
  subsets: ["latin-ext"],
  weight: "500",
});

export const metadata: Metadata = {
  title: {
    default: "Lexicon",
    template: "%s | Lexicon",
  },
  description:
    "Lexicon is a modern knowledge and content management platform that helps you organize, search, and collaborate efficiently.",
  keywords: [
    "Lexicon",
    "knowledge management",
    "content organization",
    "collaboration",
    "productivity",
  ],
  authors: [{ name: "Lexicon Team", url: "https://lexicon.app" }],
  creator: "Lexicon",
  publisher: "Lexicon",
  metadataBase: new URL("https://lexicon.app"),

  openGraph: {
    title: "Lexicon – Knowledge at your fingertips",
    description:
      "Organize, search, and collaborate with Lexicon – the modern workspace for teams and individuals.",
    url: "https://lexicon.app",
    siteName: "Lexicon",
    images: [
      {
        url: "/og-image.png", // put your OG image in /public
        width: 1200,
        height: 630,
        alt: "Lexicon OpenGraph Image",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },

  manifest: "/site.webmanifest",

  category: "productivity",

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: "https://lexicon.app",
    languages: {
      "en-US": "https://lexicon.app",
      "sk-SK": "https://lexicon.app/sk",
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
      <body className={`${geistSans} antialiased h-full dark:bg-[#1f1f1f]`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>
            <main>
              {children}
              <ScrollToTop threshold={300} bottom="8" right="8" />
              <Toaster />
            </main>
          </ConvexClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
