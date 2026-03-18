# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including devDependencies for building
# Using --legacy-peer-deps as requested by user's environment
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Build TypeScript to JS
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy production dependencies only
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Create logs directory
RUN mkdir -p logs && chown node:node logs

# Use non-root user
USER node

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "dist/index.js"]
