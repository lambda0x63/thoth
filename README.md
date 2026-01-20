# thoth

## 시스템 개요

영역별 기능
- 유튜브 영상 주소 기반 자막 추출 및 요약 데이터 생성
- 실시간 스트리밍 인터페이스 통한 결과 전달
- 이용 횟수 제어 및 속도 제한 로직 (Vercel KV)
- 다국어(한국어 영어) 지원 선택 옵션
- 강의 노트 스타일 마크다운 렌더링

처리 기준
- 유튜브 자막 데이터 파싱 및 텍스트 정제
- 영상 길이 제한 (최대 1시간)
- 데이터 전송 최적화 위한 세그먼트 관리

## 요약 로직

정보 획득
- 내부 엔진을 통한 유튜브 자막 데이터 세그먼트 수집
- 타임스탬프 기반 텍스트 병합 및 정규화
- 접근 권한 및 비공개 영상에 대한 에러 핸들링

구성 체계
- 전체 요약 (영상의 핵심 주제 및 내용)
- 주요 개념 (단위별 중요 용어 및 해설)
- 핵심 통찰 (시사점 및 실질적 활용 방안)
- 기억할 내용 (주요 문구 및 핵심 문장)
- 명사형 종결 어미 적용을 통한 가독성 최적화

## 기술 스택

프레임워크
- Next.js 15 (App Router) TypeScript
- Tailwind CSS v4 Radix UI
- React Markdown Remark GFM

데이터 및 운영
- Vercel KV (Rate Limit 제어)
- Vercel Analytics Speed Insights
- 내부 영상 분석 유틸리티

## 환경설정
```bash
npm install
npm run dev
```

```env
API_ENDPOINT_URL="..."
API_KEY="..."
KV_URL="..."
KV_REST_API_URL="..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```