
// src/app/[locale]/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "../globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { ProgressBarProvider } from "@/components/providers/ProgressBarProvider";
import { cn } from "@/lib/cn";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import SupportChatWidget from '@/components/SupportChatWidget';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://skillfind.pro';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SkillFind.pro - Find Trusted Professionals for Any Skill",
    template: "%s | SkillFind.pro",
  },
  description: "Connect with verified professionals for tutoring, web development, design, coaching and more. Post your request and receive offers from skilled experts near you.",
  keywords: [
    "find professionals",
    "hire experts",
    "freelance services",
    "tutoring",
    "web development",
    "graphic design",
    "coaching",
    "professional services",
    "local services",
    "remote work",
  ],
  authors: [{ name: "SkillFind.pro" }],
  creator: "SkillFind.pro",
  publisher: "SkillFind.pro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_FR',
    url: siteUrl,
    siteName: 'SkillFind.pro',
    title: 'SkillFind.pro - Find Trusted Professionals for Any Skill',
    description: 'Connect with verified professionals for tutoring, web development, design, coaching and more.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'SkillFind.pro - Professional Services Marketplace',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SkillFind.pro - Find Trusted Professionals',
    description: 'Connect with verified professionals for any skill you need.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#2563EB',
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <ClerkProvider dynamic>
      <html lang={locale} suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            "min-h-screen bg-background font-sans antialiased",
            inter.variable,
            "selection:bg-primary-100 selection:text-primary-900"
          )}
        >
          <NextIntlClientProvider messages={messages}>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem={false}
              disableTransitionOnChange
            >
              {/* Skip to content link for accessibility */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-white"
              >
                Skip to main content
              </a>
              <ProgressBarProvider />
              <ToastProvider />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
          <SupportChatWidget />
        </body>
      </html>
    </ClerkProvider>
  );
}
