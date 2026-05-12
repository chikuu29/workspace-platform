# -----------------------
# Step 1: Build React app
# -----------------------
FROM node:22-alpine AS builder

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy dependency files first for Docker cache optimization
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile --ignore-scripts

# Copy source code
COPY . .

# Generate Chakra UI types
RUN pnpm run typegen

# Build app
RUN pnpm run build


# -----------------------
# Step 2: Serve with Nginx
# -----------------------
FROM nginx:alpine

# Remove default config
RUN rm /etc/nginx/conf.d/default.conf

# Copy React build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx/nginx_load_balancer.conf /etc/nginx/conf.d/default.conf

# Runtime env injection script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Expose nginx port
EXPOSE 80

# Start nginx
ENTRYPOINT ["/docker-entrypoint.sh"]