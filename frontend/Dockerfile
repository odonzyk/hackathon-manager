# --- Build Stage ---
FROM node:20 AS builder

WORKDIR /app
COPY ./package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Production Stage ---
FROM nginx:alpine

# Kopiere den Build aus der Build-Stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Kopiere deine NGINX Config (optional)
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
