/* eslint-disable @typescript-eslint/no-unused-vars */
import type { Metadata } from "next";

import "./globals.css";
import { ThemeProvider } from "@/app/context/ThemeContext";
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
        var storageKey = 'dongle-iq-theme';
        var savedTheme = window.localStorage.getItem(storageKey);
    var theme = savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'dark';
        var root = document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        root.style.colorScheme = theme;
      } catch (e) {}
    })();
  `;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
  
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
