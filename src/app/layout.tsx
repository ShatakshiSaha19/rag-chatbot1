import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { Navigation } from "@/components/navigation";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Editorial serif used for headings (font-heading)
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DocuMind",
  description: "Chat with your PDF documents using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      {/* Font variables go on <html> because globals.css applies font-sans there */}
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable}`}
      >
        <body className="antialiased">
          <Providers>
            <Navigation />
            {children}
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
