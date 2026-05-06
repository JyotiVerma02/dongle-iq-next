/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import AppShell from "@/components/AppShell";
import Providers from "./providers";
export const metadata: Metadata = {
  title: "Dongle IQ | Secure DSC Portal",
  description:
    "Simplifying IRCTC Agent IDs and Digital Signature Certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
 const themeInitScript = `
  (function() {
    try {
      var root = document.documentElement;

      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = systemDark ? 'dark' : 'light';

      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
    } catch (e) {}
  })();
`;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
    <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body suppressHydrationWarning className="theme-transition antialiased">
  
        <ThemeProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
