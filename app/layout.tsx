import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { customFont } from './fonts'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Flappy Chicken by The Window",
  description: "Make Chickens Great Again",
  openGraph: {
    title: "Flappy Chicken by The Window",
    description: "Make Chickens Great Again",
    images: [
      {
        url: "/landing_page.png",
        width: 1200,
        height: 630,
        alt: "Flappy Chicken Game"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Flappy Chicken by The Window",
    description: "Make Chickens Great Again",
    images: ["/landing_page.png"],
    creator: "@thewindow"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased ${customFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
