# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy source
COPY . .

# Build Vite app
# Note: VITE_ env vars must be present at build time for client injection
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy built assets to nginx standard path
COPY --from=builder /app/dist /usr/share/nginx/html

# Add custom nginx config to handle SPA routing if needed
# For now, using default which works for basic SPAs
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
