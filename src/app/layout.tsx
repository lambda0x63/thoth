import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Sidebar } from "@/components/Sidebar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "THOTH - YouTube 영상 요약 AI | 동영상을 지혜로운 노트로",
  description: "YouTube 동영상을 AI로 빠르게 요약하세요. 강의, 튜토리얼, 팟캐스트를 핵심 노트로 변환하는 무료 서비스입니다. 시간을 절약하고 효율적으로 학습하세요.",
  keywords: "YouTube 요약, 동영상 요약, AI 요약, 영상 정리, 자동 요약, video summarizer, YouTube AI, 강의 노트",
  authors: [{ name: "THOTH" }],
  creator: "THOTH",
  publisher: "THOTH",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "THOTH - YouTube 영상 요약 AI",
    description: "YouTube 동영상을 AI로 빠르게 요약하세요. 시간을 절약하고 효율적으로 학습하세요.",
    url: "https://thoth-note.vercel.app",
    siteName: "THOTH",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "THOTH - YouTube Video Summarizer",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THOTH - YouTube 영상 요약 AI",
    description: "YouTube 동영상을 AI로 빠르게 요약하세요",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/thoth_logo.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/thoth_logo.png",
    apple: "/thoth_logo.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <main className="lg:pl-64">
          {children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
