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

# 빌드 인자로 환경 받기 (기본값: prod)
ARG BUILD_ENV=prod

# Next.js 빌드 (프로덕션 모드)
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 환경에 따라 환경 변수 파일 준비 및 빌드 명령 실행
RUN if [ "$BUILD_ENV" = "dev" ]; then \
      # dev 환경: dev 환경 변수 파일이 .yaml 확장자가 아니면 복사
      if [ ! -f "0x00_env/0x02_dev.yaml" ]; then \
        cp 0x00_env/0x02_dev 0x00_env/0x02_dev.yaml 2>/dev/null || true; \
      fi && \
      pnpm run build:dev || pnpm run build; \
    else \
      # prod 환경: prod 환경 변수 파일이 .yaml 확장자가 아니면 복사
      if [ ! -f "0x00_env/0x06_prod.yaml" ]; then \
        cp 0x00_env/0x06_prod 0x00_env/0x06_prod.yaml 2>/dev/null || true; \
      fi && \
      pnpm run build:prod || pnpm run build; \
    fi

# Production 이미지
FROM --platform=linux/amd64 node:20-alpine

WORKDIR /app

# Production 의존성 설치 + TypeScript (next.config.ts 로드에 필요)
COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && \
    pnpm install --prod --frozen-lockfile && \
    pnpm add -D typescript

# 빌드된 파일 복사
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/package.json ./package.json

# 포트 노출 (앱이 사용하는 포트 3040)
EXPOSE 3040

# ENV NODE_ENV=production
# ENV NEXT_TELEMETRY_DISABLED=1
# ENV PORT=3040

# 헬스체크 (3040 포트 기준)
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3040/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 앱 실행
CMD ["pnpm", "start"]





# docker build -t test-frontend .
# docker run -p 3040:3040 test-frontend
