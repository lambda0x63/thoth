# THOTH

YouTube 영상 요약 서비스

## 기능

- AI 기반 영상 요약 (Gemini 2.0 Flash)
- youtubei.js 자막 추출
- Markdown 렌더링
- Vercel KV Rate Limiting

## 기술 스택

- Next.js 15 (App Router)
- OpenRouter API
- youtubei.js
- Vercel KV (Redis)
- Tailwind CSS v4
- Radix UI

## 설치

```bash
npm install
npm run dev
```

## 환경 변수

```env
OPENROUTER_API_KEY=...
```

## 프로덕션 (Vercel)

```env
OPENROUTER_API_KEY=...
KV_URL=...
KV_REST_API_URL=...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```