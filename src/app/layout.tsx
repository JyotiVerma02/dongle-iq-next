import type { Metadata } from "next";
import Script from "next/script";
import { cookies } from "next/headers";
import { Inter, Manrope } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";
import AppShell from "@/components/AppShell";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "DongleIQ | Secure DSC and IRCTC Portal",
  description:
    "Track applications, manage documents, and complete DSC onboarding in a polished secure portal.",
};

export default async function RootLayout({
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
        <link
          href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css"
          rel="stylesheet"
        />
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
      </head>
      <body suppressHydrationWarning className={`${inter.variable} ${manrope.variable} antialiased`}>
        <ThemeProvider initialTheme={initialTheme as "light" | "dark"}>
          <Providers>
            <AppShell>{children}</AppShell>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
