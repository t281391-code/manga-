import "./globals.css";
import type { Metadata } from "next";
import NavigationSpeedup from "@/components/NavigationSpeedup";

export const metadata: Metadata = {
  title: "Manga Platform",
  description: "Subscription-based manga platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <NavigationSpeedup />
        {children}
      </body>
    </html>
  );
}
