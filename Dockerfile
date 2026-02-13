# Step 1: Build the React app
FROM node:20 AS builder

# Set working directory
WORKDIR /app

# Install dependencies and build the app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Step 2: Serve the React app using Nginx
FROM nginx:alpine
# Remove the default configuration file

RUN rm /etc/nginx/conf.d/default.conf

# Copy the build output to Nginx's default location

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy your custom Nginx configuration
COPY nginx/nginx_load_balancer.conf /etc/nginx/conf.d/

# Expose port 80 to serve the React app
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]