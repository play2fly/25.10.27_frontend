# Next.js Frontend Dockerfile
# ECS Fargate는 linux/amd64 플랫폼을 사용하므로 명시적으로 지정
FROM --platform=linux/amd64 node:20-alpine AS builder

WORKDIR /app

# 의존성 파일 복사
COPY package*.json ./
COPY pnpm-lock.yaml ./

# pnpm 설치 및 의존성 설치
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# 소스 코드 복사
COPY . .

# Next.js 빌드 (프로덕션 모드)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN pnpm run build:dev || pnpm run build

# Production 이미지
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Production 의존성만 설치
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile

# 빌드된 파일 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json

# 포트 노출 (Next.js 기본 포트 3000)
EXPOSE 3000

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 앱 실행
CMD ["pnpm", "start"]

