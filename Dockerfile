FROM node:20-alpine

WORKDIR /app

# Instalar deps de producción
COPY package*.json ./
RUN npm ci --omit=dev

# Copiar código
COPY . .

# Build (cliente + servidor)
RUN npm run build

# Variables/puerto
ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080

# Arranque del servidor Node (el mismo que npm start)
CMD ["node", "dist/index.js"]
