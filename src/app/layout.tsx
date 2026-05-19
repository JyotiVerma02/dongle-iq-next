import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
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
      root.setAttribute('data-theme-ready', 'false');

      var saved = null;
      try { saved = localStorage.getItem('dongle-iq-theme'); } catch (e) {}
      var isSavedValid = saved === 'dark' || saved === 'light';

      var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      var theme = isSavedValid ? saved : (systemDark ? 'dark' : 'light');

      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
      root.setAttribute('data-theme-ready', 'true');
    } catch (e) {}
  })();
`;

  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${outfit.variable} font-sans antialiased`}>
        <ThemeProvider>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
