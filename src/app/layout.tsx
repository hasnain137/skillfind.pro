// src/app/layout.tsx
import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillFind",
  description: "Find trusted professionals for any skill.",
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

import { ToastProvider } from "@/components/providers/ToastProvider";
import { ProgressBarProvider } from "@/components/providers/ProgressBarProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider dynamic>
      <html lang="en">
        <body
          className="bg-[#FAFAFA] text-[#333333] antialiased"
          suppressHydrationWarning
        >
          <ProgressBarProvider />
          <ToastProvider />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
