import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "REI OPS™ - Canadian Real Estate Investment Analysis",
  description: "The only investment analysis platform built for Canadian real estate. Accurate CMHC calculations, land transfer taxes, and OSFI stress tests.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
