"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Globe } from "lucide-react";
import { useRouter } from "next/navigation";

export function SearchForm() {
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
    <>
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
          : "Ancient wisdom from modern videos"}
      </p>
    </>
  );
}