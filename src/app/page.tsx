import Image from "next/image";
import { Metadata } from "next";
import { SearchForm } from "@/components/SearchForm";

export const metadata: Metadata = {
  title: "THOTH - YouTube Video Summarizer | 유튜브 영상 요약 서비스",
  description: "유튜브 영상의 지혜를 기록하세요. Transform YouTube videos into ancient scrolls of wisdom.",
  keywords: ["YouTube", "video summarizer", "AI summary", "유튜브 요약", "영상 요약", "THOTH"],
  openGraph: {
    title: "THOTH - YouTube Video Summarizer",
    description: "Transform YouTube videos into ancient scrolls of wisdom",
    images: ["/thoth_logo.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "THOTH - YouTube Video Summarizer",
    description: "Transform YouTube videos into ancient scrolls of wisdom",
    images: ["/thoth_logo.png"],
  },
};

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl -mt-20">
        {/* Logo */}
        <header className="text-center mb-12">
          {/* Thoth Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/thoth_logo.png"
              alt="THOTH Logo - 유튜브 영상 요약 서비스"
              width={80}
              height={80}
              priority
            />
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-2">
            THOTH
          </h1>
          <p className="text-muted-foreground">
            Ancient Scribe of Digital Wisdom
          </p>
        </header>

        {/* Search Form - Client Component */}
        <section aria-label="YouTube 영상 URL 입력">
          <SearchForm />
        </section>
      </div>
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "THOTH",
            "description": "YouTube 동영상을 AI로 빠르게 요약하는 서비스",
            "url": "https://thoth-note.vercel.app",
            "applicationCategory": "Multimedia",
            "operatingSystem": "All",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "KRW"
            },
            "creator": {
              "@type": "Organization",
              "name": "THOTH"
            }
          })
        }}
      />
    </div>
  );
}