import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
import { ThemeProvider } from "@/app/context/ThemeContext"; 
import ParticleBackground from "@/components/ParticleBackground";
import CursorEffect from "@/components/CursorEffect";


const geistSans = Roboto({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Poppins({
  variable: "--font-geist-mono",
  weight: ["400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dongle IQ | Secure DSC Portal",
  description: "Simplifying IRCTC Agent IDs and Digital Signature Certificates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} theme-transition antialiased`}
      >
        <ThemeProvider>
          <ParticleBackground />
          <Navbar />
          <div className="relative z-10">
            {children}
          </div>
          <CursorEffect />
        </ThemeProvider>
      </body>
    </html>
  );
}
