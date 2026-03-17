# -----------------------
# Step 1: Build React app
# -----------------------
FROM node:20-alpine AS builder


# Use a smaller image (alpine) to reduce base image size

# Set working directory
WORKDIR /app

# Install dependencies using cache optimization
COPY package.json package-lock.json ./

# Install deps without lifecycle scripts so Chakra typegen doesn't run
# before the source tree exists in the image.
RUN npm ci --legacy-peer-deps --ignore-scripts

# Copy rest of the source code
COPY . .

# Generate Chakra types after the source files are available
RUN npm run typegen

# Build the React app
RUN npm run build


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

# Expose port 80
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
