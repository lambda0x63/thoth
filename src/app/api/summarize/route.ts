import { NextRequest } from 'next/server';
import { Innertube } from 'youtubei.js/web';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const { url, language = 'ko' } = await request.json();

        // Check rate limit
        const rateLimit = await checkRateLimit(request);
        if (!rateLimit.allowed) {
          const resetDate = new Date(rateLimit.resetTime);
          const hours = Math.ceil((rateLimit.resetTime - Date.now()) / (1000 * 60 * 60));
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: language === 'ko' 
              ? `오늘의 요약 횟수를 모두 사용하셨습니다. ${hours}시간 후에 다시 이용 가능합니다.`
              : `Daily limit reached. Try again in ${hours} hours.`
          })}\n\n`));
          controller.close();
          return;
        }

        if (!url) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: language === 'ko' 
              ? '영상 주소를 입력해주세요' 
              : 'Please enter a video URL'
          })}\n\n`));
          controller.close();
          return;
        }

        // Extract video ID from URL
        const videoId = extractVideoId(url);
        if (!videoId) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: language === 'ko' 
              ? '올바른 YouTube 주소가 아닙니다' 
              : 'Invalid YouTube URL'
          })}\n\n`));
          controller.close();
          return;
        }

        // Send status update
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
          status: language === 'ko' ? '영상의 지혜를 읽는 중...' : 'Reading the wisdom...' 
        })}\n\n`));

        // Initialize YouTube client
        const youtube = await Innertube.create();
        
        try {
          // Get video info
          const info = await youtube.getInfo(videoId);
          
          // Get transcript
          const transcriptData: any = await info.getTranscript();
          
          if (!transcriptData || !transcriptData.transcript || !transcriptData.transcript.content) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: language === 'ko' 
                ? '이 영상의 지혜를 읽을 수 없습니다' 
                : 'Cannot read the wisdom from this video'
            })}\n\n`));
            controller.close();
            return;
          }

          // Extract text from transcript segments
          const segments = transcriptData.transcript.content.body?.initial_segments || [];
          const fullText = segments
            .map((segment: any) => segment.snippet?.text || '')
            .filter((text: string) => text.trim() !== '')
            .join(' ')
            .trim();

          console.log('Transcript length:', fullText.length);
          console.log('First 200 chars:', fullText.substring(0, 200));

          if (!fullText) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: language === 'ko'
                ? '영상에 기록할 내용이 없습니다'
                : 'No content to transcribe'
            })}\n\n`));
            controller.close();
            return;
          }

          const textToSummarize = fullText.substring(0, 8000); // Limit text length

          // Send status update
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            status: language === 'ko' ? '지혜를 기록하는 중...' : 'Transcribing wisdom...' 
          })}\n\n`));

          // Call OpenRouter API with streaming
          const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
          
          if (!OPENROUTER_API_KEY) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: language === 'ko' 
                ? '서비스 설정에 문제가 있습니다' 
                : 'Service configuration error'
            })}\n\n`));
            controller.close();
            return;
          }

          console.log('Calling OpenRouter API...');
          const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': process.env.SITE_URL || 'http://localhost:3000',
              'X-Title': 'Thoth Video Summarizer',
            },
            body: JSON.stringify({
              model: 'google/gemini-2.5-flash',
              messages: [
                {
                  role: 'system',
                  content: language === 'ko' 
                    ? `실제 학생이 강의를 들으면서 노트에 정리하듯이 요약하세요. 명사형 종결어미 사용.

📜 **핵심 요약**
- 전체 내용의 핵심을 2-3문장으로 정리
- 명사형 종결 (~임, ~함, ~이다)

🔑 **주요 개념**
• 중요 개념 1: 설명
• 중요 개념 2: 설명
• 중요 개념 3: 설명
- 각 항목은 간결하게, 핵심만 기록

💡 **핵심 통찰**
- 이 내용에서 얻을 수 있는 중요한 시사점
- 실용적 적용 방안
- 명사형으로 간결하게 정리

📌 **기억할 내용**
- 꼭 기억해야 할 핵심 문장이나 개념
- 있는 그대로 인용하거나 핵심만 정리`
                    : `Summarize like a student taking notes in class. Use concise, factual language.

📜 **Core Summary**
- Main topic in 2-3 sentences
- Focus on key facts and concepts

🔑 **Key Concepts**
• Concept 1: Brief explanation
• Concept 2: Brief explanation  
• Concept 3: Brief explanation
- Keep each point concise and clear

💡 **Main Insights**
- Important implications from the content
- Practical applications
- Key takeaways

📌 **Important Notes**
- Critical facts or quotes to remember
- Exact quotes or summarized key points`
                },
                {
                  role: 'user',
                  content: language === 'ko' 
                    ? `다음 영상 대본을 요약해주세요:\n\n${textToSummarize}`
                    : `Please summarize this video transcript:\n\n${textToSummarize}`
                }
              ],
              stream: true,
              temperature: 0.7,
              max_tokens: 2048
            }),
          });

          console.log('OpenRouter response status:', response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenRouter API error:', errorText);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
              error: `API Error: ${response.status}`
            })}\n\n`));
            controller.close();
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Response body is not readable' })}\n\n`));
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });
              
              // Process complete lines from buffer
              const lines = buffer.split('\n');
              buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
              
              for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip empty lines
                if (!trimmedLine) continue;
                
                // Handle SSE comments (lines starting with :)
                if (trimmedLine.startsWith(':')) {
                  console.log('SSE comment:', trimmedLine);
                  continue;
                }
                
                if (trimmedLine.startsWith('data: ')) {
                  const data = trimmedLine.slice(6);
                  
                  if (data === '[DONE]') {
                    console.log('Stream completed');
                    controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
                    return;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      console.log('Streaming content:', content.substring(0, 50));
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`));
                    }
                  } catch (e) {
                    console.error('JSON parse error for data:', data);
                    console.error('Error:', e);
                  }
                }
              }
            }
            
            // Process any remaining data in buffer
            if (buffer.trim()) {
              console.log('Remaining buffer:', buffer);
            }
          } catch (streamError) {
            console.error('Stream processing error:', streamError);
            throw streamError;
          } finally {
            reader.cancel();
          }
        } catch (error) {
          console.error('Transcript fetch error:', error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ 
            error: language === 'ko' 
              ? '영상을 읽는 중 문제가 발생했습니다' 
              : 'Error reading the video'
          })}\n\n`));
          controller.close();
          return;
        }

        controller.close();
      } catch (error) {
        console.error('Summarization error:', error);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Failed to summarize video' })}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    
    // Check for youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname === '/watch') {
      return urlObj.searchParams.get('v');
    }
    
    // Check for youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    }
    
    // Check for youtube.com/embed/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.pathname.startsWith('/embed/')) {
      return urlObj.pathname.slice(7);
    }
    
    return null;
  } catch (error) {
    return null;
  }
}