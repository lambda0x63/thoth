export const ERROR_MESSAGES = {
  TRANSCRIPT_UNAVAILABLE: {
    ko: '이 영상은 자막을 제공하지 않습니다. 자막이 있는 영상을 선택해주세요.',
    en: 'This video doesn\'t have captions. Please choose a video with captions available.'
  },
  VIDEO_TOO_LONG: {
    ko: '영상이 너무 깁니다. 1시간 이하의 영상을 선택해주세요.',
    en: 'Video is too long. Please choose a video under 1 hour.'
  },
  VIDEO_PRIVATE: {
    ko: '비공개 영상입니다. 공개된 영상을 선택해주세요.',
    en: 'This is a private video. Please choose a public video.'
  },
  VIDEO_NOT_FOUND: {
    ko: '영상을 찾을 수 없습니다. URL을 확인해주세요.',
    en: 'Video not found. Please check the URL.'
  },
  NETWORK_ERROR: {
    ko: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'Network error occurred. Please try again later.'
  },
  API_ERROR: {
    ko: '요약 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
    en: 'Summary service is temporarily unavailable. Please try again later.'
  },
  RATE_LIMIT: {
    ko: '오늘의 요약 횟수를 모두 사용하셨습니다. 내일 다시 이용해주세요.',
    en: 'Daily limit reached. Please try again tomorrow.'
  },
  INVALID_LANGUAGE: {
    ko: '지원하지 않는 언어입니다.',
    en: 'Unsupported language.'
  },
  UNKNOWN_ERROR: {
    ko: '알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    en: 'An unknown error occurred. Please try again later.'
  }
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;