# -----------------------
# Step 1: Build React app
# -----------------------
FROM node:20-alpine AS builder

# Enable corepack (comes with Node.js)
RUN corepack enable

# Optional: set pnpm version
RUN corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --legacy-peer-deps --ignore-scripts

# Copy source code
COPY . .

# Generate Chakra types
RUN pnpm run typegen

# Build app
RUN pnpm run build


# -----------------------
# Step 2: Serve with Nginx
# -----------------------
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx/nginx_load_balancer.conf /etc/nginx/conf.d/

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]