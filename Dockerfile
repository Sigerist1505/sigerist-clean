FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm ci --only=production && npm cache clean --force

# Make scripts executable
RUN chmod +x railway-start.sh

# Expose port
EXPOSE 5000

# Start the application
CMD ["./railway-start.sh"]