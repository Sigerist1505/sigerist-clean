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

COPY --from=builder /app/package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# build del server y el cliente (vite deja el cliente en dist/public)
COPY --from=builder /app/dist ./dist

# crea carpeta assets (aunque esté vacía) para que el server no falle si la sirve
RUN mkdir -p ./assets

EXPOSE 3000
CMD ["node", "dist/index.cjs"]
