import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinguaGuard Dashboard",
  description: "Translation health visibility for your repositories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
