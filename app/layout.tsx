import type { Metadata } from "next";
import { Roboto, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";
// Import the Provider we discussed in Step 1
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
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          
          {/* Particle background (global & fixed) */}
          <ParticleBackground />

          {/* Navbar above particles */}
          <Navbar />

          {/* Page content above everything */}
          <div className="relative z-10">
            {children}
          </div>

          {/* Cursor effect (global & fixed) */}
          <CursorEffect />

        </ThemeProvider>
      </body>
    </html>
  );
}