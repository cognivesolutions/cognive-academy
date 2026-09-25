import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import Header from "../components/header";
import Footer from "../components/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cognive Academy",
  description: "Career-focused LMS for SQL, Python, Power BI, Git, MySQL, and Excel learning.",
  icons: {
    // Append a short cache-busting query so browsers fetch the latest files.
    icon: [
      { url: `/favicon.ico?v=${Date.now()}`, type: 'image/x-icon', sizes: '16x16 32x32 48x48' },
      { url: `/favicon-32.png?v=${Date.now()}`, type: 'image/png', sizes: '32x32' },
    ],
    shortcut: [{ url: `/favicon-32.png?v=${Date.now()}`, type: 'image/png', sizes: '32x32' }],
    apple: [{ url: `/apple-touch-icon-180.png?v=${Date.now()}`, sizes: '180x180' }],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main" className="skip-link sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:rounded">Skip to content</a>
        <SessionProvider>
          {/* Header placed here so nav/footer are visible on every page */}
          {/* Header is a server component that derives auth state */}
          {/* eslint-disable-next-line @next/next/no-async-client-component */}
          <Header />

          <main
            id="main"
            className="relative isolate flex-1 opacity-0 animate-[pageFadeIn_0.7s_cubic-bezier(0.16,1,0.3,1)_forwards] will-change-[opacity,transform,filter]"
          >
            {children}
          </main>

          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}
