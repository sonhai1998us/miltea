# ---------- base ----------
    FROM node:20-alpine AS base
    WORKDIR /app
    ENV NODE_ENV=development
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # ---------- deps ----------
    FROM base AS deps
    # Copy lockfile trước để tối ưu cache layer
    COPY package.json package-lock.json ./
    RUN npm ci
    
    # ---------- dev ----------
    FROM deps AS dev
    # Copy mã nguồn (src/, public/, config)
    COPY . .
    # Bật polling để Hot Reload ổn định trong Docker (nhất là trên Windows/Mac)
    ENV WATCHPACK_POLLING=true
    # Expose dev port
    EXPOSE 3000
    CMD ["npm", "run", "dev"]
    
    # ---------- builder (prod) ----------
    FROM deps AS builder
    ENV NODE_ENV=production
    COPY . .
    # Build Next.js (App Router) -> tạo .next/standalone
    RUN npm run build
    
    # ---------- runner (prod) ----------
    FROM node:20-alpine AS runner
    WORKDIR /app
    ENV NODE_ENV=production
    ENV NEXT_TELEMETRY_DISABLED=1
    
    # Tạo user non-root để an toàn hơn
    RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001
    
    # Copy build output (standalone + static)
    # .next/standalone chứa server, node_modules tối thiểu; .next/static phục vụ static assets
    COPY --from=builder /app/.next/standalone ./ 
    COPY --from=builder /app/.next/static ./.next/static
    COPY --from=builder /app/public ./public
    
    # Nếu bạn có env runtime, set ở đây hoặc dùng docker run -e
    # ENV PORT=3000
    EXPOSE 3000
    
    # Chạy bằng non-root user
    USER nextjs
    
    # File server entry (Next standalone) nằm ở ./server.js
    CMD ["node", "server.js"]
    