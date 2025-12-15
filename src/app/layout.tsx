
// Since we used `[locale]` routing, the main layout moves there.
// This root layout is a requirement of Next.js but primarily just passes through.
// API routes don't use this. The middleware redirects / to /[locale].
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
