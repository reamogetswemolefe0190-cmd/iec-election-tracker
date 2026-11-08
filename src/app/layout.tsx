import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
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
  metadataBase: new URL('https://iec-election-tracker.vercel.app'),
  title: "IEC Live Election Tracker • South Africa Election Results",
  description: "Official real-time election counting progress, party standings, 400-seat majority bar, and coalition simulator powered by official IEC data.",
  icons: {
    icon: '/icon',
    shortcut: '/icon',
    apple: '/icon',
  },
  openGraph: {
    title: "IEC Live Election Tracker • South Africa Election Results",
    description: "Official real-time election counting progress, party standings, 400-seat majority bar, and coalition simulator powered by official IEC data.",
    url: "https://iec-election-tracker.vercel.app",
    siteName: "IEC Live Election Tracker",
    locale: "en_ZA",
    type: "website",
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'IEC Live Election Tracker • South Africa',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IEC Live Election Tracker • South Africa Election Results",
    description: "Real-time election counting progress, party standings, and coalition simulator powered by official IEC data.",
    images: ['/opengraph-image'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.getItem('iec-theme') === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased transition-colors">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
