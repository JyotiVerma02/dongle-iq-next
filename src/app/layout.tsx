import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

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
  return RootLayoutInner({ children });
}

async function RootLayoutInner({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("dongle-iq-theme")?.value;
  const initialTheme = cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : "dark";

  const themeInitScript = `
  (function() {
    try {
      var root = document.documentElement;
      root.setAttribute('data-theme-ready', 'false');

      var cookieMatch = document.cookie.match(/(?:^|; )dongle-iq-theme=([^;]*)/);
      var saved = cookieMatch ? decodeURIComponent(cookieMatch[1]) : null;
      var theme = saved === 'light' || saved === 'dark' ? saved : ${JSON.stringify(initialTheme)};

      root.classList.remove('light', 'dark');
      root.classList.add(theme);
      root.style.colorScheme = theme;
      root.dataset.theme = theme;
      root.setAttribute('data-theme-ready', 'true');
    } catch (e) {}
  })();
`;

  return (
    <html lang="en" className={initialTheme} suppressHydrationWarning data-scroll-behavior="smooth">
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,300,400&f[]=clash-display@200,400,700,500,600,300&display=swap" rel="stylesheet" />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body suppressHydrationWarning className={`${plusJakarta.variable} font-sans antialiased`}>
        <ThemeProvider initialTheme={initialTheme as "light" | "dark"}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
