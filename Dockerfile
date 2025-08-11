# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# Instala deps con lockfile para cache estable
COPY package*.json ./
RUN npm ci

# Copia el código y construye (evita seed en build)
COPY . .

# IMPORTANTE: tu script "build" debe generar CJS para Node
# Ej.: esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outfile=dist/index.cjs
# y Vite debe dejar los estáticos en dist/public
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Solo deps de producción
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Copia el build listo para servir
COPY --from=builder /app/dist ./dist

# Railway asigna PORT dinámico; EXPOSE es informativo
EXPOSE 3000

# Arranca el servidor Node (CJS)
CMD ["node", "dist/index.cjs"]
