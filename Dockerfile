# -----------------------
# Step 1: Build React app
# -----------------------
FROM node:20-alpine AS builder


# Use a smaller image (alpine) to reduce base image size

# Set working directory
WORKDIR /app

# Install dependencies using cache optimization
COPY package.json pnpm-lock.yaml ./

# Install deps without lifecycle scripts so Chakra typegen doesn't run
# before the source tree exists in the image.
RUN pnpm install --legacy-peer-deps --ignore-scripts

# Copy rest of the source code
COPY . .

# Generate Chakra types after the source files are available
RUN pnpm run typegen

# Build the React app
RUN pnpm run build


# -----------------------
# Step 2: Serve with Nginx
# -----------------------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy build output from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx/nginx_load_balancer.conf /etc/nginx/conf.d/

# Copy the entrypoint script that generates /env-config.js at startup.
# This script reads real K8s env vars and writes window._env_ = {...} so
# the React app can read runtime config without rebuilding the image.
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose port 80
EXPOSE 80

# Run the entrypoint: generates env-config.js then starts nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
