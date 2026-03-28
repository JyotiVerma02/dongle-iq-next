import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
// Import the Provider we discussed in Step 1
import { ThemeProvider } from "@/app/context/ThemeContext"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
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
        {/* Wrapping children here makes the theme 'Global'. 
            Any page (Login, Register, Dashboard) can now 'listen' 
            to the dark/light mode toggle.
        */}
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}