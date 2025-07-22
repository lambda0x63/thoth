"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, CheckCircle, Home, Loader2, ScrollText, AlertCircle, Clock, Eye, User } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { VideoMetadata } from "@/types/video";
import Image from "next/image";

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const language = searchParams.get("lang") || "ko";
  const [summary, setSummary] = useState("");
  const [displaySummary, setDisplaySummary] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasStartedStreaming = useRef(false);
  const bufferRef = useRef("");
  const updateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processedContentRef = useRef(new Set<string>());

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      setIsStreaming(false);
      return;
    }

    // Check if we have a cached summary
    const cacheKey = `summary_${url}_${language}`;
    const cachedData = sessionStorage.getItem(cacheKey);
    
    if (cachedData) {
      const { summary: cachedSummary, metadata: cachedMetadata, timestamp } = JSON.parse(cachedData);
      // Use cache if it's less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        setSummary(cachedSummary);
        setDisplaySummary(cachedSummary);
        setMetadata(cachedMetadata);
        setIsStreaming(false);
        return;
      }
    }

    // Check if streaming is already in progress
    const streamingKey = `streaming_${url}_${language}`;
    const isCurrentlyStreaming = sessionStorage.getItem(streamingKey);
    
    if (isCurrentlyStreaming === 'true') {
      setError(language === 'ko' 
        ? '이미 요약이 진행 중입니다. 잠시 후 다시 시도해주세요.' 
        : 'Summary already in progress. Please try again later.');
      setIsStreaming(false);
      return;
    }

    const fetchSummary = async () => {
      try {
        // Mark as streaming
        sessionStorage.setItem(streamingKey, 'true');
        hasStartedStreaming.current = true;
        
        // Reset state for new request
        bufferRef.current = "";
        processedContentRef.current.clear();

        const response = await fetch("/api/summarize", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url, language }),
        });

        if (!response.body) {
          throw new Error("Response body is empty");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Decode chunk and add to buffer
          const chunk = decoder.decode(value, { stream: true });
          buffer += chunk;

          // Process complete lines
          const lines = buffer.split("\n");
          
          // Keep the last potentially incomplete line in buffer
          buffer = lines.pop() || "";

          for (const line of lines) {
            // Skip empty lines
            if (!line.trim()) continue;
            
            // Process SSE data lines
            if (line.startsWith("data: ")) {
              const data = line.slice(6).trim();
              
              if (data === "[DONE]") {
                setIsStreaming(false);
                // Final update to ensure all content is displayed
                setDisplaySummary(bufferRef.current);
                // Remove streaming flag
                sessionStorage.removeItem(streamingKey);
                break;
              }

              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.error) {
                    setError(parsed.error);
                    setIsStreaming(false);
                    break;
                  }
                  
                  if (parsed.metadata) {
                    setMetadata(parsed.metadata);
                  }
                  
                  if (parsed.status) {
                    setStatus(parsed.status);
                  }
                  
                  if (parsed.content && typeof parsed.content === 'string') {
                    // Create a unique key for this content chunk
                    const contentKey = `${bufferRef.current.length}_${parsed.content.substring(0, 20)}`;
                    
                    // Check if we've already processed this exact content
                    if (!processedContentRef.current.has(contentKey)) {
                      processedContentRef.current.add(contentKey);
                      
                      // Only add content if it's truly new
                      const newContent = parsed.content;
                      bufferRef.current += newContent;
                      setSummary(bufferRef.current);
                      
                      // Clear existing timer
                      if (updateTimerRef.current) {
                        clearTimeout(updateTimerRef.current);
                      }
                      
                      // Debounced update for display
                      updateTimerRef.current = setTimeout(() => {
                        setDisplaySummary(bufferRef.current);
                      }, 50);
                    }
                  }
                } catch (e) {
                  console.error("JSON parse error:", e, "Data:", data);
                }
              }
            }
          }
        }
        
        // Process any remaining data in buffer
        if (buffer && buffer.startsWith("data: ")) {
          const data = buffer.slice(6).trim();
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                bufferRef.current += parsed.content;
                setDisplaySummary(bufferRef.current);
              }
            } catch (e) {
              console.error("Final buffer parse error:", e);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
        setIsStreaming(false);
        // Remove streaming flag on error
        sessionStorage.removeItem(streamingKey);
      } finally {
        hasStartedStreaming.current = false;
      }
    };

    fetchSummary();

    // Cleanup on unmount
    return () => {
      if (hasStartedStreaming.current && url) {
        const streamingKey = `streaming_${url}_${language}`;
        sessionStorage.removeItem(streamingKey);
      }
      if (updateTimerRef.current) {
        clearTimeout(updateTimerRef.current);
      }
    };
  }, [url, language]);

  // Save completed summary to cache
  useEffect(() => {
    if (!isStreaming && summary && url) {
      const cacheKey = `summary_${url}_${language}`;
      sessionStorage.setItem(cacheKey, JSON.stringify({
        summary,
        metadata,
        timestamp: Date.now()
      }));
    }
  }, [isStreaming, summary, metadata, url, language]);

  // Auto-scroll effect
  useEffect(() => {
    if (isStreaming && contentRef.current && scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [summary, isStreaming]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displaySummary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">THOTH</h1>
          <p className="text-muted-foreground">
            {isStreaming 
              ? (language === "ko" ? "고대의 지혜를 전사하는 중..." : "Transcribing ancient wisdom...")
              : (displaySummary 
                  ? (language === "ko" ? "지혜가 기록되었습니다" : "Your wisdom has been transcribed")
                  : (language === "ko" ? "지혜를 불러오는 중..." : "Loading wisdom...")
                )}
          </p>
        </div>

        {/* Video Metadata */}
        {metadata && (
          <Card className="mb-6 shadow-md">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {metadata.thumbnail && (
                  <div className="relative w-full sm:w-48 h-32 sm:h-28 flex-shrink-0">
                    <Image
                      src={metadata.thumbnail}
                      alt={metadata.title}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <h2 className="font-semibold text-lg line-clamp-2">{metadata.title}</h2>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {metadata.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {metadata.duration}
                    </span>
                    {metadata.viewCount && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {metadata.viewCount} {language === "ko" ? "회" : "views"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error ? (
          <Card className="shadow-xl border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                {language === "ko" ? "오류" : "Error"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-destructive">{error}</p>
              <Link href="/">
                <Button className="mt-4" variant="outline">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                {isStreaming 
                  ? (status || (language === "ko" ? "기록 중..." : "Recording..."))
                  : (language === "ko" ? "기록 완료" : "Recording Complete")
                }
                {isStreaming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  aria-label={language === "ko" ? "요약 복사" : "Copy summary"}
                  disabled={!displaySummary || isStreaming}
                >
                  {copied ? <CheckCircle className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] pr-4" ref={scrollRef}>
                <div className="text-sm leading-relaxed" ref={contentRef}>
                  {displaySummary ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>,
                          h4: ({ children }) => <h4 className="text-base font-medium mb-2 mt-3">{children}</h4>,
                          h5: ({ children }) => <h5 className="text-sm font-medium mb-1 mt-2">{children}</h5>,
                          h6: ({ children }) => <h6 className="text-sm font-medium mb-1 mt-2">{children}</h6>,
                          p: ({ children }) => <p className="mb-4 leading-relaxed text-base">{children}</p>,
                          ul: ({ children }) => <ul className="mb-4 ml-6 list-disc space-y-2">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-4 ml-6 list-decimal space-y-2">{children}</ol>,
                          li: ({ children }) => <li className="leading-relaxed pl-1">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                          em: ({ children }) => <em className="italic">{children}</em>,
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-sm">{children}</code>
                            ) : (
                              <code className="block p-4 rounded-lg bg-muted font-mono text-sm overflow-x-auto">{children}</code>
                            );
                          },
                          pre: ({ children }) => <pre className="mb-4 overflow-x-auto">{children}</pre>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4 text-muted-foreground">
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr className="my-6 border-border" />,
                          a: ({ children, href }) => (
                            <a href={href} className="text-primary underline hover:text-primary/80" target="_blank" rel="noopener noreferrer">
                              {children}
                            </a>
                          ),
                          table: ({ children }) => (
                            <div className="mb-4 overflow-x-auto">
                              <table className="min-w-full divide-y divide-border">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
                          tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
                          tr: ({ children }) => <tr>{children}</tr>,
                          th: ({ children }) => <th className="px-4 py-2 text-left font-medium">{children}</th>,
                          td: ({ children }) => <td className="px-4 py-2">{children}</td>,
                        }}
                      >
                        {displaySummary}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4" />
                      <p>{language === "ko" ? "지혜를 받을 준비 중..." : "Preparing to receive wisdom..."}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center">
          <Link href="/">
            <Button size="lg" variant={error ? "default" : "outline"}>
              <Home className="mr-2 h-4 w-4" />
              {language === "ko" ? "다른 영상 요약하기" : "Summarize Another Video"}
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Screen reader announcements */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {isStreaming && status}
        {!isStreaming && displaySummary && (language === "ko" ? "요약이 완료되었습니다" : "Summary complete")}
        {copied && (language === "ko" ? "클립보드에 복사되었습니다" : "Copied to clipboard")}
      </div>
    </div>
  );
}