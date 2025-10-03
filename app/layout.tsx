import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import ScrollToTop from "@/components/shared/ScrollToTop";
import TransitionProvider from "@/components/providers/TransitionProvider";

const geistSans = Ubuntu({
  subsets: ["latin-ext"],
  weight: "700",
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
  authors: [
    { name: "Peter Dinis", url: "https://portfolio-peter-dinis.vercel.app" },
  ],
  creator: "Lexicon",
  publisher: "Lexicon",
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
            <TransitionProvider>
              <main>
                {children}
                <ScrollToTop threshold={300} bottom="8" right="8" />
                <Toaster />
              </main>
            </TransitionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
