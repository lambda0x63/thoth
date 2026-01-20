"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { validateYouTubeUrl } from "@/lib/youtube-validator";

export function SearchForm() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<"ko" | "en">("ko");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // Validate URL
    const validation = validateYouTubeUrl(url);
    if (!validation.valid) {
      setError(language === "ko" 
        ? "올바른 YouTube URL을 입력해주세요" 
        : "Please enter a valid YouTube URL"
      );
      return;
    }
    
    setError("");
    setLoading(true);
    // Redirect to summary page with URL and language parameters
    router.push(`/summary?url=${encodeURIComponent(url)}&lang=${language}`);
  };

  return (
    <>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Input
            type="url"
            placeholder={language === "ko" ? "YouTube 영상 링크를 입력하세요" : "Paste YouTube URL here"}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full h-14 pl-5 pr-14 text-lg rounded-full shadow-lg border-2 focus:ring-2 focus:ring-primary focus:ring-offset-2"
            disabled={loading}
            aria-label={language === "ko" ? "YouTube 영상 URL" : "YouTube video URL"}
            aria-describedby={error ? "url-error" : "url-hint"}
            aria-invalid={!!error}
            required
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-2 h-10 w-10 rounded-full"
            disabled={loading || !url}
            aria-label={loading 
              ? (language === "ko" ? "처리 중..." : "Processing...") 
              : (language === "ko" ? "영상 요약하기" : "Summarize video")}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </Button>
        </div>
        
        {/* Error message */}
        {error && (
          <p id="url-error" className="text-sm text-destructive text-center" role="alert">
            {error}
          </p>
        )}
        
        {/* Language Toggle */}
        <div className="flex justify-center gap-2" role="radiogroup" aria-label="Select summary language">
          <Button
            type="button"
            variant={language === "ko" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("ko")}
            className="rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="radio"
            aria-checked={language === "ko"}
            tabIndex={language === "ko" ? 0 : -1}
          >
            <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
            한국어
          </Button>
          <Button
            type="button"
            variant={language === "en" ? "default" : "outline"}
            size="sm"
            onClick={() => setLanguage("en")}
            className="rounded-full focus:ring-2 focus:ring-primary focus:ring-offset-2"
            role="radio"
            aria-checked={language === "en"}
            tabIndex={language === "en" ? 0 : -1}
          >
            <Globe className="mr-2 h-4 w-4" aria-hidden="true" />
            English
          </Button>
        </div>
      </form>

      {/* Description */}
      <p id="url-hint" className="text-center text-sm text-muted-foreground mt-8">
        {language === "ko" 
          ? "유튜브 영상의 지혜를 기록하세요" 
          : "Ancient wisdom from modern videos"}
      </p>
      
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {loading && (language === "ko" ? "영상을 처리하는 중입니다..." : "Processing video...")}
      </div>
    </>
  );
}