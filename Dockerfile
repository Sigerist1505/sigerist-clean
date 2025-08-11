# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# instalar deps prod
COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# copiar build y assets que sirves con Express
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/assets ./assets

EXPOSE 3000
CMD ["node", "dist/index.cjs"]
