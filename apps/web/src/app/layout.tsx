// Root layout - akan di-redirect oleh middleware ke [locale] layout
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Middleware akan handle redirect, ini hanya fallback
  return children;
}
