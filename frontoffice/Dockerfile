# frontoffice\Dockerfile
# -------- Builder (compile le front) --------
FROM node:22-alpine AS builder
WORKDIR /app

# Installe les deps
COPY package*.json ./
RUN npm ci --ignore-scripts

# Build
COPY vite.config.* tsconfig*.json ./
COPY src ./src
COPY public ./public
COPY .env.docker ./.env
COPY index.html ./index.html
RUN npm run build

# -------- Runtime (Nginx qui sert les fichiers statiques) --------
FROM nginx:1.27-alpine AS runtime

# Config Nginx pour SPA (history fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copie le build Vite
COPY --from=builder /app/dist /usr/share/nginx/html

# Healthcheck simple (optionnel)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 CMD wget -qO- http://localhost/ || exit 1

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
