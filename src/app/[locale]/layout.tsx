
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


export const metadata: Metadata = {
  title: "SkillFind",
  description: "Find trusted professionals for any skill.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
              <ProgressBarProvider />
              <ToastProvider />
              {children}
            </ThemeProvider>
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
