"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Globe, Sparkles, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    // Redirect to summary page with URL and language parameters
    router.push(`/summary?url=${encodeURIComponent(url)}&lang=${language}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-2xl -mt-20">
        {/* Logo */}
        <div className="text-center mb-12">
          {/* Thoth Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/thoth_logo.png"
              alt="THOTH Logo"
              width={80}
              height={80}
              priority
            />
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-2 flex items-center justify-center gap-3">
            <BookOpen className="h-12 w-12 text-primary" />
            THOTH
          </h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            YouTube Video Summarizer
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input
              type="url"
              placeholder="Paste YouTube URL here"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full h-14 pl-5 pr-14 text-lg rounded-full shadow-lg border-2"
              disabled={loading}
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-2 h-10 w-10 rounded-full"
              disabled={loading || !url}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Search className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          {/* Language Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              type="button"
              variant={language === "ko" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("ko")}
              className="rounded-full"
            >
              <Globe className="mr-2 h-4 w-4" />
              한국어
            </Button>
            <Button
              type="button"
              variant={language === "en" ? "default" : "outline"}
              size="sm"
              onClick={() => setLanguage("en")}
              className="rounded-full"
            >
              <Globe className="mr-2 h-4 w-4" />
              English
            </Button>
          </div>
        </form>

        {/* Description */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          {language === "ko" 
            ? "유튜브 영상의 지혜를 기록하세요" 
            : "Record wisdom in YouTube videos"}
        </p>
      </div>
    </div>
  );
}