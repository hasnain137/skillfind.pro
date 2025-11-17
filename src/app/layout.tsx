// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SkillFind",
  description: "Find trusted professionals for any skill.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="bg-[#FAFAFA] text-[#333333] antialiased"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
