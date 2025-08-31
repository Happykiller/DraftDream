FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
COPY public/ ./
# (optionnel) conf Nginx avec headers + cache
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
