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
        <div className="text-center mb-12">
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
          <h1 className="text-6xl font-bold tracking-tight mb-2 flex items-center justify-center gap-3">
            THOTH
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            YouTube Video Summarizer
          </p>
        </div>

        {/* Search Form - Client Component */}
        <SearchForm />
      </div>
    </div>
  );
}