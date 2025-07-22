"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, CheckCircle, Home, Loader2, ScrollText, AlertCircle } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function SummaryPage() {
  const searchParams = useSearchParams();
  const url = searchParams.get("url");
  const language = searchParams.get("lang") || "ko";
  const [summary, setSummary] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isStreaming, setIsStreaming] = useState(true);
  const [copied, setCopied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!url) {
      setError("No URL provided");
      setIsStreaming(false);
      return;
    }

    const fetchSummary = async () => {
      try {
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

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              
              if (data === "[DONE]") {
                setIsStreaming(false);
                break;
              }

              try {
                const parsed = JSON.parse(data);
                
                if (parsed.error) {
                  setError(parsed.error);
                  setIsStreaming(false);
                  break;
                }
                
                if (parsed.status) {
                  setStatus(parsed.status);
                }
                
                if (parsed.content) {
                  setSummary(prev => prev + parsed.content);
                }
              } catch (e) {
                // Ignore parsing errors
              }
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary");
        setIsStreaming(false);
      }
    };

    fetchSummary();
  }, [url]);

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
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">THOTH</h1>
          <p className="text-muted-foreground">
            {isStreaming 
              ? (language === "ko" ? "고대의 지혜를 전사하는 중..." : "Transcribing ancient wisdom...")
              : (language === "ko" ? "지혜가 기록되었습니다" : "Your wisdom has been transcribed")}
          </p>
        </div>

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
                {status || (language === "ko" ? "기록" : "Transcript")}
                {isStreaming && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  title={language === "ko" ? "요약 복사" : "Copy summary"}
                  disabled={!summary || isStreaming}
                >
                  {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[60vh] pr-4" ref={scrollRef}>
                <div className="text-sm leading-relaxed" ref={contentRef}>
                  {summary ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                        h1: ({ children }) => <h1 className="text-xl font-bold mb-4 mt-6">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-lg font-semibold mb-3 mt-5">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-base font-medium mb-2 mt-4">{children}</h3>,
                        p: ({ children }) => <p className="mb-4 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="mb-4 ml-5 list-disc space-y-1">{children}</ul>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        blockquote: ({ children }) => (
                          <blockquote className="border-l-4 border-primary/30 pl-4 italic my-4">
                            {children}
                          </blockquote>
                        ),
                      }}
                    >
                      {summary}
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
    </div>
  );
}