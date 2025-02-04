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
  description: "Making Chicken Great Again",
  metadataBase: new URL('https://www.game.thewindow.es'),
  openGraph: {
    title: "Flappy Chicken by The Window",
    description: "Making Chicken Great Again",
    images: [
      {
        url: "/flappy_share.png", // Make sure this matches your image name
        width: 1200,
        height: 630,
        alt: "Flappy Chicken Game - The Window"
      }
    ],
    type: "website",
    siteName: "Flappy Chicken",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flappy Chicken by The Window",
    description: "Making Chicken Great Again",
    images: ["/flappy_share.png"], // Update this to match your image name
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
