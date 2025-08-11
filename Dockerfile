# Dockerfile
FROM node:20-alpine

WORKDIR /app

# Instalar deps de producción primero (más cacheable)
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código
COPY . .

# Build
RUN npm run build

ENV NODE_ENV=production
# Usa el mismo puerto que configuraste en Railway (si usas 8080, déjalo así)
ENV PORT=8080
EXPOSE 8080

# ⬇️ IMPORTANTE: arranca el servidor Node de tu build
CMD ["node", "dist/index.js"]
