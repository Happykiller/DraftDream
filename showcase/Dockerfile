# Stage 1: build the static bundle
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using the exact versions pinned in the lockfile.
COPY package.json package-lock.json ./
RUN npm ci

# Copy the remaining project files and build the release dataset and bundle.
COPY . .
RUN npm run build:releases && npm run build

# Stage 2: serve the pre-built assets with nginx.
FROM nginx:1.27-alpine

# Provide a hardened nginx configuration tailored for the static showcase.
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html
COPY --from=builder /app/dist ./

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
