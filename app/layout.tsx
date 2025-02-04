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
        url: "https://game.thewindow.es/flappy_chicken_share_image.png",
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
    images: ["https://game.thewindow.es/flappy_chicken_share_image.png"],
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
      <head>
        <meta property="og:image" content="https://game.thewindow.es/flappy_chicken_share_image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url" content="https://game.thewindow.es/" />
        <meta property="og:image:secure_url" content="https://game.thewindow.es/flappy_chicken_share_image.png" />
      </head>
      <body>{children}</body>
    </html>
  );
}
