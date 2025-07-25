# THOTH - YouTube 영상 요약기

🔗 **라이브 데모**: [https://thoth-note.vercel.app](https://thoth-note.vercel.app)

## 기술 스택

- Next.js 15.4.2 (App Router)
- shadcn/ui + Tailwind CSS v4
- OpenRouter API (Gemini 2.5 Flash)
- youtubei.js
- TypeScript
- Vercel KV (Rate Limiting)

## 로컬 실행

```bash
npm install
npm run dev
```

## 환경 변수

### 개발환경 (`.env.local`):
```
OPENROUTER_API_KEY=your_api_key_here
```

### 프로덕션 환경 (Vercel):
```
OPENROUTER_API_KEY=your_api_key_here
KV_URL=your_kv_url_here
KV_REST_API_URL=your_kv_rest_api_url_here  
KV_REST_API_TOKEN=your_kv_rest_api_token_here
KV_REST_API_READ_ONLY_TOKEN=your_kv_rest_api_read_only_token_here
```

## Roadmap

- [x] **Vercel KV 마이그레이션** - 메모리 기반 rate limiting을 Vercel KV로 이전