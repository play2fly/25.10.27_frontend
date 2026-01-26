// Next.js는 process.env.NEXT_PUBLIC_* 참조를 빌드 타임에 인라인합니다.
// 반드시 아래와 같이 직접 참조해야 브라우저에서도 값이 반영됩니다.
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://0';
