"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Github, Mail } from "lucide-react";
import { useState } from "react";

export default function AboutPage() {
  const [copied, setCopied] = useState(false);
  
  const handleEmailClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText("lambda0x63@gmail.com");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      window.location.href = "mailto:lambda0x63@gmail.com";
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-12">
          <div className="mb-6 flex justify-center">
            <Image
              src="/thoth_logo.png"
              alt="THOTH Logo"
              width={64}
              height={64}
              priority
            />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold">About THOTH</h1>
            <Badge variant="outline" className="text-xs">Beta</Badge>
          </div>
          <p className="text-muted-foreground">
            YouTube 영상을 학습 노트로 만들어드립니다
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">왜 만들었나요?</h2>
              <p className="text-sm text-muted-foreground mb-3">
                다른 영상 요약 서비스들을 써보니 너무 복잡하더라고요.
              </p>
              <p className="text-sm text-muted-foreground">
                여러 단계의 설정, 복잡한 옵션들... 그냥 URL 넣고 바로 요약 받고 싶은데 말이죠.
                THOTH는 정말 필요한 기능만 담았습니다. <span className="font-medium">Simple is best.</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-3">이런 분들께 유용해요</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start">
                  <span className="mr-2">📚</span>
                  <span>긴 강의 영상을 빠르게 정리하고 싶은 학생</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💼</span>
                  <span>세미나 내용을 기록으로 남기고 싶은 직장인</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">📝</span>
                  <span>영상 내용을 텍스트로 보관하고 싶은 모든 분</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-6">
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  개인 프로젝트로 베타 운영 중입니다
                </p>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-sm">Made by @lambda0x63</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <a 
                    href="https://github.com/lambda0x63" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-accent rounded-full transition-colors"
                    aria-label="GitHub"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <button
                    onClick={handleEmailClick}
                    className="p-2 hover:bg-accent rounded-full transition-colors relative"
                    aria-label="Email"
                  >
                    <Mail className="h-5 w-5" />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs bg-foreground text-background px-2 py-1 rounded">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  피드백은 언제나 환영합니다 🙂
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}